import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ListMagnifyingGlass, Copy, CheckCircle, XCircle, ArrowsDownUp } from "@phosphor-icons/react";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";

const HUGGINGFACE_RERANK_MODELS = [
  { 
    id: "BAAI/bge-reranker-base", 
    name: "BGE Reranker Base",
    description: "General purpose reranking model"
  },
  { 
    id: "BAAI/bge-reranker-large", 
    name: "BGE Reranker Large",
    description: "Higher accuracy reranking model"
  },
  { 
    id: "BAAI/bge-reranker-v2-m3", 
    name: "BGE Reranker v2 M3",
    description: "Multilingual reranking model"
  },
];

export function HuggingFaceRerankDemo() {
  const [selectedModel, setSelectedModel] = useState(HUGGINGFACE_RERANK_MODELS[0].id);
  const [query, setQuery] = useState("What is the capital of the United States?");
  const [documents, setDocuments] = useState([
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
  ].join("\n"));
  const [topN, setTopN] = useState("3");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedModelInfo = HUGGINGFACE_RERANK_MODELS.find(m => m.id === selectedModel);

  const rerank = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 700));

      const docArray = documents.split("\n").filter(d => d.trim());
      const scores = docArray.map(() => Math.random());
      
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
        id: crypto.randomUUID(),
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

os.environ["HF_TOKEN"] = "hf_xxxxxx"

response = litellm.rerank(
    model="huggingface/${selectedModel}",
    query="${query.replace(/"/g, '\\"')}",
    documents=[
${documents.split("\n").filter(d => d.trim()).map(d => `        "${d.replace(/"/g, '\\"')}"`).join(",\n")}
    ],
    top_n=${topN}
)

for result in response.results:
    print(f"Index: {result.index}")
    print(f"Score: {result.relevance_score:.4f}")
    print(f"Text: {result.document.text}\\n")`;

  const curlCode = `curl http://localhost:4000/rerank \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $LITELLM_API_KEY" \\
  -d '{
    "model": "${selectedModel}",
    "query": "${query.replace(/"/g, '\\"')}",
    "documents": [
${documents.split("\n").filter(d => d.trim()).map(d => `      "${d.replace(/"/g, '\\"')}"`).join(",\n")}
    ],
    "top_n": ${topN}
  }'`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ListMagnifyingGlass size={24} weight="duotone" className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">HuggingFace Rerank</h2>
            <p className="text-muted-foreground">
              Reorder documents by semantic relevance to a query using HuggingFace reranking models
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
                  {HUGGINGFACE_RERANK_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <p className="text-xs text-muted-foreground mt-1">{selectedModelInfo.description}</p>
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
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {documents.split("\n").filter(d => d.trim()).length} documents
              </p>
            </div>

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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Score:</span>
                            <Badge variant="secondary">{item.relevance_score.toFixed(4)}</Badge>
                            <span className="text-xs text-muted-foreground">Original Index: {item.index}</span>
                          </div>
                          <p className="text-sm">{item.document.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Request ID: <code className="text-xs">{result.id}</code>
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
              <h4 className="font-semibold">Python (LiteLLM SDK)</h4>
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
              <h4 className="font-semibold">cURL (LiteLLM Proxy)</h4>
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
        <h3 className="text-xl font-bold mb-4">About HuggingFace Rerank</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">What is Reranking?</h4>
            <p className="text-muted-foreground">
              Reranking improves search results by reordering documents based on their semantic relevance 
              to a query. It's especially useful in RAG (Retrieval-Augmented Generation) pipelines to 
              ensure the most relevant documents are used for answer generation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">How it Works</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
              <li>Initial retrieval returns candidate documents (e.g., from vector search)</li>
              <li>Reranker scores each document against the query</li>
              <li>Documents are reordered by relevance score</li>
              <li>Top-N most relevant documents are returned</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">BGE Reranker Models</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li><strong>Base</strong>: Fast, good for most use cases</li>
              <li><strong>Large</strong>: Higher accuracy, slower inference</li>
              <li><strong>v2 M3</strong>: Multilingual support for 100+ languages</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Setup Options</h4>
            <p className="text-muted-foreground mb-2">
              <strong>Serverless (HuggingFace)</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Set <code className="bg-background px-1 py-0.5 rounded">HF_TOKEN</code> from huggingface.co/settings/tokens</li>
              <li>Use model name: <code className="bg-background px-1 py-0.5 rounded">huggingface/BAAI/bge-reranker-base</code></li>
            </ul>
            <p className="text-muted-foreground mb-2 mt-2">
              <strong>Custom Endpoint</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Pass <code className="bg-background px-1 py-0.5 rounded">api_base="https://your-endpoint.com"</code></li>
              <li>Use your own API key with <code className="bg-background px-1 py-0.5 rounded">api_key</code> parameter</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Use Cases</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Improving RAG pipeline accuracy</li>
              <li>Semantic search result optimization</li>
              <li>Question answering systems</li>
              <li>Document recommendation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
