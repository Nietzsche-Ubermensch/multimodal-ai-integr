// Supabase AI + Vector Enhanced System Component

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Database,
  Lightning,
  Brain,
  Cloud,
  Globe,
  Sparkle,
  ArrowsClockwise,
  Play,
  Check,
  Warning,
  Copy,
  Lock,
  Broadcast,
  Code,
  Table,
  MagnifyingGlass,
  FileText,
  ChartBar,
  Gear,
  Plugs,
  CloudArrowUp,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/CodeBlock';

// Types
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

interface EmbeddingModel {
  id: string;
  name: string;
  provider: 'supabase-ai' | 'openai' | 'huggingface';
  dimensions: number;
  maxTokens: number;
  description: string;
}

interface VectorDB {
  id: string;
  name: string;
  type: 'pgvector' | 'pinecone' | 'chroma';
  status: 'connected' | 'disconnected' | 'error';
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  languages: string[];
  contextWindow: number;
}

// Constants
const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'gte-small',
    name: 'GTE Small',
    provider: 'supabase-ai',
    dimensions: 384,
    maxTokens: 512,
    description: 'Fast, efficient embedding model built into Supabase',
  },
  {
    id: 'multilingual-e5-large',
    name: 'Multilingual E5 Large',
    provider: 'supabase-ai',
    dimensions: 1024,
    maxTokens: 512,
    description: 'Multilingual embeddings for 100+ languages',
  },
  {
    id: 'text-embedding-3-small',
    name: 'OpenAI Small',
    provider: 'openai',
    dimensions: 1536,
    maxTokens: 8191,
    description: 'OpenAI embedding model - small variant',
  },
  {
    id: 'text-embedding-3-large',
    name: 'OpenAI Large',
    provider: 'openai',
    dimensions: 3072,
    maxTokens: 8191,
    description: 'OpenAI embedding model - large variant',
  },
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'MiniLM L6 v2',
    provider: 'huggingface',
    dimensions: 384,
    maxTokens: 256,
    description: 'Lightweight HuggingFace model for semantic search',
  },
];

const NEW_MODELS: AIModel[] = [
  { id: 'tfree-hat-7b', name: 'TFree-HAT 7B', provider: 'Aleph Alpha', languages: ['🇩🇪', '🇬🇧'], contextWindow: 8192 },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', languages: ['🌍'], contextWindow: 128000 },
  { id: 'qwen3-14b', name: 'Qwen3 14B', provider: 'Alibaba', languages: ['🌍'], contextWindow: 128000 },
  { id: 'qwen3-235b', name: 'Qwen3 235B-A22B', provider: 'Alibaba', languages: ['🌍'], contextWindow: 128000 },
  { id: 'qwen3-jp', name: 'Qwen3 Japanese', provider: 'Rakuten', languages: ['🇯🇵', '🇬🇧'], contextWindow: 32000 },
];

const VECTOR_DBS: VectorDB[] = [
  { id: 'pgvector', name: 'pgvector (Supabase)', type: 'pgvector', status: 'disconnected' },
  { id: 'pinecone', name: 'Pinecone', type: 'pinecone', status: 'disconnected' },
  { id: 'chroma', name: 'Chroma', type: 'chroma', status: 'disconnected' },
];

const SUPABASE_FEATURES = [
  { icon: <Database size={16} />, name: 'pgvector', desc: 'Built-in vector similarity' },
  { icon: <Brain size={16} />, name: 'Supabase AI', desc: 'Serverless embeddings & chat' },
  { icon: <Code size={16} />, name: 'AI Client SDK', desc: 'TypeScript/Python clients' },
  { icon: <Lightning size={16} />, name: 'Edge Functions', desc: 'Serverless AI processing' },
  { icon: <Table size={16} />, name: 'Auto-generated', desc: 'REST + GraphQL APIs' },
  { icon: <Broadcast size={16} />, name: 'Realtime', desc: 'Live scraping job updates' },
  { icon: <Lock size={16} />, name: 'Auth', desc: 'User management & RLS' },
];

