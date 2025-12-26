import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  CloudArrowUp,
  ArrowsClockwise,
  Code,
  Copy,
  Check,
  ShieldCheck
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { CodeBlock } from "./CodeBlock";

interface ConnectionStatus {
  connected: boolean;
  latency: number;
  message: string;
}

export function SupabaseMCPIntegration() {
  const [supabaseUrl, setSupabaseUrl] = useKV<string>("supabase_url", "");
  const [supabaseKey, setSupabaseKey] = useKV<string>("supabase_key", "");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Please enter both Supabase URL and API key");
      return;
    }

    setTesting(true);
    const startTime = Date.now();

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        setConnectionStatus({
          connected: true,
          latency,
          message: "Successfully connected to Supabase"
        });
        toast.success(`Connected in ${latency}ms`);
      } else {
        setConnectionStatus({
          connected: false,
          latency,
          message: `Connection failed: ${response.statusText}`
        });
        toast.error("Connection failed");
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        latency: Date.now() - startTime,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error("Connection error");
    } finally {
      setTesting(false);
    }
  };

  const setupCode = `# Install Supabase MCP
gh repo clone supabase-community/supabase-mcp
cd supabase-mcp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-role-key`;

  const integrationCode = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Store AI conversation history
async function saveConversation(messages: any[]) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      messages,
      timestamp: new Date().toISOString(),
      model: 'gpt-4',
    })
  
  return { data, error }
}

// Retrieve context for RAG
async function getRelevantContext(query: string) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('content, embedding')
    .limit(5)
  
  return { data, error }
}`;

  const pythonCode = `from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

# Store embeddings for RAG
def store_embeddings(text: str, embedding: list[float]):
    response = supabase.table('embeddings').insert({
        'text': text,
        'embedding': embedding,
        'created_at': 'now()'
    }).execute()
    return response

# Vector similarity search
def search_similar(query_embedding: list[float], limit: int = 5):
    response = supabase.rpc(
        'match_embeddings',
        {
            'query_embedding': query_embedding,
            'match_threshold': 0.7,
            'match_count': limit
        }
    ).execute()
    return response.data`;

  const sqlSchema = `-- Create tables for AI data storage

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL,
  model VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Knowledge base with vector embeddings
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    text,
    1 - (embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Database size={24} className="text-green-400" weight="duotone" />
            </div>
            <div>
              <CardTitle>Supabase MCP Integration</CardTitle>
              <CardDescription>
                Connect AI assistants to Supabase for data persistence, vector search, and RAG
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database size={16} />
                  PostgreSQL + Vector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full PostgreSQL database with pgvector extension for semantic search
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Row Level Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built-in authentication and fine-grained access control
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowsClockwise size={16} />
                  Real-time Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time subscriptions for live AI assistant interactions
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connection Configuration</h3>
            
            <div className="space-y-2">
              <Label>Supabase Project URL</Label>
              <Input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSuppabaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Supabase Service Role Key</Label>
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use service_role key for server-side operations. Never expose in client code.
              </p>
            </div>

            <Button 
              onClick={testConnection} 
              disabled={testing || !supabaseUrl || !supabaseKey}
              className="w-full"
            >
              {testing ? (
                <>
                  <ArrowsClockwise className="animate-spin mr-2" size={16} />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CloudArrowUp className="mr-2" size={16} />
                  Test Connection
                </>
              )}
            </Button>

            {connectionStatus && (
              <Alert className={connectionStatus.connected ? "border-green-500/50 bg-green-500/10" : "border-destructive/50 bg-destructive/10"}>
                <div className="flex items-start gap-3">
                  {connectionStatus.connected ? (
                    <CheckCircle size={20} className="text-green-400 mt-0.5" weight="fill" />
                  ) : (
                    <XCircle size={20} className="text-destructive mt-0.5" weight="fill" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{connectionStatus.message}</span>
                        <Badge variant="outline" className="ml-2">
                          {connectionStatus.latency}ms
                        </Badge>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
          <CardDescription>
            Code examples for integrating Supabase with AI assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="schema">SQL Schema</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <CodeBlock
                code={setupCode}
                language="bash"
                title="setup-supabase-mcp.sh"
              />
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Quick Start:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Clone the supabase-mcp repository</li>
                      <li>Install dependencies with npm</li>
                      <li>Configure your Supabase credentials</li>
                      <li>Start the MCP server to connect AI assistants</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="typescript" className="space-y-4">
              <CodeBlock
                code={integrationCode}
                language="typescript"
                title="supabase-ai-integration.ts"
              />
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <CodeBlock
                code={pythonCode}
                language="python"
                title="supabase_integration.py"
              />
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <CodeBlock
                code={sqlSchema}
                language="sql"
                title="ai_schema.sql"
              />
              <Alert>
                <AlertDescription>
                  Run this SQL in your Supabase SQL Editor to create the necessary tables and functions for AI data storage.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">💬</div>
              <div>
                <h4 className="font-semibold mb-1">Conversation History</h4>
                <p className="text-sm text-muted-foreground">
                  Store and retrieve chat histories for context-aware AI assistants
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">🔍</div>
              <div>
                <h4 className="font-semibold mb-1">Vector Search & RAG</h4>
                <p className="text-sm text-muted-foreground">
                  Build Retrieval-Augmented Generation with pgvector for semantic search
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">👤</div>
              <div>
                <h4 className="font-semibold mb-1">User Preferences</h4>
                <p className="text-sm text-muted-foreground">
                  Persist user settings, preferences, and personalization data
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold mb-1">Analytics & Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Track AI usage, costs, and performance metrics over time
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
