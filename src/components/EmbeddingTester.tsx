import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Copy, Check, Lightning } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";

interface EmbeddingModel {
  provider: string;
  model: string;
  dimensions: number;
  description: string;
}

const embeddingModels: EmbeddingModel[] = [
  {
    provider: "openrouter",
    model: "together/baai/bge-large-en-v1.5",
    dimensions: 1024,
    description: "Together AI BGE Large - Best cost/quality for RAG (via OpenRouter)"
  },
  {
    provider: "openrouter",
    model: "google/gemini-embedding-001",
    dimensions: 768,
    description: "Google Gemini - Optimized for semantic search"
  },
  {
    provider: "openai",
    model: "text-embedding-3-large",
    dimensions: 3072,
    description: "OpenAI - Best-in-class retrieval performance"
  },
  {
    provider: "openai",
    model: "text-embedding-3-small",
    dimensions: 1536,
    description: "OpenAI - Cost-effective embeddings"
  },
  {
    provider: "openai",
    model: "text-embedding-ada-002",
    dimensions: 1536,
    description: "OpenAI - Legacy model (stable)"
  }
];

export function EmbeddingTester() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [inputText, setInputText] = useState("What is quantum computing and how does it differ from classical computing?");
  const [embedding, setEmbedding] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [useRealApi, setUseRealApi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKeys] = useKV<Record<string, string>>("api-keys-temp", {});

  const currentModel = embeddingModels[selectedModel];

  const handleGenerateEmbedding = async () => {
    setIsLoading(true);
    setEmbedding([]);
    setLatency(null);

    try {
      const startTime = Date.now();

      if (useRealApi) {
        const providerKeyMap: Record<string, string> = {
          "openrouter": "OPENROUTER_API_KEY",
          "openai": "OPENAI_API_KEY"
        };

        const keyName = providerKeyMap[currentModel.provider];
        const apiKey = apiKeys?.[keyName];

        if (!apiKey) {
          toast.error(`No API key configured for ${currentModel.provider}`);
          setIsLoading(false);
          return;
        }

        const endpoint = currentModel.provider === "openrouter"
          ? "https://openrouter.ai/api/v1/embeddings"
          : "https://api.openai.com/v1/embeddings";

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };

        if (currentModel.provider === "openrouter") {
          headers["HTTP-Referer"] = window.location.origin;
          headers["X-Title"] = "Multimodal AI Integration Platform";
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: currentModel.model,
            input: inputText
          })
        });

        const responseLatency = Date.now() - startTime;
        setLatency(responseLatency);

        if (!response.ok) {
          const errorText = await response.text();
          toast.error(`API Error: ${response.status}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const embeddingData = data.data[0].embedding;
        setEmbedding(embeddingData);
        toast.success(`Generated ${embeddingData.length}-dimensional embedding in ${responseLatency}ms`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
        
        const mockEmbedding = Array.from(
          { length: currentModel.dimensions },
          () => (Math.random() - 0.5) * 2
        );

        const simulatedLatency = Date.now() - startTime;
        setLatency(simulatedLatency);
        setEmbedding(mockEmbedding);
        toast.success(`Generated ${mockEmbedding.length}-dimensional embedding in ${simulatedLatency}ms`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate embedding");
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmbedding = async () => {
    await navigator.clipboard.writeText(JSON.stringify(embedding, null, 2));
    setCopied(true);
    toast.success("Embedding copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateMagnitude = (vec: number[]): number => {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  };

  const getEmbeddingStats = () => {
    if (embedding.length === 0) return null;

    const magnitude = calculateMagnitude(embedding);
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);

    return { magnitude, mean, stdDev, min, max };
  };

  const stats = getEmbeddingStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/30 border-accent/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Use Real API</Label>
                <p className="text-xs text-muted-foreground">
                  {useRealApi ? "Live embedding generation" : "Simulated vectors"}
                </p>
              </div>
              <Switch checked={useRealApi} onCheckedChange={setUseRealApi} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Embedding Model</Label>
              <Select value={selectedModel.toString()} onValueChange={(val) => setSelectedModel(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {embeddingModels.map((model, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {model.dimensions}d
                        </Badge>
                        <span className="text-sm">{model.model}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{currentModel.description}</p>
            </div>
          </div>
        </Card>

        {stats && (
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Vector Statistics</Label>
                <Badge className="bg-accent text-accent-foreground">
                  {embedding.length}D
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Magnitude</div>
                  <div className="font-mono font-semibold">{stats.magnitude.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mean</div>
                  <div className="font-mono font-semibold">{stats.mean.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Std Dev</div>
                  <div className="font-mono font-semibold">{stats.stdDev.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Range</div>
                  <div className="font-mono font-semibold">{stats.min.toFixed(2)} to {stats.max.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-2">
        <Label>Input Text</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to generate embeddings..."
          className="font-mono text-sm min-h-[100px]"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerateEmbedding}
          disabled={isLoading || !inputText.trim()}
          className="gap-2 flex-1"
          size="lg"
        >
          {isLoading ? (
            <Lightning size={20} weight="fill" className="animate-pulse" />
          ) : (
            <Play size={20} weight="fill" />
          )}
          {isLoading ? "Generating..." : "Generate Embedding"}
        </Button>
        
        {latency && (
          <Badge variant="outline" className="px-4 font-mono flex items-center">
            {latency}ms
          </Badge>
        )}
      </div>

      {embedding.length > 0 && (
        <Card className="border-accent/30">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                Embedding Vector
              </Badge>
              <span className="text-sm text-muted-foreground">
                {embedding.length} dimensions
              </span>
              {useRealApi && (
                <Badge className="text-xs bg-green-500">LIVE</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyEmbedding}
              className="gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="p-4 max-h-[300px] overflow-auto">
            <pre className="font-mono text-xs whitespace-pre-wrap break-all">
              {JSON.stringify(embedding.slice(0, 50), null, 2)}
              {embedding.length > 50 && (
                <div className="text-muted-foreground mt-2">
                  ... and {embedding.length - 50} more values
                </div>
              )}
            </pre>
          </div>
        </Card>
      )}

      <Alert className="border-primary/30 bg-primary/5">
        <Lightning size={20} className="text-primary" />
        <AlertDescription className="text-sm">
          <strong>Use Cases:</strong> Embeddings convert text into dense vectors for semantic search, 
          document similarity, clustering, and RAG (Retrieval-Augmented Generation) systems. 
          Use cosine similarity to compare embeddings.
        </AlertDescription>
      </Alert>
    </div>
  );
}
