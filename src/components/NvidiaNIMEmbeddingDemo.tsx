import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cpu, Copy, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";

const NVIDIA_EMBEDDING_MODELS = [
  { 
    id: "nvidia/nv-embedqa-e5-v5", 
    name: "NV-EmbedQA-E5-v5", 
    dims: 1024, 
    context: "512 tokens",
    description: "Optimized for question-answering and retrieval"
  },
  { 
    id: "nvidia/nv-embed-v2", 
    name: "NV-Embed-v2", 
    dims: 4096, 
    context: "32K tokens",
    description: "High-dimensional embeddings for complex tasks"
  },
  { 
    id: "nvidia/arctic-embed-l", 
    name: "Arctic Embed Large", 
    dims: 1024, 
    context: "512 tokens",
    description: "Efficient large-scale embedding model"
  },
];

const INPUT_TYPES = [
  { value: "query", label: "Query" },
  { value: "passage", label: "Passage" },
];

const TRUNCATE_OPTIONS = [
  { value: "NONE", label: "None (may fail if too long)" },
  { value: "END", label: "End (truncate from end)" },
];

export function NvidiaNIMEmbeddingDemo() {
  const [selectedModel, setSelectedModel] = useState(NVIDIA_EMBEDDING_MODELS[0].id);
  const [inputText, setInputText] = useState("What is the GPU memory bandwidth of H100 SXM?");
  const [inputType, setInputType] = useState("query");
  const [truncate, setTruncate] = useState("END");
  const [encodingFormat, setEncodingFormat] = useState("float");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedModelInfo = NVIDIA_EMBEDDING_MODELS.find(m => m.id === selectedModel);

  const generateEmbedding = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockEmbedding = Array.from({ length: selectedModelInfo?.dims || 1024 }, () => 
        (Math.random() - 0.5) * 0.3
      );

      setResult({
        model: selectedModel,
        dimensions: mockEmbedding.length,
        embedding: mockEmbedding.slice(0, 10),
        inputType,
        truncate,
        encodingFormat,
        totalTokens: Math.ceil(inputText.split(" ").length * 1.3),
        latency: Math.floor(Math.random() * 400 + 300),
      });

      toast.success("Embedding generated successfully");
    } catch (error) {
      toast.error("Failed to generate embedding");
      setResult({ error: "Failed to generate embedding" });
    } finally {
      setIsLoading(false);
    }
  };

  const pythonCode = `import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.embedding(
    model="nvidia_nim/${selectedModel}",
    input=["${inputText.replace(/"/g, '\\"')}"],
    encoding_format="${encodingFormat}",
    user_id="user-1234",
    
    # Nvidia NIM Specific Parameters
    input_type="${inputType}",  # "passage" or "query"
    truncate="${truncate}"  # "NONE" or "END"
)

print(f"Dimensions: {len(response.data[0]['embedding'])}")
print(f"First 10 values: {response.data[0]['embedding'][:10]}")`;

  const curlCode = `curl -X POST "https://integrate.api.nvidia.com/v1/embeddings" \\
  -H "Authorization: Bearer $NVIDIA_NIM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "input": ["${inputText.replace(/"/g, '\\"')}"],
    "input_type": "${inputType}",
    "encoding_format": "${encodingFormat}",
    "truncate": "${truncate}"
  }'`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu size={24} weight="duotone" className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">NVIDIA NIM Embeddings</h2>
            <p className="text-muted-foreground">
              Generate high-performance embeddings using NVIDIA's NIM platform via LiteLLM
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NVIDIA_EMBEDDING_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} - {model.dims}D
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedModelInfo.dims} dimensions</Badge>
                    <Badge variant="outline">{selectedModelInfo.context}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedModelInfo.description}</p>
                </div>
              )}
            </div>

            <div>
              <Label>Input Text</Label>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to embed..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Input Type</Label>
                <Select value={inputType} onValueChange={setInputType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INPUT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Truncate</Label>
                <Select value={truncate} onValueChange={setTruncate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRUNCATE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateEmbedding}
              disabled={isLoading || !inputText}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate Embedding"}
            </Button>
          </div>

          {result && (
            <Card className="p-4 bg-muted/50">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                {result.error ? (
                  <>
                    <XCircle className="text-destructive" size={20} />
                    Error
                  </>
                ) : (
                  <>
                    <CheckCircle className="text-green-500" size={20} />
                    Result
                  </>
                )}
              </h3>
              {result.error ? (
                <p className="text-destructive text-sm">{result.error}</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <div className="font-mono text-xs mt-1 break-all">{result.model}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <div className="font-bold">{result.dimensions}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Type: {result.inputType}</Badge>
                    <Badge variant="outline">Truncate: {result.truncate}</Badge>
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
              )}
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Integration Code</h3>
        <div className="space-y-4">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">cURL</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(curlCode);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
            <CodeBlock code={curlCode} language="bash" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-xl font-bold mb-4">About NVIDIA NIM Embeddings</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Platform Overview</h4>
            <p className="text-muted-foreground">
              NVIDIA NIM (NVIDIA Inference Microservices) provides optimized embedding models running on 
              NVIDIA infrastructure, offering high performance and low latency for production workloads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Parameters</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li><strong>input_type</strong>: "query" for search queries, "passage" for documents being indexed</li>
              <li><strong>truncate</strong>: How to handle text exceeding context window ("NONE" or "END")</li>
              <li><strong>encoding_format</strong>: "float" for full precision vectors</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">API Endpoints</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Chat/Completions: <code className="bg-background px-1 py-0.5 rounded">https://integrate.api.nvidia.com/v1/</code></li>
              <li>Embeddings: <code className="bg-background px-1 py-0.5 rounded">https://integrate.api.nvidia.com/v1/</code></li>
              <li>Rerank: <code className="bg-background px-1 py-0.5 rounded">https://ai.api.nvidia.com/v1/</code></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Authentication</h4>
            <p className="text-muted-foreground">
              Set <code className="bg-background px-1 py-0.5 rounded">NVIDIA_NIM_API_KEY</code> environment variable.
              Get your API key from{" "}
              <a 
                href="https://build.nvidia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                build.nvidia.com
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Use Cases</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>High-performance RAG applications</li>
              <li>Large-scale semantic search</li>
              <li>Question-answering systems</li>
              <li>Document similarity and clustering</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
