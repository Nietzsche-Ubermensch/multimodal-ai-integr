import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkle, Copy, CheckCircle, XCircle, Clock, ChartBar, Lightning, Database, ArrowsClockwise, Key } from "@phosphor-icons/react";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const HUGGINGFACE_MODELS = [
  { id: "microsoft/codebert-base", name: "CodeBERT Base", dims: 768, context: "512 tokens", description: "Code-optimized embeddings" },
  { id: "sentence-transformers/all-MiniLM-L6-v2", name: "all-MiniLM-L6-v2", dims: 384, context: "256 tokens", description: "Fast, lightweight general-purpose" },
  { id: "BAAI/bge-small-en-v1.5", name: "BGE Small EN v1.5", dims: 384, context: "512 tokens", description: "Compact, efficient retrieval" },
  { id: "BAAI/bge-base-en-v1.5", name: "BGE Base EN v1.5", dims: 768, context: "512 tokens", description: "Balanced performance" },
  { id: "BAAI/bge-large-en-v1.5", name: "BGE Large EN v1.5", dims: 1024, context: "512 tokens", description: "High-quality semantic search" },
  { id: "sentence-transformers/all-mpnet-base-v2", name: "all-mpnet-base-v2", dims: 768, context: "384 tokens", description: "Best general-purpose model" },
  { id: "intfloat/e5-base-v2", name: "E5 Base v2", dims: 768, context: "512 tokens", description: "Strong multilingual support" },
  { id: "intfloat/e5-large-v2", name: "E5 Large v2", dims: 1024, context: "512 tokens", description: "High-performance multilingual" },
];

interface EmbeddingResult {
  model: string;
  dimensions: number;
  embedding: number[];
  fullEmbedding?: number[];
  totalTokens: number;
  latency: number;
  timestamp: number;
}

interface ComparisonResult {
  models: string[];
  text: string;
  results: EmbeddingResult[];
  avgLatency: number;
  timestamp: number;
}

