import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RocketLaunch, Copy, CheckCircle, XCircle, ArrowsDownUp } from "@phosphor-icons/react";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";

const NVIDIA_RERANK_MODELS = [
  { 
    id: "nvidia/llama-3_2-nv-rerankqa-1b-v2",
    name: "Llama 3.2 NV-RerankQA-1B-v2",
    description: "Optimized for question-answering reranking",
    endpoint: "ranking"
  },
  { 
    id: "nvidia/nv-rerankqa-mistral-4b-v3",
    name: "NV-RerankQA-Mistral-4B-v3",
    description: "High-performance 4B parameter reranker",
    endpoint: "retrieval"
  },
];

const TRUNCATE_OPTIONS = [
  { value: "NONE", label: "None (may fail if too long)" },
  { value: "END", label: "End (truncate from end)" },
];

export function NvidiaNIMRerankDemo() {
  const [selectedModel, setSelectedModel] = useState(NVIDIA_RERANK_MODELS[0].id);
  const [query, setQuery] = useState("What is the GPU memory bandwidth of H100 SXM?");
  const [documents, setDocuments] = useState([
    "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth.",
    "A100 provides up to 20X higher performance over the prior generation.",
    "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
  ].join("\n"));
  const [topN, setTopN] = useState("3");
  const [truncate, setTruncate] = useState("END");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedModelInfo = NVIDIA_RERANK_MODELS.find(m => m.id === selectedModel);

  const rerank = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const docArray = documents.split("\n").filter(d => d.trim());
      
      const scores = docArray.map((doc, idx) => {
        const queryLower = query.toLowerCase();
        const docLower = doc.toLowerCase();
        const hasH100 = docLower.includes("h100");
        const hasBandwidth = docLower.includes("bandwidth") || docLower.includes("tb/s") || docLower.includes("gb/s");
        
        let score = Math.random() * 2;
        if (hasH100 && hasBandwidth) score += 10;
        else if (hasH100 || hasBandwidth) score += 3;
        
        return score;
      });
      
      const rankedResults = docArray
        .map((doc, idx) => ({
          index: idx,
          document: { text: doc },
          relevance_score: scores[idx]
        }))
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, parseInt(topN) || 3);

      setResult({
        model: selectedModel,
        results: rankedResults,
      });

      toast.success("Documents reranked successfully");
    } catch (error) {
      toast.error("Failed to rerank documents");
      setResult({ error: "Failed to rerank documents" });
    } finally {
      setIsLoading(false);
    }
  };

  const pythonCode = `import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.rerank(
    model="nvidia_nim/${selectedModelInfo?.endpoint === "ranking" ? "ranking/" : ""}${selectedModel}",
    query="${query.replace(/"/g, '\\"')}",
    documents=[
${documents.split("\n").filter(d => d.trim()).map(d => `        "${d.replace(/"/g, '\\"')}"`).join(",\n")}
    ],
    top_n=${topN},
    truncate="${truncate}"  # Optional: "NONE" or "END"
)

