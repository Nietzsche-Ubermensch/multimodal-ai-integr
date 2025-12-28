import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PaperPlaneRight, 
  FloppyDisk, 
  Copy,
  Check,
  Lightning,
  Code,
  Stop,
  Play,
  Sliders
} from "@phosphor-icons/react";
import { ModelParameterConfig } from "./ModelParameterConfig";
import { UNIFIED_MODEL_CATALOG, type Model } from "@/data/models";
import { useKV } from "@github/spark/hooks";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  modelId: string;
  parameters: any;
  timestamp: number;
}

interface TestResponse {
  content: string;
  tokens: number;
  latencyMs: number;
  model: string;
  cost: number;
}

interface EnhancedPromptTesterProps {
  apiKeysConfigured: boolean;
  initialModelId?: string;
}

export function EnhancedPromptTester({ 
  apiKeysConfigured,
  initialModelId 
}: EnhancedPromptTesterProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>(
    initialModelId || UNIFIED_MODEL_CATALOG[0].id
  );
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [enableStreaming, setEnableStreaming] = useState(true);
  const [parameters, setParameters] = useState<any>({});
  const [showParameters, setShowParameters] = useState(false);
  const [savedPrompts, setSavedPrompts] = useKV<SavedPrompt[]>("enhanced-prompt-tester-prompts", []);
  const [copied, setCopied] = useState(false);
  const [promptName, setPromptName] = useState("");

  const selectedModel = UNIFIED_MODEL_CATALOG.find(m => m.id === selectedModelId);

  const simulateStreaming = async (text: string) => {
    setStreamingContent("");
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setStreamingContent(prev => prev + (i > 0 ? " " : "") + words[i]);
    }
  };

  const sendPrompt = useCallback(async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsStreaming(true);
    setResponse(null);
    setStreamingContent("");

    const startTime = Date.now();

    try {
      if (useRealAPI) {
        // TODO: Implement real API integration
        throw new Error("Real API integration not yet implemented");
      } else {
        // Simulation mode
        const mockResponse = generateMockResponse(selectedModel, prompt);
        
        if (enableStreaming) {
          await simulateStreaming(mockResponse);
        } else {
          setStreamingContent(mockResponse);
        }

        const endTime = Date.now();
        const latency = endTime - startTime;
        const tokens = mockResponse.split(" ").length * 1.3; // Rough estimate
        const cost = calculateCost(selectedModel, tokens);

        setResponse({
          content: mockResponse,
          tokens: Math.round(tokens),
          latencyMs: latency,
          model: selectedModel.name,
          cost,
        });

        // Add to message history
        setMessages(prev => [
          ...prev,
          { role: "user", content: prompt },
          { role: "assistant", content: mockResponse },
        ]);
      }
    } catch (error) {
      console.error("Error sending prompt:", error);
      setStreamingContent("Error: " + (error as Error).message);
    } finally {
      setIsStreaming(false);
    }
  }, [prompt, selectedModel, useRealAPI, enableStreaming]);

  const savePrompt = () => {
    if (!promptName.trim() || !prompt.trim()) return;

    const savedPrompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      name: promptName,
      prompt,
      modelId: selectedModelId,
      parameters,
      timestamp: Date.now(),
    };

    setSavedPrompts(current => [...(current || []), savedPrompt]);
    setPromptName("");
  };

  const loadPrompt = (saved: SavedPrompt) => {
    setPrompt(saved.prompt);
    setSelectedModelId(saved.modelId);
    setParameters(saved.parameters);
  };

  const copyResponse = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAsCode = () => {
    if (!selectedModel) return;

    const code = `// ${selectedModel.name} - ${selectedModel.provider}
const response = await fetch("${getProviderEndpoint(selectedModel.provider)}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    model: "${selectedModel.id.split('/')[1]}",
    messages: [
      ${systemPrompt ? `{ role: "system", content: ${JSON.stringify(systemPrompt)} },\n      ` : ""}{ role: "user", content: ${JSON.stringify(prompt)} }
    ],
    ${Object.entries(parameters).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(",\n    ")}
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendPrompt();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Enhanced Prompt Tester</CardTitle>
              <CardDescription className="text-lg mt-2">
                Test prompts with full parameter control and streaming responses
              </CardDescription>
            </div>
            {selectedModel && (
              <Badge 
                className={`${
                  selectedModel.provider === 'xai' ? 'bg-black' :
                  selectedModel.provider === 'deepseek' ? 'bg-blue-600' :
                  selectedModel.provider === 'anthropic' ? 'bg-orange-500' :
                  'bg-purple-600'
                } text-white`}
              >
                {selectedModel.provider.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!apiKeysConfigured && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex gap-2 items-start">
                <Lightning size={18} className="text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">API Keys Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your API keys in the "API Config" tab to enable testing.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="model-select">Select Model</Label>
              <Select 
                value={selectedModelId} 
                onValueChange={setSelectedModelId}
                disabled={!apiKeysConfigured}
              >
                <SelectTrigger id="model-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIFIED_MODEL_CATALOG.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {model.modelType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="real-api-toggle" className="text-sm">Real API</Label>
                <Switch
                  id="real-api-toggle"
                  checked={useRealAPI}
                  onCheckedChange={setUseRealAPI}
                  disabled={!apiKeysConfigured}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="streaming-toggle" className="text-sm">Streaming</Label>
                <Switch
                  id="streaming-toggle"
                  checked={enableStreaming}
                  onCheckedChange={setEnableStreaming}
                  disabled={!apiKeysConfigured}
                />
              </div>
            </div>
          </div>

          {selectedModel && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Context Window</p>
                  <p className="font-bold font-mono">
                    {selectedModel.contextWindow.toLocaleString()} tokens
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Input Cost</p>
                  <p className="font-bold font-mono">
                    ${selectedModel.inputCostPer1M.toFixed(2)}/1M
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Output Cost</p>
                  <p className="font-bold font-mono">
                    ${selectedModel.outputCostPer1M.toFixed(2)}/1M
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-bold capitalize">
                    {selectedModel.modelType}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Configure Parameters</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParameters(!showParameters)}
                className="gap-2"
              >
                <Sliders size={16} />
                {showParameters ? "Hide" : "Show"} Parameters
              </Button>
            </div>

            {showParameters && selectedModel && (
              <ModelParameterConfig
                model={selectedModel}
                onParametersChange={setParameters}
                showPresetSave={true}
              />
            )}
          </div>

          <Separator />

          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompt">User Prompt</TabsTrigger>
              <TabsTrigger value="system">System Prompt (Optional)</TabsTrigger>
            </TabsList>
            <TabsContent value="prompt" className="space-y-4">
              <Textarea
                placeholder="Enter your prompt here... (⌘/Ctrl+Enter to send)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[200px] font-mono resize-none"
                disabled={!apiKeysConfigured || isStreaming}
              />
            </TabsContent>
            <TabsContent value="system" className="space-y-4">
              <Textarea
                placeholder="Optional system prompt to set context and behavior..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[200px] font-mono resize-none"
                disabled={!apiKeysConfigured || isStreaming}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button 
              className="flex-1 gap-2" 
              disabled={!apiKeysConfigured || !prompt.trim() || isStreaming}
              onClick={sendPrompt}
            >
              {isStreaming ? (
                <>
                  <Stop size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <PaperPlaneRight size={18} />
                  Send Prompt
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              disabled={!apiKeysConfigured || !prompt.trim()}
              onClick={() => {
                if (promptName.trim()) {
                  savePrompt();
                } else {
                  const name = prompt.slice(0, 50) + (prompt.length > 50 ? "..." : "");
                  setPromptName(name);
                  savePrompt();
                }
              }}
            >
              <FloppyDisk size={18} />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {(streamingContent || response) && (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResponse}
                  className="gap-2"
                  disabled={!response}
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-success" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAsCode}
                  className="gap-2"
                  disabled={!response}
                >
                  <Code size={16} />
                  Copy as Code
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[200px] bg-muted/10 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap border border-border">
              {streamingContent}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
              )}
            </div>

            {response && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Tokens</p>
                  <p className="text-2xl font-bold font-mono">{response.tokens}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Latency</p>
                  <p className="text-2xl font-bold font-mono">{response.latencyMs}ms</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Speed</p>
                  <p className="text-2xl font-bold font-mono">
                    {(response.tokens / (response.latencyMs / 1000)).toFixed(1)} t/s
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Est. Cost</p>
                  <p className="text-2xl font-bold font-mono">${response.cost.toFixed(6)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {savedPrompts && savedPrompts.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Saved Prompts ({savedPrompts.length})</CardTitle>
            <CardDescription>
              Load previously saved prompts with their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedPrompts.slice(-5).reverse().map((saved) => {
                const model = UNIFIED_MODEL_CATALOG.find(m => m.id === saved.modelId);
                return (
                  <div
                    key={saved.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{saved.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {saved.prompt}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {model?.name || "Unknown Model"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(saved.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPrompt(saved)}
                      className="gap-2 ml-4 shrink-0"
                    >
                      <Play size={16} />
                      Load
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getProviderEndpoint(provider: Model["provider"]): string {
  const endpoints: Record<Model["provider"], string> = {
    xai: "https://api.x.ai/v1/chat/completions",
    deepseek: "https://api.deepseek.com/v1/chat/completions",
    anthropic: "https://api.anthropic.com/v1/messages",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    huggingface: "https://api-inference.huggingface.co/models/",
    openai: "https://api.openai.com/v1/chat/completions",
    nvidia: "https://integrate.api.nvidia.com/v1/chat/completions",
  };
  return endpoints[provider];
}

function generateMockResponse(model: Model, prompt: string): string {
  const responses: Record<string, string> = {
    reasoning: `Let me think through this step by step:

1. First, I need to understand the core question: "${prompt.slice(0, 100)}..."

2. Breaking this down into components:
   - The primary concern appears to be about implementation
   - There are technical considerations to address
   - Best practices should be followed

3. Based on my analysis:
   ${model.name} is particularly well-suited for this task because of its ${model.modelType} capabilities. The approach I recommend would be:
   
   - Start with a clear architecture
   - Implement incrementally
   - Test thoroughly at each step
   
This aligns with the model's strengths in ${model.capabilities.map(c => c.name).join(", ")}.`,
    
    code: `Here's how I would approach this:

\`\`\`typescript
// Solution using ${model.name}
interface Solution {
  approach: string;
  implementation: () => void;
  benefits: string[];
}

const solution: Solution = {
  approach: "structured and scalable",
  implementation: () => {
    // Core logic here
    console.log("Implementing solution...");
  },
  benefits: [
    "Type-safe",
    "Maintainable",
    "Performant"
  ]
};

solution.implementation();
\`\`\`

This leverages ${model.name}'s ${model.modelType} capabilities for optimal results.`,

    chat: `Based on your question about "${prompt.slice(0, 80)}...", here's my response:

${model.name} provides excellent support for this type of query. The key points to consider are:

• Context window of ${model.contextWindow.toLocaleString()} tokens allows for comprehensive analysis
• ${model.capabilities.map(c => c.name).join(", ")} capabilities enable thorough processing
• Cost-effective at $${model.inputCostPer1M}/1M input tokens

I recommend proceeding with a structured approach that takes advantage of these features.`,

    vision: `I've analyzed the image/content you provided. Here's what I observe:

**Visual Analysis:**
- Clear composition with well-defined elements
- Good color balance and contrast
- Professional quality overall

**Technical Details:**
Using ${model.name} with vision capabilities:
- Resolution: High
- Format: Compatible
- Processing: Optimized for ${model.contextWindow.toLocaleString()} token context

**Recommendations:**
Based on this analysis, I suggest proceeding with confidence in the quality and suitability of the content.`,

    embedding: `Embedding generation complete using ${model.name}.

**Vector Details:**
- Dimensions: 768 (standard)
- Normalized: Yes
- Magnitude: 1.0

**Usage:**
\`\`\`python
import numpy as np

embedding = np.array([...])  # 768-dimensional vector
similarity = np.dot(embedding, reference_embedding)
\`\`\`

This embedding can be used for semantic search, clustering, and similarity comparisons.`,
  };

  return responses[model.modelType] || responses.chat;
}

function calculateCost(model: Model, tokens: number): number {
  // Rough estimate: assume 50/50 input/output split
  const inputTokens = tokens * 0.5;
  const outputTokens = tokens * 0.5;
  
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
  
  return inputCost + outputCost;
}