// SQL Setup Code
const PGVECTOR_SETUP_SQL = `-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table with vector column
create table rag_documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1024), -- Adjust dimensions based on model
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create HNSW index for fast similarity search
create index on rag_documents 
  using hnsw (embedding vector_cosine_ops);

-- Create function for semantic search
create or replace function match_documents(
  query_embedding vector(1024),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from rag_documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Create hybrid search function (vector + full-text)
create or replace function hybrid_search(
  query_text text,
  query_embedding vector(1024),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  rank float
)
language sql stable
as $$
  with semantic_search as (
    select id, 1 - (embedding <=> query_embedding) as similarity
    from rag_documents
    order by embedding <=> query_embedding
    limit match_count * 2
  ),
  keyword_search as (
    select id, ts_rank_cd(to_tsvector('english', content), plainto_tsquery(query_text)) as rank
    from rag_documents
    where to_tsvector('english', content) @@ plainto_tsquery(query_text)
    limit match_count * 2
  )
  select
    d.id,
    d.content,
    d.metadata,
    coalesce(s.similarity, 0) as similarity,
    coalesce(k.rank, 0) as rank
  from rag_documents d
  left join semantic_search s on d.id = s.id
  left join keyword_search k on d.id = k.id
  where s.id is not null or k.id is not null
  order by (coalesce(s.similarity, 0) * 0.7 + coalesce(k.rank, 0) * 0.3) desc
  limit match_count;
$$;`;

const EDGE_FUNCTION_CODE = `// supabase/functions/embed/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const model = new Supabase.ai.Session('gte-small')

serve(async (req: Request) => {
  const { input } = await req.json()
  
  // Generate embedding using Supabase AI
  const embedding = await model.run(input, {
    mean_pool: true,
    normalize: true,
  })

  return new Response(
    JSON.stringify({ embedding }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})`;

const TYPESCRIPT_CLIENT_CODE = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Generate embedding via Edge Function
async function generateEmbedding(text: string) {
  const { data, error } = await supabase.functions.invoke('embed', {
    body: { input: text }
  })
  return data.embedding
}

// Semantic search
async function semanticSearch(query: string, limit = 5) {
  const embedding = await generateEmbedding(query)
  
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit
  })
  
  return data
}

