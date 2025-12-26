import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Globe, 
  Database, 
  Brain, 
  Play, 
  Code,
  CheckCircle,
  ArrowRight,
  Sparkle,
  FileText,
  MagnifyingGlass,
  Download,
  Warning
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { 
  OxylabsClient, 
  SupabaseVectorClient, 
  LiteLLMClient, 
  chunkText 
} from "@/lib/api-clients";

interface RAGStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  icon: any;
  result?: any;
}

export function RAGDemo() {
  const [url, setUrl] = useState("https://docs.litellm.ai/docs/");
  const [query, setQuery] = useState("How do I use LiteLLM with OpenRouter?");
  const [llmProvider, setLLMProvider] = useState("openrouter/anthropic/claude-3.5-sonnet");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liveMode, setLiveMode] = useState(false);
  
  const [apiKeys, setApiKeys] = useState({
    oxylabs: "",
    supabaseUrl: "",
    supabaseKey: "",
  });
  
  const [steps, setSteps] = useState<RAGStep[]>([
    { id: 'scrape', name: 'Web Scraping (Oxylabs)', status: 'pending', icon: Globe },
    { id: 'embed', name: 'Generate Embeddings', status: 'pending', icon: Sparkle },
    { id: 'store', name: 'Store in Supabase', status: 'pending', icon: Database },
    { id: 'retrieve', name: 'Vector Search', status: 'pending', icon: MagnifyingGlass },
    { id: 'generate', name: 'Generate Answer (LiteLLM)', status: 'pending', icon: Brain }
  ]);

  const [scrapedContent, setScrapedContent] = useState("");
  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  const [retrievedChunks, setRetrievedChunks] = useState<string[]>([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const updateStep = (id: string, status: RAGStep['status'], result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, result } : step
    ));
  };

  const simulateStep = (stepId: string, delay: number): Promise<any> => {
    return new Promise((resolve) => {
      updateStep(stepId, 'running');
      setTimeout(() => {
        updateStep(stepId, 'complete');
        resolve(null);
      }, delay);
    });
  };

  const runRAGPipeline = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const, result: undefined })));
      
      if (liveMode) {
        await runLiveRAGPipeline();
      } else {
        await runDemoRAGPipeline();
      }

      const code = generateImplementationCode();
      setGeneratedCode(code);

    } catch (error) {
      toast.error(`Error in RAG pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const runLiveRAGPipeline = async () => {
    try {
      toast.info("Step 1: Scraping web content with Oxylabs...");
      updateStep('scrape', 'running');
      setProgress(10);

      if (!apiKeys.oxylabs) {
        throw new Error("Oxylabs API key not configured");
      }

      const oxyClient = new OxylabsClient({ apiKey: apiKeys.oxylabs });
      const scrapeResult = await oxyClient.scrapeUrl(url);
      
      setScrapedContent(scrapeResult.content);
      updateStep('scrape', 'complete');
      toast.success("Web content scraped successfully!");
      setProgress(25);

      toast.info("Step 2: Chunking and generating embeddings...");
      updateStep('embed', 'running');
      
      const chunks = chunkText(scrapeResult.content, 500, 50);
      const llmClient = new LiteLLMClient({ provider: llmProvider });
      
      const embeddingsList: number[][] = [];
      for (const chunk of chunks.slice(0, 5)) {
        const embResult = await llmClient.generateEmbedding(chunk);
        embeddingsList.push(embResult.embedding);
      }
      
      setEmbeddings(embeddingsList);
      updateStep('embed', 'complete');
      toast.success("Embeddings generated!");
      setProgress(50);

      if (apiKeys.supabaseUrl && apiKeys.supabaseKey) {
        toast.info("Step 3: Storing in Supabase vector database...");
        updateStep('store', 'running');
        
        const supaClient = new SupabaseVectorClient({
          url: apiKeys.supabaseUrl,
          key: apiKeys.supabaseKey,
        });
        
        await supaClient.storeEmbeddings(
          chunks.slice(0, 5),
          embeddingsList,
          { source: url, scrapedAt: scrapeResult.metadata.scrapedAt }
        );
        
        updateStep('store', 'complete');
        toast.success("Stored in vector database!");
        setProgress(65);

        toast.info("Step 4: Performing similarity search...");
        updateStep('retrieve', 'running');
        
        const queryEmbResult = await llmClient.generateEmbedding(query);
        const searchResults = await supaClient.searchSimilar(queryEmbResult.embedding, 0.7, 3);
        
        const retrievedTexts = searchResults.map(r => r.content);
        setRetrievedChunks(retrievedTexts);
        updateStep('retrieve', 'complete');
        toast.success("Retrieved relevant chunks!");
        setProgress(85);
      } else {
        updateStep('store', 'complete');
        updateStep('retrieve', 'complete');
        setRetrievedChunks(chunks.slice(0, 3));
        setProgress(85);
        toast.info("Skipping Supabase (not configured) - using local chunks");
      }

      toast.info("Step 5: Generating answer with LLM...");
      updateStep('generate', 'running');
      
      const contextText = retrievedChunks.join('\n\n');
      const answer = await llmClient.complete([
        {
          role: 'system',
          content: 'You are a helpful assistant. Answer questions based on the provided context.',
        },
        {
          role: 'user',
          content: `Context:\n${contextText}\n\nQuestion: ${query}`,
        },
      ]);
      
      setFinalAnswer(answer);
      updateStep('generate', 'complete');
      toast.success("RAG pipeline complete!");
      setProgress(100);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Live API error: ${errorMsg}`);
      throw error;
    }
  };

  const runDemoRAGPipeline = async () => {
    toast.info("Step 1: Scraping web content...");
      setProgress(20);
      await simulateStep('scrape', 2000);
      
      const mockScrapedContent = `# LiteLLM Documentation

LiteLLM is a unified interface to call 100+ LLM APIs using the OpenAI format.

## Using LiteLLM with OpenRouter

To use LiteLLM with OpenRouter:

1. Install LiteLLM: \`pip install litellm\`
2. Set your OpenRouter API key: \`export OPENROUTER_API_KEY="your-key"\`
3. Call models using the format: \`openrouter/<provider>/<model>\`

Example:
\`\`\`python
from litellm import completion

response = completion(
    model="openrouter/anthropic/claude-3-opus",
    messages=[{"role": "user", "content": "Hello!"}]
)
\`\`\`

## Key Features

- Unified API across 100+ providers
- Automatic retries and fallbacks
- Cost tracking and budgets
- Load balancing
- Streaming support
`;
      
      setScrapedContent(mockScrapedContent);
      toast.success("Web content scraped successfully!");

      toast.info("Step 2: Generating embeddings...");
      setProgress(40);
      await simulateStep('embed', 1500);
      
      const mockEmbeddings = [
        Array(8).fill(0).map(() => Math.random()),
        Array(8).fill(0).map(() => Math.random()),
        Array(8).fill(0).map(() => Math.random())
      ];
      setEmbeddings(mockEmbeddings);
      toast.success("Embeddings generated!");

      toast.info("Step 3: Storing embeddings in Supabase...");
      setProgress(60);
      await simulateStep('store', 1000);
      toast.success("Stored in vector database!");

      toast.info("Step 4: Performing similarity search...");
      setProgress(80);
      await simulateStep('retrieve', 1500);
      
      const mockRetrievedChunks = [
        "To use LiteLLM with OpenRouter: Install LiteLLM, set OPENROUTER_API_KEY, and call models using openrouter/<provider>/<model> format.",
        "Example: completion(model='openrouter/anthropic/claude-3-opus', messages=[...])",
        "Key features include unified API, automatic retries, cost tracking, and load balancing."
      ];
      setRetrievedChunks(mockRetrievedChunks);
      toast.success("Retrieved relevant chunks!");

      toast.info("Step 5: Generating answer with LLM...");
      setProgress(100);
      await simulateStep('generate', 2000);
      
      const mockAnswer = `Based on the documentation, here's how to use LiteLLM with OpenRouter:

**Setup Steps:**
1. Install LiteLLM: \`pip install litellm\`
2. Set your OpenRouter API key as an environment variable: \`export OPENROUTER_API_KEY="your-key"\`
3. Use the format \`openrouter/<provider>/<model>\` when making calls

**Example Code:**
\`\`\`python
from litellm import completion

response = completion(
    model="openrouter/anthropic/claude-3-opus",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response)
\`\`\`

**Key Benefits:**
- Unified interface across 100+ LLM providers
- Automatic retry logic and fallback mechanisms
- Built-in cost tracking and budget management
- Load balancing for high availability
- Full streaming support

This integration allows you to access OpenRouter's model marketplace through LiteLLM's standardized interface.`;
      
      setFinalAnswer(mockAnswer);
      toast.success("RAG pipeline complete!");
  };

  const generateImplementationCode = () => {
    return `"""
End-to-End RAG Pipeline: Oxylabs + Supabase + LiteLLM
"""
import os
from typing import List
from litellm import completion, embedding
from supabase import create_client, Client

# Step 1: Initialize Clients
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"]
)

# Step 2: Scrape Web Content (Oxylabs AI Studio)
def scrape_content(url: str) -> str:
    """
    Use Oxylabs AI Studio to scrape and extract content
    """
    # In production, use: oxylabs-ai-studio-py SDK
    # For demo, using simplified approach
    import requests
    
    response = requests.post(
        "https://ai-studio.oxylabs.io/api/scrape",
        json={
            "url": url,
            "extract": "main_content",
            "format": "markdown"
        },
        headers={"Authorization": f"Bearer {os.environ['OXYLABS_API_KEY']}"}
    )
    
    return response.json()["content"]

# Step 3: Chunk and Embed Content
def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    """Split text into chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks

def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generate embeddings using LiteLLM"""
    embeddings_list = []
    
    for chunk in chunks:
        response = embedding(
            model="text-embedding-3-small",
            input=[chunk]
        )
        embeddings_list.append(response.data[0]["embedding"])
    
    return embeddings_list

# Step 4: Store in Supabase Vector Database
def store_embeddings(chunks: List[str], embeddings: List[List[float]]):
    """Store chunks and embeddings in Supabase"""
    for chunk, emb in zip(chunks, embeddings):
        supabase.table("documents").insert({
            "content": chunk,
            "embedding": emb,
            "metadata": {"source": "${url}"}
        }).execute()

# Step 5: Vector Search
def search_similar(query: str, top_k: int = 3) -> List[str]:
    """Perform similarity search"""
    # Generate query embedding
    query_response = embedding(
        model="text-embedding-3-small",
        input=[query]
    )
    query_embedding = query_response.data[0]["embedding"]
    
    # Search in Supabase using pgvector
    result = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": 0.7,
            "match_count": top_k
        }
    ).execute()
    
    return [doc["content"] for doc in result.data]

# Step 6: Generate Answer with LiteLLM
def generate_answer(query: str, context: List[str]) -> str:
    """Generate answer using retrieved context"""
    context_text = "\\n\\n".join(context)
    
    response = completion(
        model="${llmProvider}",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer questions based on the provided context."
            },
            {
                "role": "user",
                "content": f"Context:\\n{context_text}\\n\\nQuestion: {query}"
            }
        ],
        temperature=0.7
    )
    
    return response.choices[0].message.content

# Full RAG Pipeline
def rag_pipeline(url: str, query: str) -> str:
    """Complete RAG pipeline"""
    print("🌐 Step 1: Scraping content...")
    content = scrape_content(url)
    
    print("📝 Step 2: Chunking text...")
    chunks = chunk_text(content)
    
    print("✨ Step 3: Generating embeddings...")
    embeddings = generate_embeddings(chunks)
    
    print("💾 Step 4: Storing in Supabase...")
    store_embeddings(chunks, embeddings)
    
    print("🔍 Step 5: Searching for relevant context...")
    relevant_chunks = search_similar(query)
    
    print("🤖 Step 6: Generating answer...")
    answer = generate_answer(query, relevant_chunks)
    
    return answer

# Run the pipeline
if __name__ == "__main__":
    url = "${url}"
    query = "${query}"
    
    answer = rag_pipeline(url, query)
    print(f"\\n{'='*50}")
    print("Answer:")
    print(answer)
`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkle size={24} weight="duotone" className="text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">End-to-End RAG Demo</h2>
            <p className="text-muted-foreground mb-4">
              Complete Retrieval-Augmented Generation pipeline combining Oxylabs web scraping, 
              Supabase vector storage, and LiteLLM for intelligent question answering.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Globe size={14} weight="duotone" />
                Oxylabs Scraping
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Database size={14} weight="duotone" />
                Supabase Vector DB
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Brain size={14} weight="duotone" />
                LiteLLM Gateway
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="code">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Configure RAG Pipeline</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Source URL to Scrape</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://docs.example.com"
                  disabled={isRunning}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Oxylabs will scrape and extract content from this URL
                </p>
              </div>

              <div>
                <Label htmlFor="query">Your Question</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about the content..."
                  rows={3}
                  disabled={isRunning}
                />
              </div>

              <div>
                <Label htmlFor="llm">LLM Provider (via LiteLLM)</Label>
                <Select value={llmProvider} onValueChange={setLLMProvider} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter/anthropic/claude-3.5-sonnet">
                      OpenRouter → Claude 3.5 Sonnet
                    </SelectItem>
                    <SelectItem value="openrouter/openai/gpt-4o">
                      OpenRouter → GPT-4o
                    </SelectItem>
                    <SelectItem value="openai/gpt-4o-mini">
                      OpenAI → GPT-4o Mini
                    </SelectItem>
                    <SelectItem value="anthropic/claude-3-haiku-20240307">
                      Anthropic → Claude 3 Haiku
                    </SelectItem>
                    <SelectItem value="deepseek/deepseek-chat">
                      DeepSeek → DeepSeek Chat
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="live-mode" className="font-semibold">Live API Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect to real Oxylabs, Supabase, and LiteLLM APIs
                  </p>
                </div>
                <Switch
                  id="live-mode"
                  checked={liveMode}
                  onCheckedChange={setLiveMode}
                  disabled={isRunning}
                />
              </div>

              {liveMode && (
                <Card className="p-4 border-accent/20 bg-accent/5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Warning size={18} className="text-accent" />
                    API Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="oxylabs-key" className="text-xs">Oxylabs API Key</Label>
                      <Input
                        id="oxylabs-key"
                        type="password"
                        value={apiKeys.oxylabs}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, oxylabs: e.target.value }))}
                        placeholder="Enter your Oxylabs API key"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supabase-url" className="text-xs">Supabase URL</Label>
                      <Input
                        id="supabase-url"
                        value={apiKeys.supabaseUrl}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                        placeholder="https://your-project.supabase.co"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supabase-key" className="text-xs">Supabase Anon Key</Label>
                      <Input
                        id="supabase-key"
                        type="password"
                        value={apiKeys.supabaseKey}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, supabaseKey: e.target.value }))}
                        placeholder="Enter your Supabase anon key"
                        className="mt-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      LLM calls will use the built-in Spark LLM API
                    </p>
                  </div>
                </Card>
              )}

              <Alert>
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={liveMode ? "secondary" : "default"}>
                      {liveMode ? "Live API Mode" : "Demo Mode"}
                    </Badge>
                  </div>
                  {liveMode ? (
                    "Connected to live APIs. Oxylabs will scrape real content, and results will be stored in your Supabase database."
                  ) : (
                    "Using simulated data for demonstration. Enable Live API mode to connect real services."
                  )}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={runRAGPipeline} 
                disabled={isRunning}
                size="lg"
                className="w-full gap-2"
              >
                {isRunning ? (
                  <>Running Pipeline...</>
                ) : (
                  <>
                    <Play size={20} weight="fill" />
                    Run RAG Pipeline
                  </>
                )}
              </Button>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          </Card>

          {/* Pipeline Steps */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Pipeline Execution</h3>
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      step.status === 'complete' ? 'bg-green-500/20 text-green-500' :
                      step.status === 'running' ? 'bg-accent text-accent-foreground animate-pulse' :
                      step.status === 'error' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'complete' ? (
                        <CheckCircle size={20} weight="fill" />
                      ) : (
                        <Icon size={20} weight="duotone" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          Step {idx + 1}
                        </span>
                        {idx < steps.length - 1 && (
                          <ArrowRight size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-semibold">{step.name}</h4>
                      <Badge variant={
                        step.status === 'complete' ? 'default' :
                        step.status === 'running' ? 'secondary' :
                        'outline'
                      } className="mt-1">
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Results */}
          {scrapedContent && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText size={24} weight="duotone" />
                Scraped Content
              </h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-64 overflow-auto">
                <pre className="whitespace-pre-wrap">{scrapedContent.substring(0, 500)}...</pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {scrapedContent.length} characters scraped and processed into {embeddings.length} chunks
              </p>
            </Card>
          )}

          {retrievedChunks.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MagnifyingGlass size={24} weight="duotone" />
                Retrieved Context
              </h3>
              <div className="space-y-2">
                {retrievedChunks.map((chunk, idx) => (
                  <div key={idx} className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Chunk {idx + 1}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Similarity: {(0.85 - idx * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm">{chunk}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {finalAnswer && (
            <Card className="p-6 border-accent">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain size={24} weight="duotone" className="text-accent" />
                Generated Answer
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="bg-gradient-to-br from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20">
                  <pre className="whitespace-pre-wrap font-sans">{finalAnswer}</pre>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={16} weight="fill" className="text-green-500" />
                Answer generated using {llmProvider}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">RAG Architecture</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Globe size={20} weight="duotone" className="text-blue-500" />
                  1. Web Scraping Layer (Oxylabs)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>AI-powered web scraping with natural language prompts</li>
                  <li>Automatic content extraction and cleaning</li>
                  <li>Markdown formatting for LLM consumption</li>
                  <li>Handles dynamic JavaScript content</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Sparkle size={20} weight="duotone" className="text-purple-500" />
                  2. Embedding Generation
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Text chunking with semantic boundaries</li>
                  <li>Generate vector embeddings (1536-dim)</li>
                  <li>Use OpenAI text-embedding-3-small or alternatives</li>
                  <li>Batch processing for efficiency</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Database size={20} weight="duotone" className="text-green-500" />
                  3. Vector Storage (Supabase + pgvector)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>PostgreSQL with pgvector extension</li>
                  <li>Efficient similarity search with HNSW indexing</li>
                  <li>Metadata filtering and hybrid search</li>
                  <li>Built-in authentication and RLS</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <MagnifyingGlass size={20} weight="duotone" className="text-orange-500" />
                  4. Retrieval Layer
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Cosine similarity search</li>
                  <li>Configurable top-k results</li>
                  <li>Re-ranking for relevance optimization</li>
                  <li>Context window management</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Brain size={20} weight="duotone" className="text-accent" />
                  5. Generation Layer (LiteLLM)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Unified interface to 100+ LLM providers</li>
                  <li>Automatic fallbacks and retries</li>
                  <li>Cost tracking and optimization</li>
                  <li>Streaming responses for better UX</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Data Flow</h3>
            <div className="font-mono text-sm bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">1.</span>
                <span>User provides URL + Question</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">2.</span>
                <span>Oxylabs scrapes and cleans content</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">3.</span>
                <span>Content chunked into semantic blocks</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">4.</span>
                <span>Generate embeddings for each chunk</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">5.</span>
                <span>Store chunks + embeddings in Supabase</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">6.</span>
                <span>Query embedding generated from user question</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">7.</span>
                <span>Vector similarity search retrieves top-k chunks</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">8.</span>
                <span>LiteLLM generates answer from context</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <ArrowRight size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">9.</span>
                <span>Stream response to user</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Code size={24} weight="duotone" />
                Production Implementation
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode || generateImplementationCode());
                  toast.success("Code copied to clipboard!");
                }}
                className="gap-2"
              >
                <Download size={16} />
                Copy Code
              </Button>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm font-mono">
                <code>{generatedCode || generateImplementationCode()}</code>
              </pre>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Environment Setup</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground"># .env file</div>
                <div>OXYLABS_API_KEY=your_oxylabs_key</div>
                <div>SUPABASE_URL=https://your-project.supabase.co</div>
                <div>SUPABASE_KEY=your_supabase_anon_key</div>
                <div>OPENROUTER_API_KEY=your_openrouter_key</div>
                <div>OPENAI_API_KEY=your_openai_key</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Supabase Schema</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Similarity search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;`}</pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