export function HuggingFaceEmbeddingDemo() {
  const [selectedModel, setSelectedModel] = useState(HUGGINGFACE_MODELS[0].id);
  const [inputText, setInputText] = useState("LiteLLM supports text-embedding-inference models from HuggingFace");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([HUGGINGFACE_MODELS[0].id]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const selectedModelInfo = HUGGINGFACE_MODELS.find(m => m.id === selectedModel);

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const generateEmbedding = async () => {
    if (!apiKey) {
      toast.error("Please enter your HuggingFace API token");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const startTime = Date.now();

      const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/' + selectedModel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: inputText,
          options: {
            wait_for_model: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
      }

      const embeddings = await response.json();
      const latency = Date.now() - startTime;

      let embedding: number[];
      if (Array.isArray(embeddings) && Array.isArray(embeddings[0])) {
        embedding = embeddings[0];
      } else if (Array.isArray(embeddings)) {
        embedding = embeddings;
      } else {
        throw new Error('Unexpected embedding format');
      }

      setResult({
        model: selectedModel,
        dimensions: embedding.length,
        embedding: embedding.slice(0, 10),
        fullEmbedding: embedding,
        totalTokens: Math.ceil(inputText.split(" ").length * 1.3),
        latency,
        timestamp: Date.now(),
      });

      toast.success(`Embedding generated: ${embedding.length} dimensions`);
    } catch (error) {
      console.error('Embedding error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate embedding");
    } finally {
      setIsLoading(false);
    }
  };

  const compareModels = async () => {
    if (!apiKey) {
      toast.error("Please enter your HuggingFace API token");
      return;
    }

    if (selectedModels.length < 2) {
      toast.error("Select at least 2 models to compare");
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const results: EmbeddingResult[] = [];
      
      for (const modelId of selectedModels) {
        const modelInfo = HUGGINGFACE_MODELS.find(m => m.id === modelId);
        if (!modelInfo) continue;

        try {
          const startTime = Date.now();

          const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/' + modelId, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              inputs: inputText,
              options: {
                wait_for_model: true
              }
            })
          });

          if (!response.ok) {
            console.error(`Model ${modelId} failed:`, response.status);
            continue;
          }

          const embeddings = await response.json();
          const latency = Date.now() - startTime;

          let embedding: number[];
          if (Array.isArray(embeddings) && Array.isArray(embeddings[0])) {
            embedding = embeddings[0];
          } else if (Array.isArray(embeddings)) {
            embedding = embeddings;
          } else {
            console.error(`Unexpected format for ${modelId}`);
            continue;
          }

          results.push({
            model: modelId,
            dimensions: embedding.length,
            embedding: embedding.slice(0, 10),
            fullEmbedding: embedding,
            totalTokens: Math.ceil(inputText.split(" ").length * 1.3),
            latency,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error(`Error with model ${modelId}:`, error);
        }
      }

      if (results.length === 0) {
        throw new Error("No models generated embeddings successfully");
      }

      const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;

      setComparisonResult({
        models: selectedModels,
        text: inputText,
        results,
        avgLatency,
        timestamp: Date.now(),
      });

      toast.success(`Compared ${results.length} models successfully`);
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to compare models");
    } finally {
      setIsComparing(false);
    }
  };

  const calculateSimilarity = (vec1: number[], vec2: number[]): number => {
    if (vec1.length !== vec2.length) return 0;
    
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (mag1 * mag2);
  };

  const pythonCode = `from litellm import embedding
import os

# Set your HuggingFace token
os.environ['HF_TOKEN'] = "${apiKey || 'hf_xxxxxx'}"

# Generate embedding
response = embedding(
    model='huggingface/${selectedModel}',
    input=["${inputText.replace(/"/g, '\\"')}"]
)

# Access the embedding
embedding_vector = response.data[0]['embedding']
print(f"Model: ${selectedModel}")
print(f"Dimensions: {len(embedding_vector)}")
print(f"First 10 values: {embedding_vector[:10]}")
print(f"Vector magnitude: {sum(x**2 for x in embedding_vector)**0.5:.6f}")`;

  const comparisonCode = `from litellm import embedding
import os
import time

os.environ['HF_TOKEN'] = "${apiKey || 'hf_xxxxxx'}"

models = [
${selectedModels.map(m => `    'huggingface/${m}'`).join(',\n')}
]

text = "${inputText.replace(/"/g, '\\"')}"
results = []

for model in models:
    start = time.time()
    response = embedding(model=model, input=[text])
    latency = (time.time() - start) * 1000
    
    dims = len(response.data[0]['embedding'])
    results.append({
        'model': model,
        'dimensions': dims,
        'latency_ms': round(latency, 2)
    })
    print(f"{model}: {dims}D, {latency:.0f}ms")

# Compare dimensions
print(f"\\nDimension range: {min(r['dimensions'] for r in results)}-{max(r['dimensions'] for r in results)}")
print(f"Average latency: {sum(r['latency_ms'] for r in results) / len(results):.0f}ms")`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Database size={24} weight="duotone" className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">HuggingFace Embeddings - Real API Integration</h2>
            <p className="text-muted-foreground">
              Generate embeddings with actual HuggingFace API calls and compare different models
            </p>
          </div>
        </div>

        <Alert className="mb-6 border-purple-500/30 bg-purple-500/5">
          <Key size={16} className="text-purple-500" />
          <AlertDescription>
            Enter your HuggingFace API token to generate real embeddings. Get your free token at{" "}
            <a 
              href="https://huggingface.co/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-purple-500"
            >
              huggingface.co/settings/tokens
            </a>
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <Label htmlFor="api-key" className="flex items-center gap-2">
            <Key size={16} />
            HuggingFace API Token
          </Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="hf_..."
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your token is only used in your browser and never stored
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6 p-4 bg-background/50 rounded-lg border">
          <Switch
            checked={comparisonMode}
            onCheckedChange={setComparisonMode}
            id="comparison-mode"
          />
          <Label htmlFor="comparison-mode" className="cursor-pointer">
            {comparisonMode ? "Comparison Mode (Multi-Model)" : "Single Model Mode"}
          </Label>
        </div>

        {!comparisonMode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Select Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HUGGINGFACE_MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.dims}D
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelInfo && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{selectedModelInfo.dims} dimensions</Badge>
                    <Badge variant="outline">{selectedModelInfo.context}</Badge>
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                      {selectedModelInfo.description}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <Label>Input Text</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to embed..."
                  rows={4}
                />
              </div>

              <Button
                onClick={generateEmbedding}
                disabled={isLoading || !inputText || !apiKey}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Lightning size={18} className="mr-2" weight="fill" />
                {isLoading ? "Generating..." : "Generate Embedding"}
              </Button>
            </div>

            {result && (
              <Card className="p-4 bg-muted/50">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} weight="fill" />
                  Result
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <div className="font-mono text-xs mt-1 p-2 bg-background rounded">
                      {result.model}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <div className="font-bold text-2xl text-purple-500">{result.dimensions}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First 10 values:</span>
                    <div className="font-mono text-xs mt-1 p-2 bg-background rounded overflow-x-auto">
                      [{result.embedding.map((v: number) => v.toFixed(6)).join(", ")}...]
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-xs">{result.latency}ms</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Tokens:</span> {result.totalTokens}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Select Models to Compare</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {HUGGINGFACE_MODELS.map(model => (
                  <div
                    key={model.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedModels.includes(model.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-500/50'
                    }`}
                    onClick={() => toggleModelSelection(model.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedModels.includes(model.id)}
                        onCheckedChange={() => toggleModelSelection(model.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{model.name}</div>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{model.dims}D</Badge>
                          <Badge variant="secondary" className="text-xs">{model.context}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Input Text</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to embed across all selected models..."
                rows={4}
              />
            </div>

            <Button
              onClick={compareModels}
              disabled={isComparing || !inputText || selectedModels.length < 2 || !apiKey}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <ArrowsClockwise size={18} className="mr-2" weight="bold" />
              {isComparing ? `Comparing ${selectedModels.length} Models...` : `Compare ${selectedModels.length} Models`}
            </Button>
          </div>
        )}
      </Card>

      {comparisonResult && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartBar size={24} className="text-purple-500" weight="duotone" />
            <h3 className="text-xl font-bold">Comparison Results</h3>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Models Compared</div>
                <div className="text-2xl font-bold text-purple-500">{comparisonResult.results.length}</div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-blue-500">{Math.round(comparisonResult.avgLatency)}ms</div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Dimension Range</div>
                <div className="text-2xl font-bold text-green-500">
                  {Math.min(...comparisonResult.results.map(r => r.dimensions))} - {Math.max(...comparisonResult.results.map(r => r.dimensions))}
                </div>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Dimensions</TableHead>
                    <TableHead className="text-right">Latency</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead>Sample Values</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonResult.results.map((res, idx) => {
                    const modelInfo = HUGGINGFACE_MODELS.find(m => m.id === res.model);
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-sm">{modelInfo?.name || res.model}</div>
                            <div className="text-xs text-muted-foreground">{modelInfo?.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            {res.dimensions}D
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="font-mono text-sm">{res.latency}ms</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {res.totalTokens}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs max-w-xs truncate">
                            [{res.embedding.slice(0, 5).map(v => v.toFixed(4)).join(", ")}...]
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Dimension Comparison</h4>
              <div className="space-y-2">
                {comparisonResult.results.map((res, idx) => {
                  const modelInfo = HUGGINGFACE_MODELS.find(m => m.id === res.model);
                  const maxDims = Math.max(...comparisonResult.results.map(r => r.dimensions));
                  const percentage = (res.dimensions / maxDims) * 100;
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{modelInfo?.name}</span>
                        <span className="text-muted-foreground">{res.dimensions} dimensions</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Copy size={20} />
          Integration Code
        </h3>
        <div className="space-y-4">
          {!comparisonMode ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Python (LiteLLM)</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(pythonCode);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy size={16} />
                </Button>
              </div>
              <CodeBlock code={pythonCode} language="python" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Python Model Comparison</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(comparisonCode);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy size={16} />
                </Button>
              </div>
              <CodeBlock code={comparisonCode} language="python" />
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-purple-500/5 border-purple-500/30">
        <h3 className="text-xl font-bold mb-4">Model Dimensions Reference</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HUGGINGFACE_MODELS.map(model => (
            <Card key={model.id} className="p-4 bg-background/50">
              <div className="font-semibold text-sm mb-2">{model.name}</div>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="font-mono">{model.dims}D</Badge>
                <Badge variant="secondary" className="text-xs">{model.context}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
