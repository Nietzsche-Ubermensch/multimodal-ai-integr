import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Scissors,
  ChartBar,
  Play,
  Download,
  Copy,
  CheckCircle
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { DocumentChunker, ChunkConfig, ChunkingResult, DocumentChunk } from "@/lib/documentChunker";
import { CodeBlock } from "./CodeBlock";

const SAMPLE_TEXTS = {
  short: `Artificial Intelligence (AI) is intelligence demonstrated by machines. It has become an essential part of the technology industry.

AI research includes areas such as machine learning, natural language processing, and computer vision. These technologies power many modern applications.

The field continues to evolve rapidly with new breakthroughs happening regularly.`,
  
  medium: `# Introduction to Large Language Models

Large Language Models (LLMs) represent a significant breakthrough in artificial intelligence. These models are trained on vast amounts of text data and can generate human-like responses to prompts.

## How LLMs Work

LLMs use transformer architecture, which allows them to process and generate text by understanding context and relationships between words. The attention mechanism is key to their success.

### Training Process

The training of LLMs involves:
- Pre-training on massive text corpora
- Fine-tuning on specific tasks
- Alignment through techniques like RLHF

## Applications

LLMs power various applications including:
- Chatbots and virtual assistants
- Code generation and debugging
- Content creation and summarization
- Translation and language understanding

## Challenges

Despite their capabilities, LLMs face several challenges:
1. Hallucinations and factual errors
2. Bias in training data
3. Computational costs
4. Environmental impact

## Future Directions

The future of LLMs includes improvements in efficiency, reasoning capabilities, and multimodal understanding. Research continues to address current limitations while expanding possibilities.`,
  
  long: `# Comprehensive Guide to Retrieval-Augmented Generation (RAG)

## Introduction

Retrieval-Augmented Generation (RAG) is an advanced AI technique that combines the power of large language models with external knowledge retrieval. This approach addresses key limitations of traditional language models by grounding responses in factual, up-to-date information.

## The RAG Architecture

### Components

RAG systems consist of several core components working in harmony:

1. **Document Ingestion Pipeline**: Processes raw documents and prepares them for storage
2. **Vector Database**: Stores document embeddings for efficient similarity search
3. **Retrieval System**: Finds relevant documents based on query similarity
4. **Generation Model**: Produces answers using retrieved context
5. **Orchestration Layer**: Coordinates the entire process

### How It Works

The RAG process follows these steps:

First, documents are processed and split into manageable chunks. Each chunk is converted into a numerical representation (embedding) using an embedding model. These embeddings are stored in a vector database.

When a user submits a query, it's converted into an embedding using the same model. The system then searches the vector database for chunks with embeddings similar to the query embedding.

The most relevant chunks are retrieved and provided as context to the language model, which generates a response incorporating this information.

## Document Chunking Strategies

Effective chunking is crucial for RAG performance. Several strategies exist:

### Fixed-Size Chunking

This approach divides text into chunks of predetermined size. While simple, it may break semantic units.

### Semantic Chunking

Documents are split based on semantic boundaries like paragraphs or sections. This preserves meaning and context.

### Recursive Chunking

Uses a hierarchy of separators to split text intelligently, maintaining natural language structure.

### Markdown-Aware Chunking

Preserves markdown formatting and structure, keeping headers with their content.

## Embedding Models

The choice of embedding model significantly impacts RAG quality:

### Dense Embeddings

Models like OpenAI's text-embedding-3 series and open-source alternatives create rich semantic representations. They capture nuanced meaning but require more storage.

### Sparse Embeddings

Techniques like BM25 use keyword matching. They're faster but less semantically aware.

### Hybrid Approaches

Combining dense and sparse embeddings often yields the best results, balancing semantic understanding with keyword precision.

## Vector Databases

Vector databases enable efficient similarity search at scale:

### Popular Options

- **Pinecone**: Managed service with excellent performance
- **Weaviate**: Open-source with advanced features
- **Chroma**: Simple and developer-friendly
- **Qdrant**: Fast and feature-rich
- **pgvector**: PostgreSQL extension for existing databases

### Key Features

Good vector databases provide:
- Fast approximate nearest neighbor search
- Metadata filtering
- Hybrid search capabilities
- Scalability and performance
- Easy integration

## Retrieval Strategies

### Top-K Retrieval

Select the K most similar documents. Simple but effective.

### MMR (Maximal Marginal Relevance)

Balances relevance with diversity to avoid redundant results.

### Multi-Query Retrieval

Generate multiple variations of the query to improve recall.

### Hybrid Search

Combine vector similarity with keyword matching for robust retrieval.

## Optimization Techniques

### Chunk Size Optimization

Experiment with different chunk sizes. Smaller chunks provide precise answers, while larger chunks offer more context.

### Overlap Configuration

Adding overlap between chunks ensures important information isn't lost at boundaries.

### Metadata Enrichment

Add metadata like source, date, and category to enable filtering and improve relevance.

### Re-ranking

Use a secondary model to reorder retrieved documents, improving precision.

## Challenges and Solutions

### Hallucination Prevention

RAG reduces hallucinations by grounding responses in retrieved facts. Citation and source attribution further enhance trustworthiness.

### Context Window Limitations

Smart chunking and retrieval ensure relevant information fits within the model's context window.

### Latency Optimization

Caching embeddings and using efficient vector databases minimize response time.

### Quality Assurance

Implement monitoring, logging, and evaluation to maintain system quality.

## Advanced Topics

### Multi-Modal RAG

Extend RAG to images, audio, and video by using appropriate embedding models and retrieval mechanisms.

### Agentic RAG

Combine RAG with agent frameworks for complex, multi-step reasoning and tool use.

### Fine-Tuning

Customize embedding and generation models for domain-specific applications.

## Best Practices

1. **Choose the right chunk size**: Balance precision and context
2. **Use quality embeddings**: Invest in good embedding models
3. **Implement caching**: Cache frequent queries and embeddings
4. **Monitor performance**: Track metrics like relevance and latency
5. **Iterate and improve**: Continuously test and refine your approach

## Conclusion

RAG represents a powerful paradigm for building AI applications that combine the generative capabilities of LLMs with the reliability of knowledge retrieval. By understanding and implementing these techniques, developers can create more accurate, trustworthy, and useful AI systems.

The field continues to evolve, with new techniques and optimizations emerging regularly. Staying informed and experimenting with different approaches will help you build cutting-edge RAG applications.`
};