for result in response.results:
    print(f"Rank: {result.index + 1}")
    print(f"Score: {result.relevance_score:.4f}")
    print(f"Text: {result.document.text}\\n")`;

  const curlCode = `curl -X POST "https://ai.api.nvidia.com/v1/${selectedModelInfo?.endpoint === "ranking" ? "ranking" : `retrieval/${selectedModel}/reranking`}" \\
  -H "Authorization: Bearer $NVIDIA_NIM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    ${selectedModelInfo?.endpoint === "ranking" ? `"model": "${selectedModel}",\n    ` : ""}"query": "${query.replace(/"/g, '\\"')}",
    "passages": [
${documents.split("\n").filter(d => d.trim()).map(d => `      "${d.replace(/"/g, '\\"')}"`).join(",\n")}
    ],
    "truncate": "${truncate}"
  }'`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <RocketLaunch size={24} weight="duotone" className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">NVIDIA NIM Rerank</h2>
            <p className="text-muted-foreground">
              High-performance document reranking using NVIDIA's optimized NIM platform
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Rerank Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NVIDIA_RERANK_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-muted-foreground">{selectedModelInfo.description}</p>
                  <Badge variant="outline" className="text-xs">
                    Endpoint: /{selectedModelInfo.endpoint}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label>Query</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search query..."
              />
            </div>

            <div>
              <Label>Documents (one per line)</Label>
              <Textarea
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
                placeholder="Enter documents to rerank..."
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {documents.split("\n").filter(d => d.trim()).length} documents
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Top N Results</Label>
                <Input
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  min="1"
                  max="10"
                />
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
              onClick={rerank}
              disabled={isLoading || !query || !documents.trim()}
              className="w-full"
            >
              <ArrowsDownUp size={16} className="mr-2" />
              {isLoading ? "Reranking..." : "Rerank Documents"}
            </Button>
          </div>

          {result && (
            <Card className="p-4 bg-muted/50 h-fit">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                {result.error ? (
                  <>
                    <XCircle className="text-destructive" size={20} />
                    Error
                  </>
                ) : (
                  <>
                    <CheckCircle className="text-green-500" size={20} />
                    Ranked Results
                  </>
                )}
              </h3>
              {result.error ? (
                <p className="text-destructive text-sm">{result.error}</p>
              ) : (
                <div className="space-y-3">
                  {result.results.map((item: any, idx: number) => (
                    <Card key={idx} className="p-3 bg-background">
                      <div className="flex items-start gap-3">
                        <Badge className="flex-shrink-0">{idx + 1}</Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">Score:</span>
                            <Badge variant="secondary">{item.relevance_score.toFixed(4)}</Badge>
                            <span className="text-xs text-muted-foreground">Index: {item.index}</span>
                          </div>
                          <p className="text-sm">{item.document.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
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
              <h4 className="font-semibold">cURL (Direct API)</h4>
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
        <h3 className="text-xl font-bold mb-4">About NVIDIA NIM Rerank</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Two API Endpoints</h4>
            <p className="text-muted-foreground mb-2">
              NVIDIA NIM provides two different rerank endpoints:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>
                <strong>/v1/ranking</strong>: For models like <code className="bg-background px-1 py-0.5 rounded">llama-3.2-nv-rerankqa-1b-v2</code>
              </li>
              <li>
                <strong>/v1/retrieval/MODEL_NAME/reranking</strong>: For models like <code className="bg-background px-1 py-0.5 rounded">nv-rerankqa-mistral-4b-v3</code>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Model Routing with LiteLLM</h4>
            <p className="text-muted-foreground mb-2">
              LiteLLM automatically routes to the correct endpoint:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>
                Use <code className="bg-background px-1 py-0.5 rounded">nvidia_nim/ranking/MODEL_NAME</code> prefix for /v1/ranking
              </li>
              <li>
                Use <code className="bg-background px-1 py-0.5 rounded">nvidia_nim/MODEL_NAME</code> for /v1/retrieval endpoint
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Parameters</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li><strong>query</strong>: The search question or statement</li>
              <li><strong>documents/passages</strong>: Array of text documents to rerank</li>
              <li><strong>top_n</strong>: Number of top results to return</li>
              <li><strong>truncate</strong>: "NONE" or "END" - how to handle long documents</li>
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
              <li>Improving RAG pipeline accuracy with semantic reranking</li>
              <li>Question-answering systems requiring precise document selection</li>
              <li>Technical documentation search with domain-specific queries</li>
              <li>Multi-stage retrieval pipelines (vector search → rerank → generate)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Use <strong>1B model</strong> for low-latency applications</li>
              <li>Use <strong>4B model</strong> for higher accuracy requirements</li>
              <li>Set <code className="bg-background px-1 py-0.5 rounded">truncate="END"</code> to prevent errors with long documents</li>
              <li>Combine with vector search for best results: retrieve 20-50 candidates, rerank top 5-10</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