// Hybrid search (vector + full-text)
async function hybridSearch(query: string, limit = 5) {
  const embedding = await generateEmbedding(query)
  
  const { data, error } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: embedding,
    match_count: limit
  })
  
  return data
}`;

export function SupabaseAISystem() {
  // Configuration state
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceKey: '',
  });
  const [selectedEmbedding, setSelectedEmbedding] = useState<string>('multilingual-e5-large');
  const [selectedVectorDB, setSelectedVectorDB] = useState<string>('pgvector');
  const [isConnected, setIsConnected] = useState(false);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  
  // Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = useCallback(async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!config.url || !config.anonKey) {
      toast.error('Please enter Supabase URL and Anon Key');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Test connection
      const response = await fetch(`${config.url}/rest/v1/`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
        },
      });
      
      if (response.ok) {
        setIsConnected(true);
        toast.success('Connected to Supabase!');
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast.error('Failed to connect to Supabase');
      setIsConnected(false);
    } finally {
      setIsProcessing(false);
    }
  }, [config]);

  const handleTestSearch = useCallback(async () => {
    if (!testQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Simulate search results
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults([
        { id: '1', content: 'Sample document matching query...', similarity: 0.92 },
        { id: '2', content: 'Another relevant document...', similarity: 0.85 },
        { id: '3', content: 'Related content found...', similarity: 0.78 },
      ]);
      toast.success('Search completed!');
    } finally {
      setIsProcessing(false);
    }
  }, [testQuery]);

  const embeddingModel = EMBEDDING_MODELS.find(m => m.id === selectedEmbedding);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Database size={28} className="text-white" weight="bold" />
          </div>
          Supabase AI + Vector Enhanced System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete RAG pipeline with pgvector, Supabase AI embeddings, and 2025 multilingual models
        </p>
      </div>

      {/* Architecture Overview */}
      <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle size={20} className="text-emerald-500" weight="fill" />
            Supabase AI Toolkit
          </CardTitle>
          <CardDescription>Built-in AI features for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {SUPABASE_FEATURES.map((feature) => (
              <div
                key={feature.name}
                className="p-3 rounded-lg bg-background/50 border border-border hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1 text-emerald-500">
                  {feature.icon}
                  <span className="font-medium text-sm">{feature.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Models */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain size={20} className="text-purple-500" />
              New Models (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {NEW_MODELS.map((model) => (
              <div
                key={model.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                  <div className="flex gap-1">
                    {model.languages.map((lang, i) => (
                      <span key={i} className="text-sm">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{model.provider}</span>
                  <Badge variant="outline" className="text-xs">
                    {(model.contextWindow / 1000).toFixed(0)}K
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Embeddings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud size={20} className="text-blue-500" />
              Embeddings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {EMBEDDING_MODELS.map((model) => (
              <div
                key={model.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedEmbedding === model.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedEmbedding(model.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                  <Badge
                    variant={model.provider === 'supabase-ai' ? 'default' : 'outline'}
                    className={model.provider === 'supabase-ai' ? 'bg-emerald-500' : ''}
                  >
                    {model.provider}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{model.dimensions}D</span>
                  <span>{model.maxTokens} tokens</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vector DB */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database size={20} className="text-orange-500" />
              Vector DB
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {VECTOR_DBS.map((db) => (
              <div
                key={db.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedVectorDB === db.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedVectorDB(db.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{db.name}</span>
                  <Badge
                    variant={db.status === 'connected' ? 'default' : 'outline'}
                    className={
                      db.status === 'connected'
                        ? 'bg-green-500'
                        : db.status === 'error'
                        ? 'bg-red-500'
                        : ''
                    }
                  >
                    {db.status}
                  </Badge>
                </div>
                {db.type === 'pgvector' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Native PostgreSQL vector extension
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Configuration & Code */}
      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto">
          <TabsTrigger value="setup" className="gap-2">
            <Gear size={16} />
            Setup
          </TabsTrigger>
          <TabsTrigger value="sql" className="gap-2">
            <Table size={16} />
            SQL
          </TabsTrigger>
          <TabsTrigger value="edge" className="gap-2">
            <Lightning size={16} />
            Edge
          </TabsTrigger>
          <TabsTrigger value="client" className="gap-2">
            <Code size={16} />
            Client
          </TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plugs size={20} />
                Supabase Connection
              </CardTitle>
              <CardDescription>
                Connect to your Supabase project to enable AI features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input
                    placeholder="https://your-project.supabase.co"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anon Key</Label>
                  <Input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.anonKey}
                    onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleConnect}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <ArrowsClockwise size={16} className="animate-spin" />
                  ) : isConnected ? (
                    <Check size={16} />
                  ) : (
                    <Plugs size={16} />
                  )}
                  {isConnected ? 'Connected' : 'Connect'}
                </Button>
                
                {isConnected && (
                  <Badge className="bg-green-500 text-white gap-1">
                    <Check size={12} />
                    Connected to Supabase
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Test Search */}
              <div className="space-y-2">
                <Label>Test Semantic Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a search query..."
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTestSearch} disabled={isProcessing} className="gap-2">
                    <MagnifyingGlass size={16} />
                    Search
                  </Button>
                </div>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Results</Label>
                  {testResults.map((result) => (
                    <div key={result.id} className="p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{result.content}</span>
                        <Badge variant="outline">{(result.similarity * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Tab */}
        <TabsContent value="sql">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Table size={20} />
                    pgvector SQL Setup
                  </CardTitle>
                  <CardDescription>
                    Run this SQL in your Supabase SQL Editor to set up vector search
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(PGVECTOR_SETUP_SQL, 'sql')}
                  className="gap-2"
                >
                  {copiedCode === 'sql' ? <Check size={14} /> : <Copy size={14} />}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={PGVECTOR_SETUP_SQL}
                language="sql"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edge Function Tab */}
        <TabsContent value="edge">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightning size={20} />
                    Supabase Edge Function
                  </CardTitle>
                  <CardDescription>
                    Serverless embedding generation using Supabase AI
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(EDGE_FUNCTION_CODE, 'edge')}
                  className="gap-2"
                >
                  {copiedCode === 'edge' ? <Check size={14} /> : <Copy size={14} />}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lightning className="h-4 w-4" />
                <AlertDescription>
                  Deploy this Edge Function to generate embeddings using Supabase AI's built-in models.
                  No external API keys required!
                </AlertDescription>
              </Alert>
              <CodeBlock
                code={EDGE_FUNCTION_CODE}
                language="typescript"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Tab */}
        <TabsContent value="client">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code size={20} />
                    TypeScript Client
                  </CardTitle>
                  <CardDescription>
                    Complete client code for semantic and hybrid search
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(TYPESCRIPT_CLIENT_CODE, 'client')}
                  className="gap-2"
                >
                  {copiedCode === 'client' ? <Check size={14} /> : <Copy size={14} />}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <Database size={12} />
                  Semantic Search
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MagnifyingGlass size={12} />
                  Hybrid Search
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CloudArrowUp size={12} />
                  Document Ingestion
                </Badge>
              </div>
              <CodeBlock
                code={TYPESCRIPT_CLIENT_CODE}
                language="typescript"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Configuration Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Embedding:</span>
              <Badge variant="secondary">{embeddingModel?.name}</Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Vector DB:</span>
              <Badge variant="secondary">{selectedVectorDB}</Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Dimensions:</span>
              <Badge variant="outline">{embeddingModel?.dimensions}D</Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={isConnected ? 'bg-green-500' : 'bg-yellow-500'}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
