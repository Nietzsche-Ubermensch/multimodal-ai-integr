// RAG Pipeline with Supabase AI Integration

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  MagnifyingGlass,
  CloudArrowUp,
  Database,
  Sparkle,
  Lightning,
  ArrowsClockwise,
  Eye,
  FileText,
  Brain,
  Quotes,
  ChartBar,
  Play,
  Trash,
  Copy,
  Check,
  Warning,
  Info,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AIModel, RAGSearchResult, RAGCitation, SupabaseConfig, EmbeddingConfig, LANGUAGE_FLAGS } from './types';
import { CodeBlock } from '@/components/CodeBlock';

interface RAGPipelineProps {
  selectedModel?: AIModel;
  onModelSelect: (model: AIModel) => void;
}

interface StoredDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

const EMBEDDING_MODELS = [
  { id: 'supabase-ai/gte-small', name: 'GTE Small (Supabase)', provider: 'supabase-ai', dimensions: 384 },
  { id: 'supabase-ai/multilingual-e5-large', name: 'Multilingual E5 (Supabase)', provider: 'supabase-ai', dimensions: 1024 },
  { id: 'openai/text-embedding-3-small', name: 'OpenAI Embeddings Small', provider: 'openai', dimensions: 1536 },
  { id: 'openai/text-embedding-3-large', name: 'OpenAI Embeddings Large', provider: 'openai', dimensions: 3072 },
];

const SEARCH_TYPES = [
  { value: 'vector', label: 'Vector Search', description: 'Semantic similarity using embeddings' },
  { value: 'hybrid', label: 'Hybrid Search', description: 'Vector + Full-text for best results' },
  { value: 'fulltext', label: 'Full-Text Search', description: 'Traditional keyword matching' },
];

