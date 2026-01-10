import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  MagnifyingGlass,
  ArrowsClockwise,
  CloudArrowUp,
  Database,
  Sparkle,
  Lightning
} from "@phosphor-icons/react";
import { CodeBlock } from "./CodeBlock";
import { toast } from "sonner";

interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  created_at: string;
}

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, any>;
}

interface EmbeddingModel {
  id: string;
  name: string;
  provider: string;
  dimensions: number;
  cost_per_1m: number;
  /** Which API endpoint to use: 'openrouter' or 'openai' */
  endpoint: 'openrouter' | 'openai';
}

const EMBEDDING_MODELS: EmbeddingModel[] = [
  { id: "together/baai/bge-large-en-v1.5", name: "BGE Large EN (Together AI)", provider: "OpenRouter", dimensions: 1024, cost_per_1m: 0.01, endpoint: "openrouter" },
  { id: "text-embedding-3-small", name: "OpenAI Embeddings Small", provider: "OpenAI", dimensions: 1536, cost_per_1m: 0.02, endpoint: "openai" },
  { id: "text-embedding-3-large", name: "OpenAI Embeddings Large", provider: "OpenAI", dimensions: 3072, cost_per_1m: 0.13, endpoint: "openai" },
  { id: "text-embedding-ada-002", name: "OpenAI Ada 002", provider: "OpenAI", dimensions: 1536, cost_per_1m: 0.10, endpoint: "openai" },
];

