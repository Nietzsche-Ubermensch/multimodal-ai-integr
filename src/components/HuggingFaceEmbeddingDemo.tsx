import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkle, Copy, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";
import { CodeBlock } from "./CodeBlock";

const HUGGINGFACE_MODELS = [
  { id: "microsoft/codebert-base", name: "CodeBERT Base", dims: 768, context: "512 tokens" },
  { id: "sentence-transformers/all-MiniLM-L6-v2", name: "all-MiniLM-L6-v2", dims: 384, context: "256 tokens" },
  { id: "BAAI/bge-small-en-v1.5", name: "BGE Small EN v1.5", dims: 384, context: "512 tokens" },
  { id: "BAAI/bge-base-en-v1.5", name: "BGE Base EN v1.5", dims: 768, context: "512 tokens" },
  { id: "BAAI/bge-large-en-v1.5", name: "BGE Large EN v1.5", dims: 1024, context: "512 tokens" },
];

export function HuggingFaceEmbeddingDemo() {
  const [selectedModel, setSelectedModel] = useState(HUGGINGFACE_MODELS[0].id);
  const [inputText, setInputText] = useState("LiteLLM supports text-embedding-inference models from HuggingFace");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRealApi, setUseRealApi] = useState(false);

  const selectedModelInfo = HUGGINGFACE_MODELS.find(m => m.id === selectedModel);

  const generateEmbedding = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockEmbedding = Array.from({ length: selectedModelInfo?.dims || 768 }, () => 
        (Math.random() - 0.5) * 0.2
      );

      setResult({
        model: selectedModel,
        dimensions: mockEmbedding.length,
        embedding: mockEmbedding.slice(0, 10),
        totalTokens: Math.ceil(inputText.split(" ").length * 1.3),
        latency: Math.floor(Math.random() * 300 + 200),
      });

      toast.success("Embedding generated successfully");
    } catch (error) {
      toast.error("Failed to generate embedding");
      setResult({ error: "Failed to generate embedding" });
    } finally {
      setIsLoading(false);
    }
  };

  const pythonCode = `from litellm import embedding
import os

os.environ['HF_TOKEN'] = "hf_xxxxxx"

response = embedding(
    model='huggingface/${selectedModel}',
    input=["${inputText.replace(/"/g, '\\"')}"]
)

print(f"Dimensions: {response.data[0]['embedding'].__len__()}")
print(f"First 10 values: {response.data[0]['embedding'][:10]}")`;

  const typescriptCode = `import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

const output = await hf.featureExtraction({
  model: "${selectedModel}",
  inputs: "${inputText.replace(/"/g, '\\"')}"
});

console.log(\`Dimensions: \${output.length}\`);
console.log(\`First 10 values:\`, output.slice(0, 10));`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkle size={24} weight="duotone" className="text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">HuggingFace Embeddings</h2>
            <p className="text-muted-foreground">
              Generate text embeddings using HuggingFace's text-embedding-inference models via LiteLLM
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
                  {HUGGINGFACE_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} - {model.dims}D
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedModelInfo.dims} dimensions</Badge>
                  <Badge variant="outline">{selectedModelInfo.context}</Badge>
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

            <div className="flex gap-2">
              <Button
                onClick={generateEmbedding}
                disabled={isLoading || !inputText}
                className="flex-1"
              >
                {isLoading ? "Generating..." : "Generate Embedding"}
              </Button>
            </div>
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
                    <div className="font-mono text-xs mt-1">{result.model}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <div className="font-bold">{result.dimensions}</div>
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
              <h4 className="font-semibold">TypeScript (HuggingFace SDK)</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(typescriptCode);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
            <CodeBlock code={typescriptCode} language="typescript" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-xl font-bold mb-4">About HuggingFace Embeddings</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Supported Models</h4>
            <p className="text-muted-foreground mb-2">
              LiteLLM supports all text-embedding-inference models from HuggingFace:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>CodeBERT - Optimized for code understanding</li>
              <li>BGE (BAAI General Embedding) - High-performance multilingual embeddings</li>
              <li>Sentence Transformers - Efficient semantic similarity</li>
              <li>Custom fine-tuned models on HuggingFace Hub</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Authentication</h4>
            <p className="text-muted-foreground">
              Set your HuggingFace token as <code className="bg-background px-1 py-0.5 rounded">HF_TOKEN</code> environment variable.
              Get your token from{" "}
              <a 
                href="https://huggingface.co/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                huggingface.co/settings/tokens
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Use Cases</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Semantic search and retrieval (RAG applications)</li>
              <li>Document similarity and clustering</li>
              <li>Code search and understanding</li>
              <li>Question answering and information extraction</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