export function RAGPipeline({ selectedModel, onModelSelect }: RAGPipelineProps) {
  // Configuration
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState('supabase-ai/multilingual-e5-large');

  // Document ingestion
  const [documentText, setDocumentText] = useState('');
  const [documentMetadata, setDocumentMetadata] = useState('{}');
  const [batchDocuments, setBatchDocuments] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vector' | 'hybrid' | 'fulltext'>('hybrid');
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  // Results
  const [searchResults, setSearchResults] = useState<RAGCitation[]>([]);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [storedDocuments, setStoredDocuments] = useState<StoredDocument[]>([]);

  // State
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const embeddingModelInfo = EMBEDDING_MODELS.find(m => m.id === selectedEmbeddingModel);
  const isConfigured = supabaseUrl && supabaseKey;

  // Generate embedding using Supabase AI or OpenAI
  const generateEmbedding = useCallback(async (text: string): Promise<number[]> => {
    const provider = embeddingModelInfo?.provider;

    if (provider === 'supabase-ai') {
      // Call Supabase Edge Function for embedding
      const response = await fetch(`${supabaseUrl}/functions/v1/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: selectedEmbeddingModel.replace('supabase-ai/', ''),
        }),
      });

      if (!response.ok) {
        // Fallback to OpenAI if Supabase AI is not available
        if (openaiKey) {
          return generateOpenAIEmbedding(text);
        }
        throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.embedding;
    } else {
      return generateOpenAIEmbedding(text);
    }
  }, [supabaseUrl, supabaseKey, openaiKey, selectedEmbeddingModel, embeddingModelInfo]);

  const generateOpenAIEmbedding = async (text: string): Promise<number[]> => {
    if (!openaiKey) {
      throw new Error('OpenAI API key required for this embedding model');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: selectedEmbeddingModel.replace('openai/', ''),
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate OpenAI embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  };

  // Store document with embedding
  const storeDocument = useCallback(async () => {
    if (!documentText.trim()) {
      toast.error('Please enter document content');
      return;
    }
    if (!isConfigured) {
      toast.error('Please configure Supabase credentials');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      setProgress(20);
      toast.info('Generating embedding...');

      const embedding = await generateEmbedding(documentText);
      setProgress(60);

      let metadata = {};
      try {
        metadata = JSON.parse(documentMetadata);
      } catch {
        // Ignore JSON parse errors
      }

      // Store in Supabase using pgvector
      const response = await fetch(`${supabaseUrl}/rest/v1/rag_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          content: documentText,
          embedding,
          metadata: {
            ...metadata,
            embedding_model: selectedEmbeddingModel,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to store document');
      }

      setProgress(100);
      toast.success('Document stored successfully!');
      setDocumentText('');
      setDocumentMetadata('{}');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to store document');
    } finally {
      setProcessing(false);
    }
  }, [documentText, documentMetadata, isConfigured, generateEmbedding, supabaseUrl, supabaseKey, selectedEmbeddingModel]);

  // Load stored documents
  const loadDocuments = useCallback(async () => {
    if (!isConfigured) return;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rag_documents?select=id,content,metadata,created_at&order=created_at.desc&limit=20`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStoredDocuments(data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, [isConfigured, supabaseUrl, supabaseKey]);

  // Vector search using pgvector
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    if (!isConfigured) {
      toast.error('Please configure Supabase credentials');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      toast.info('Generating query embedding...');
      const queryEmbedding = await generateEmbedding(searchQuery);

      // Call Supabase function for vector search
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: similarityThreshold,
          match_count: topK,
          search_type: searchType,
          query_text: searchType !== 'vector' ? searchQuery : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      
      const citations: RAGCitation[] = results.map((r: any, idx: number) => ({
        id: r.id || `result-${idx}`,
        content: r.content,
        similarity: r.similarity || r.score || 0,
        source: r.metadata?.source || 'Database',
        metadata: r.metadata,
      }));

      setSearchResults(citations);
      toast.success(`Found ${citations.length} relevant documents`);
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, isConfigured, generateEmbedding, supabaseUrl, supabaseKey, similarityThreshold, topK, searchType]);

  // Generate answer with citations
  const generateAnswer = useCallback(async () => {
    if (searchResults.length === 0) {
      toast.error('Please perform a search first');
      return;
    }
    if (!selectedModel) {
      toast.error('Please select a model for answer generation');
      return;
    }

    setGenerating(true);
    setGeneratedAnswer('');

    try {
      // Build context from search results
      const context = searchResults
        .map((r, i) => `[${i + 1}] ${r.content}`)
        .join('\n\n');

      const systemPrompt = `You are a helpful assistant that answers questions based on the provided context. 
Always cite your sources using [1], [2], etc. notation.
If you cannot answer from the context, say so.
Context language may vary - respond in the same language as the user's question.`;

      const userPrompt = `Context:
${context}

Question: ${searchQuery}

Please provide a comprehensive answer based on the context above, citing relevant sources.`;

      // For demo purposes, generate a mock response
      // In production, this would call the selected model's API
      const mockAnswer = `Based on the provided context, here's what I found:

${searchResults.slice(0, 3).map((r, i) => 
  `**Finding ${i + 1}** [${i + 1}]: ${r.content.slice(0, 200)}...`
).join('\n\n')}

**Summary**: The search returned ${searchResults.length} relevant documents with similarity scores ranging from ${Math.min(...searchResults.map(r => r.similarity)).toFixed(2)} to ${Math.max(...searchResults.map(r => r.similarity)).toFixed(2)}.

*Note: This is a demo response. Connect to ${selectedModel.name} API for actual generation.*`;

      setGeneratedAnswer(mockAnswer);
      toast.success('Answer generated with citations');
    } catch (error: any) {
      toast.error(error.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [searchResults, selectedModel, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Database size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">RAG Pipeline with Supabase AI</h2>
              <p className="text-muted-foreground">
                Generate embeddings, store vectors in pgvector, and perform hybrid search with the latest 2025 models
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-emerald-500 text-white">pgvector</Badge>
                <Badge className="bg-cyan-500 text-white">Supabase AI</Badge>
                <Badge className="bg-blue-500 text-white">Hybrid Search</Badge>
                {selectedModel && (
                  <Badge className="bg-purple-500 text-white gap-1">
                    {selectedModel.languageFlag || LANGUAGE_FLAGS[selectedModel.languageOptimization]}
                    {selectedModel.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning size={20} />
            Configuration
          </CardTitle>
          <CardDescription>
            Configure Supabase and embedding settings for RAG pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supabase URL</Label>
              <Input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Supabase Anon Key</Label>
              <Input
                type="password"
                placeholder="eyJhbGci..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Embedding Model</Label>
              <Select value={selectedEmbeddingModel} onValueChange={setSelectedEmbeddingModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">{model.dimensions}d</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>OpenAI Key (Fallback)</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
          </div>

          {!isConfigured && (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                Please configure Supabase credentials to enable RAG features
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="ingest" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="ingest" className="gap-2">
            <CloudArrowUp size={16} />
            Ingest
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <MagnifyingGlass size={16} />
            Search
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <Sparkle size={16} />
            Generate
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText size={16} />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Document Ingestion */}
        <TabsContent value="ingest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Document</CardTitle>
              <CardDescription>
                Store documents with vector embeddings for semantic search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Content</Label>
                <Textarea
                  placeholder="Enter document text to store..."
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Metadata (JSON)</Label>
                <Textarea
                  placeholder='{"source": "manual", "category": "docs"}'
                  value={documentMetadata}
                  onChange={(e) => setDocumentMetadata(e.target.value)}
                  rows={2}
                  className="font-mono text-sm"
                />
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button
                onClick={storeDocument}
                disabled={processing || !isConfigured}
                className="w-full gap-2"
              >
                {processing ? (
                  <ArrowsClockwise size={16} className="animate-spin" />
                ) : (
                  <CloudArrowUp size={16} />
                )}
                Store Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vector Search */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                Search documents using vector similarity, hybrid, or full-text search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Query</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                  />
                  <Button onClick={performSearch} disabled={searching || !isConfigured}>
                    {searching ? (
                      <ArrowsClockwise size={16} className="animate-spin" />
                    ) : (
                      <MagnifyingGlass size={16} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search Type</Label>
                  <Select value={searchType} onValueChange={(v) => setSearchType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Top K Results</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Similarity Threshold</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  Search Results ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchResults.map((result, idx) => (
                  <Card key={result.id} className="p-4 bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">[{idx + 1}] {result.source}</Badge>
                      <Badge className={result.similarity >= 0.8 ? 'bg-green-500' : result.similarity >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'}>
                        {(result.similarity * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-3">{result.content}</p>
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value).slice(0, 20)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Answer Generation */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Answer Generation
              </CardTitle>
              <CardDescription>
                Generate answers with citations using the selected model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.length === 0 ? (
                <Alert>
                  <Info size={16} />
                  <AlertDescription>
                    Perform a search first to get context for answer generation
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Context: {searchResults.length} documents</p>
                      <p className="text-xs text-muted-foreground">Query: {searchQuery}</p>
                    </div>
                    <div>
                      {selectedModel ? (
                        <Badge className="gap-1">
                          {selectedModel.languageFlag}
                          {selectedModel.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No model selected</Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={generateAnswer}
                    disabled={generating || !selectedModel}
                    className="w-full gap-2"
                  >
                    {generating ? (
                      <ArrowsClockwise size={16} className="animate-spin" />
                    ) : (
                      <Sparkle size={16} />
                    )}
                    Generate Answer with Citations
                  </Button>

                  {generatedAnswer && (
                    <Card className="p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Quotes size={16} className="text-purple-500" />
                          <span className="font-medium">Generated Answer</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedAnswer)}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{generatedAnswer}</pre>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stored Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stored Documents</CardTitle>
                  <CardDescription>
                    Documents stored in your Supabase pgvector database
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadDocuments} disabled={!isConfigured}>
                  <ArrowsClockwise size={14} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {storedDocuments.length > 0 ? (
                <div className="space-y-3">
                  {storedDocuments.map((doc) => (
                    <Card key={doc.id} className="p-4 bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {doc.id.slice(0, 8)}...
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{doc.content}</p>
                      {doc.metadata && (
                        <div className="flex gap-1 mt-2">
                          {Object.entries(doc.metadata).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value).slice(0, 15)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No documents stored yet</p>
                  <p className="text-sm">Add documents in the Ingest tab</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SQL Setup Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Supabase Setup SQL
          </CardTitle>
          <CardDescription>
            Run this SQL in your Supabase SQL Editor to set up the RAG tables and functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table with vector column
create table if not exists rag_documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(${embeddingModelInfo?.dimensions || 1024}),
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create index for fast similarity search
create index if not exists rag_documents_embedding_idx 
  on rag_documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Full-text search index
create index if not exists rag_documents_content_idx 
  on rag_documents using gin (to_tsvector('english', content));

-- Vector search function
create or replace function match_documents(
  query_embedding vector(${embeddingModelInfo?.dimensions || 1024}),
  match_threshold float default 0.7,
  match_count int default 5,
  search_type text default 'vector',
  query_text text default null
)
returns table (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  if search_type = 'vector' then
    return query
    select
      rag_documents.id,
      rag_documents.content,
      1 - (rag_documents.embedding <=> query_embedding) as similarity,
      rag_documents.metadata
    from rag_documents
    where 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
    order by rag_documents.embedding <=> query_embedding
    limit match_count;
  elsif search_type = 'hybrid' then
    return query
    select
      rag_documents.id,
      rag_documents.content,
      (0.7 * (1 - (rag_documents.embedding <=> query_embedding)) + 
       0.3 * ts_rank(to_tsvector('english', rag_documents.content), plainto_tsquery('english', query_text))) as similarity,
      rag_documents.metadata
    from rag_documents
    where 
      (1 - (rag_documents.embedding <=> query_embedding) > match_threshold * 0.8)
      or to_tsvector('english', rag_documents.content) @@ plainto_tsquery('english', query_text)
    order by similarity desc
    limit match_count;
  else
    return query
    select
      rag_documents.id,
      rag_documents.content,
      ts_rank(to_tsvector('english', rag_documents.content), plainto_tsquery('english', query_text)) as similarity,
      rag_documents.metadata
    from rag_documents
    where to_tsvector('english', rag_documents.content) @@ plainto_tsquery('english', query_text)
    order by similarity desc
    limit match_count;
  end if;
end;
$$;`}
            language="sql"
          />
        </CardContent>
      </Card>
    </div>
  );
}