export function SupabaseVectorRAG() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("together/baai/bge-large-en-v1.5");
  
  const [documentText, setDocumentText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedModelInfo = EMBEDDING_MODELS.find(m => m.id === selectedModel);

  const generateEmbedding = async (text: string, model: string) => {
    const modelInfo = EMBEDDING_MODELS.find(m => m.id === model);
    
    if (modelInfo?.endpoint === "openrouter") {
      if (!openrouterKey) {
        throw new Error("OpenRouter API key required for Together AI models");
      }

      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Supabase Vector RAG"
        },
        body: JSON.stringify({
          model,
          input: text
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate embedding via OpenRouter");
      }

      const data = await response.json();
      return data.data[0].embedding;
    }
    
    // Default to OpenAI
    if (!openaiKey) {
      throw new Error("OpenAI API key required");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate embedding");
    }

    const data = await response.json();
    return data.data[0].embedding;
  };

  const storeDocument = async () => {
    if (!documentText.trim()) {
      toast.error("Please enter document content");
      return;
    }
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Please configure Supabase credentials");
      return;
    }
    
    const modelInfo = EMBEDDING_MODELS.find(m => m.id === selectedModel);
    if (modelInfo?.endpoint === "openrouter" && !openrouterKey) {
      toast.error("Please enter OpenRouter API key for Together AI models");
      return;
    }
    if (modelInfo?.endpoint === "openai" && !openaiKey) {
      toast.error("Please enter OpenAI API key");
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      setProgress(30);
      const embedding = await generateEmbedding(documentText, selectedModel);
      
      setProgress(60);
      const response = await fetch(`${supabaseUrl}/rest/v1/rag_vectors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          content: documentText,
          embedding,
          metadata: {
            timestamp: new Date().toISOString(),
            model: selectedModel
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to store document");
      }

      const result = await response.json();
      setProgress(100);
      
      toast.success("Document stored successfully!");
      setDocumentText("");
      loadDocuments();
    } catch (error: any) {
      toast.error(error.message || "Failed to store document");
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const semanticSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Please configure Supabase credentials");
      return;
    }
    
    const modelInfo = EMBEDDING_MODELS.find(m => m.id === selectedModel);
    if (modelInfo?.endpoint === "openrouter" && !openrouterKey) {
      toast.error("Please enter OpenRouter API key for Together AI models");
      return;
    }
    if (modelInfo?.endpoint === "openai" && !openaiKey) {
      toast.error("Please enter OpenAI API key");
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const queryEmbedding = await generateEmbedding(searchQuery, selectedModel);

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: similarityThreshold,
          match_count: topK
        })
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const results = await response.json();
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No results found. Try adjusting the similarity threshold.");
      } else {
        toast.success(`Found ${results.length} matching documents`);
      }
    } catch (error: any) {
      toast.error(error.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const loadDocuments = async () => {
    if (!supabaseUrl || !supabaseKey) return;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rag_vectors?select=*&order=created_at.desc&limit=5`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      loadDocuments();
    }
  }, [supabaseUrl, supabaseKey]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase pgvector RAG</CardTitle>
          <CardDescription>
            Real-time document storage with semantic search using vector embeddings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database size={16} />
                  pgvector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL vector extension for similarity search
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkle size={16} />
                  Live Embeddings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate embeddings on-the-fly with OpenAI
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MagnifyingGlass size={16} />
                  Semantic Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find relevant documents by meaning, not keywords
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightning size={16} />
                  Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Instant indexing and sub-second search responses
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Supabase Project URL</Label>
                <Input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Supabase Service Key</Label>
                <Input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>OpenRouter API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Embedding Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMBEDDING_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - ${model.cost_per_1m.toFixed(3)}/1M
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelInfo && (
                  <p className="text-xs text-muted-foreground">
                    {selectedModelInfo.dimensions} dimensions • {selectedModelInfo.provider}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Storage</CardTitle>
          <CardDescription>
            Store documents with automatic embedding generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Content</Label>
            <Textarea
              placeholder="Enter text to store with vector embedding..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{documentText.length} characters</span>
              {documentText.length > 0 && selectedModelInfo && (
                <span>
                  Est. cost: ${((documentText.length / 1000000) * selectedModelInfo.cost_per_1m).toFixed(6)}
                </span>
              )}
            </div>
          </div>

          {processing && progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress < 40 ? "Generating embedding..." : progress < 80 ? "Storing in Supabase..." : "Complete!"}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={storeDocument} 
            disabled={processing || !documentText.trim()}
            className="w-full"
          >
            {processing ? (
              <>
                <ArrowsClockwise className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              <>
                <CloudArrowUp className="mr-2" size={16} />
                Store Document with Embedding
              </>
            )}
          </Button>

          {documents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recent Documents ({documents.length})</Label>
                <Button variant="ghost" size="sm" onClick={loadDocuments}>
                  <ArrowsClockwise size={14} />
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-3">
                    <p className="text-sm line-clamp-2">{doc.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {doc.content.length} chars
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semantic Search</CardTitle>
          <CardDescription>
            Find relevant documents using vector similarity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Query</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && semanticSearch()}
              />
              <Button onClick={semanticSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? (
                  <ArrowsClockwise className="animate-spin" size={16} />
                ) : (
                  <MagnifyingGlass size={16} />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Top K Results</Label>
              <Select value={topK.toString()} onValueChange={(v) => setTopK(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 20].map((k) => (
                    <SelectItem key={k} value={k.toString()}>
                      {k} results
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Similarity Threshold</Label>
              <Select value={similarityThreshold.toString()} onValueChange={(v) => setSimilarityThreshold(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0.5, 0.6, 0.7, 0.8, 0.9].map((t) => (
                    <SelectItem key={t} value={t.toString()}>
                      {t} ({t === 0.5 ? "Relaxed" : t === 0.7 ? "Balanced" : t === 0.9 ? "Strict" : "Custom"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Search Results</Label>
                <Badge>{searchResults.length} found</Badge>
              </div>
              <div className="space-y-3">
                {searchResults.map((result, idx) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">#{idx + 1}</Badge>
                          <Badge 
                            className={
                              result.similarity > 0.9 ? "bg-green-500/20 text-green-400" :
                              result.similarity > 0.8 ? "bg-blue-500/20 text-blue-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {(result.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-sm">{result.content}</p>
                        {result.metadata && (
                          <div className="flex items-center gap-2 mt-2">
                            {result.metadata.timestamp && (
                              <Badge variant="outline" className="text-xs">
                                {new Date(result.metadata.timestamp).toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <Alert>
              <AlertDescription>
                No results found. Try adjusting the similarity threshold or using different search terms.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL Schema</CardTitle>
          <CardDescription>
            Setup instructions for Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            language="sql"
            code={`-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vectors table
CREATE TABLE rag_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(${selectedModelInfo?.dimensions || 1536}),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster similarity search
CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Semantic search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(${selectedModelInfo?.dimensions || 1536}),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_vectors.id,
    rag_vectors.content,
    1 - (rag_vectors.embedding <=> query_embedding) AS similarity,
    rag_vectors.metadata,
    rag_vectors.created_at
  FROM rag_vectors
  WHERE 1 - (rag_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional)
ALTER TABLE rag_vectors ENABLE ROW LEVEL SECURITY;

-- Policy for public access (adjust as needed)
CREATE POLICY "Allow public read access" ON rag_vectors
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON rag_vectors
  FOR INSERT WITH CHECK (true);`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