export function DocumentChunkingDemo() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS.medium);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [strategy, setStrategy] = useState<ChunkConfig['strategy']>('recursive');
  
  const [chunkingResult, setChunkingResult] = useState<ChunkingResult | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChunk = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const chunker = new DocumentChunker({
        chunkSize,
        chunkOverlap,
        strategy,
        keepSeparator: true,
        minChunkSize: 50,
        maxChunkSize: chunkSize * 2
      });

      const result = chunker.chunk(inputText, {
        source: 'demo',
        timestamp: new Date().toISOString()
      });

      setChunkingResult(result);
      setSelectedChunk(result.chunks[0] || null);
      setProcessing(false);
      
      toast.success(`Created ${result.totalChunks} chunks in ${result.processingTime}ms`);
    }, 100);
  };

  const stats = chunkingResult ? new DocumentChunker({}).getStats(chunkingResult) : null;

  const copyChunk = (chunk: DocumentChunk) => {
    navigator.clipboard.writeText(chunk.content);
    setCopied(true);
    toast.success("Chunk copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadChunks = () => {
    if (!chunkingResult) return;
    
    const json = JSON.stringify(chunkingResult, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chunks-${strategy}-${chunkSize}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Chunks downloaded");
  };

  const loadSample = (sample: keyof typeof SAMPLE_TEXTS) => {
    setInputText(SAMPLE_TEXTS[sample]);
    toast.info(`Loaded ${sample} sample text`);
  };

  useEffect(() => {
    if (inputText && inputText.length > 0) {
      handleChunk();
    }
  }, []); // Auto-chunk on mount

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Document Chunking System
              </CardTitle>
              <CardDescription>
                Automatically split large texts with configurable chunk size and overlap
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              5 Strategies
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chunking Strategy</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as ChunkConfig['strategy'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recursive">
                    <div>
                      <div className="font-medium">Recursive</div>
                      <div className="text-xs text-muted-foreground">Smart splitting with hierarchy</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="semantic">
                    <div>
                      <div className="font-medium">Semantic</div>
                      <div className="text-xs text-muted-foreground">Preserve paragraphs & meaning</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="markdown">
                    <div>
                      <div className="font-medium">Markdown</div>
                      <div className="text-xs text-muted-foreground">Keep headers & structure</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="sentence">
                    <div>
                      <div className="font-medium">Sentence</div>
                      <div className="text-xs text-muted-foreground">Split by complete sentences</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div>
                      <div className="font-medium">Fixed Size</div>
                      <div className="text-xs text-muted-foreground">Simple character-based</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Load Sample Text</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadSample('short')} className="flex-1">
                  Short
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSample('medium')} className="flex-1">
                  Medium
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSample('long')} className="flex-1">
                  Long
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chunk Size</Label>
                <span className="text-sm text-muted-foreground">{chunkSize} chars</span>
              </div>
              <Slider
                value={[chunkSize]}
                onValueChange={(v) => setChunkSize(v[0])}
                min={100}
                max={2000}
                step={50}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chunk Overlap</Label>
                <span className="text-sm text-muted-foreground">{chunkOverlap} chars</span>
              </div>
              <Slider
                value={[chunkOverlap]}
                onValueChange={(v) => setChunkOverlap(v[0])}
                min={0}
                max={Math.min(500, chunkSize / 2)}
                step={10}
              />
            </div>
          </div>

          {/* Input Text */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{inputText.length.toLocaleString()} characters</span>
              <span>{inputText.split(/\s+/).length.toLocaleString()} words</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleChunk} disabled={processing || !inputText} className="gap-2">
              <Play className="w-4 h-4" />
              {processing ? 'Processing...' : 'Chunk Document'}
            </Button>
            {chunkingResult && (
              <Button variant="outline" onClick={downloadChunks} className="gap-2">
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <Alert>
              <ChartBar className="w-4 h-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Chunks</div>
                    <div className="text-lg font-bold">{stats.totalChunks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avg Size</div>
                    <div className="text-lg font-bold">{stats.avgChunkSize}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Min / Max</div>
                    <div className="text-lg font-bold">{stats.minChunkSize} / {stats.maxChunkSize}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Processing</div>
                    <div className="text-lg font-bold">{stats.processingTime}ms</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {chunkingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chunks ({chunkingResult.totalChunks})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="json">JSON Export</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chunkingResult.chunks.map((chunk, index) => (
                    <Card 
                      key={chunk.id}
                      className={`cursor-pointer transition-all ${
                        selectedChunk?.id === chunk.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedChunk(chunk)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Chunk {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyChunk(chunk);
                            }}
                          >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-4">
                          {chunk.content}
                        </p>
                        <Separator className="my-2" />
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{chunk.content.length} chars</span>
                          <span>Pos: {chunk.metadata.startChar}-{chunk.metadata.endChar}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4 mt-4">
                {chunkingResult.chunks.map((chunk, index) => (
                  <Card key={chunk.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge>Chunk {index + 1}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {chunk.content.length} characters
                          </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => copyChunk(chunk)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded-md">
                          <pre className="text-sm whitespace-pre-wrap">{chunk.content}</pre>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>Start: {chunk.metadata.startChar}</div>
                          <div>End: {chunk.metadata.endChar}</div>
                          <div>Overlap: {chunk.metadata.overlap}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <CodeBlock
                  code={JSON.stringify(chunkingResult, null, 2)}
                  language="json"
                  title="chunking-result.json"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Strategy Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Chunking Strategies Explained</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Recursive (Default)</h4>
              <p className="text-sm text-muted-foreground">
                Intelligently splits text using a hierarchy of separators (paragraphs → sentences → words → characters). 
                Best for general-purpose chunking that preserves natural language structure.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-1">Semantic</h4>
              <p className="text-sm text-muted-foreground">
                Splits based on semantic boundaries like paragraphs and sections. Preserves meaning and context. 
                Ideal for documents where semantic coherence is critical.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-1">Markdown</h4>
              <p className="text-sm text-muted-foreground">
                Preserves markdown headers and structure. Keeps headers with their content. 
                Perfect for technical documentation and structured content.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-1">Sentence</h4>
              <p className="text-sm text-muted-foreground">
                Splits by complete sentences with configurable chunk size. Maintains sentence integrity. 
                Good for conversational or narrative text.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-1">Fixed Size</h4>
              <p className="text-sm text-muted-foreground">
                Simple character-based chunking with fixed size and overlap. Fast but may break semantic units. 
                Use when speed is more important than semantic preservation.
              </p>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Chunk overlap helps prevent information loss at boundaries. 
              A 10-20% overlap is recommended for most use cases. Larger overlaps provide more context but increase storage and processing costs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
