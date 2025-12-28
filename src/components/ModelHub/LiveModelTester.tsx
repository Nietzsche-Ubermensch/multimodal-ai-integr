import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Stop,
  Copy,
  Trash,
  Sparkle,
  Timer,
  CurrencyDollar,
  Hash,
  CheckCircle,
  XCircle,
  Warning,
  ArrowsClockwise,
  Gear
} from "@phosphor-icons/react";
import { UNIFIED_MODEL_CATALOG, Model } from "@/data/models";
import { useKV } from "@github/spark/hooks";
import { toast } from "sonner";

interface StreamingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TestResult {
  id: string;
  modelId: string;
  modelName: string;
  prompt: string;
  response: string;
  status: "streaming" | "complete" | "error";
  startTime: number;
  endTime?: number;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  cost?: number;
  latency?: number;
  error?: string;
}

export function LiveModelTester() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [testResults, setTestResults] = useKV<TestResult[]>("live-test-results", []);
  const [apiKeys] = useKV<Record<string, string>>("api-keys", {});
  
  // Model parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1.0);
  const [enableStreaming, setEnableStreaming] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentResponse, messages]);

  const getProviderApiKey = (provider: string): string | undefined => {
    const keyMap: Record<string, string> = {
      "xai": "XAI_API_KEY",
      "deepseek": "DEEPSEEK_API_KEY",
      "anthropic": "ANTHROPIC_API_KEY",
      "openrouter": "OPENROUTER_API_KEY",
      "huggingface": "HUGGINGFACE_TOKEN",
      "openai": "OPENAI_API_KEY",
      "nvidia": "NVIDIA_NIM_API_KEY"
    };
    
    return apiKeys?.[keyMap[provider]];
  };

  const buildApiUrl = (model: Model): string => {
    const baseUrls: Record<string, string> = {
      "xai": "https://api.x.ai/v1/chat/completions",
      "deepseek": "https://api.deepseek.com/chat/completions",
      "anthropic": "https://api.anthropic.com/v1/messages",
      "openrouter": "https://openrouter.ai/api/v1/chat/completions",
      "huggingface": "https://api-inference.huggingface.co/models",
      "openai": "https://api.openai.com/v1/chat/completions",
      "nvidia": "https://integrate.api.nvidia.com/v1/chat/completions"
    };
    
    if (model.provider === "huggingface") {
      return `${baseUrls.huggingface}/${model.id.replace("huggingface/", "")}`;
    }
    
    return baseUrls[model.provider];
  };

  const buildRequestBody = (model: Model, messages: StreamingMessage[]) => {
    const baseBody = {
      model: model.id.includes("/") ? model.id.split("/").pop() : model.id,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: enableStreaming
    };

    // Provider-specific adjustments
    if (model.provider === "anthropic") {
      return {
        model: baseBody.model,
        max_tokens: maxTokens,
        messages: messages.filter(m => m.role !== "system"),
        system: messages.find(m => m.role === "system")?.content,
        temperature,
        stream: enableStreaming
      };
    }

    if (model.provider === "huggingface") {
      return {
        inputs: messages.map(m => m.content).join("\n"),
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
          top_p: topP,
          return_full_text: false
        },
        stream: enableStreaming
      };
    }

    return {
      ...baseBody,
      top_p: topP
    };
  };

  const buildHeaders = (model: Model): Record<string, string> => {
    const apiKey = getProviderApiKey(model.provider);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (model.provider === "anthropic") {
      headers["x-api-key"] = apiKey || "";
      headers["anthropic-version"] = "2023-06-01";
    } else if (model.provider === "huggingface") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (model.provider === "openrouter") {
      headers["HTTP-Referer"] = window.location.origin;
      headers["X-Title"] = "ModelHub Live Tester";
    }

    return headers;
  };

  const streamResponse = async (model: Model, messages: StreamingMessage[]) => {
    const apiKey = getProviderApiKey(model.provider);
    
    if (!apiKey) {
      throw new Error(`API key not configured for ${model.provider}`);
    }

    const url = buildApiUrl(model);
    const headers = buildHeaders(model);
    const body = buildRequestBody(model, messages);

    abortControllerRef.current = new AbortController();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    if (!enableStreaming || !response.body) {
      const data = await response.json();
      return extractMessageContent(data, model.provider);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = extractStreamContent(parsed, model.provider);
              
              if (content) {
                fullResponse += content;
                setCurrentResponse(fullResponse);
              }
            } catch (e) {
              console.warn("Failed to parse SSE chunk:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  };

  const extractStreamContent = (data: any, provider: string): string => {
    if (provider === "anthropic") {
      if (data.type === "content_block_delta" && data.delta?.text) {
        return data.delta.text;
      }
    } else if (provider === "huggingface") {
      if (data.token?.text) {
        return data.token.text;
      }
    } else {
      // OpenAI-compatible (xAI, DeepSeek, OpenRouter, OpenAI, NVIDIA)
      if (data.choices?.[0]?.delta?.content) {
        return data.choices[0].delta.content;
      }
    }
    
    return "";
  };

  const extractMessageContent = (data: any, provider: string): string => {
    if (provider === "anthropic") {
      return data.content?.[0]?.text || "";
    } else if (provider === "huggingface") {
      return data[0]?.generated_text || data.generated_text || "";
    } else {
      return data.choices?.[0]?.message?.content || "";
    }
  };

  const calculateCost = (model: Model, inputTokens: number, outputTokens: number): number => {
    const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
    return inputCost + outputCost;
  };

  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const runTest = async () => {
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const apiKey = getProviderApiKey(selectedModel.provider);
    if (!apiKey) {
      toast.error(`API key not configured for ${selectedModel.provider}`);
      return;
    }

    const testId = `test-${Date.now()}`;
    const startTime = Date.now();

    const newMessages: StreamingMessage[] = [
      ...messages,
      { role: "user", content: prompt }
    ];

    setMessages(newMessages);
    setCurrentResponse("");
    setIsStreaming(true);
    setPrompt("");

    const newResult: TestResult = {
      id: testId,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      prompt,
      response: "",
      status: "streaming",
      startTime
    };

    setTestResults(current => [...(current || []), newResult]);

    try {
      const response = await streamResponse(selectedModel, newMessages);
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const inputTokens = estimateTokens(newMessages.map(m => m.content).join(" "));
      const outputTokens = estimateTokens(response);
      const totalTokens = inputTokens + outputTokens;
      const cost = calculateCost(selectedModel, inputTokens, outputTokens);

      setMessages([...newMessages, { role: "assistant", content: response }]);
      setCurrentResponse("");

      setTestResults(current =>
        (current || []).map(r =>
          r.id === testId
            ? {
                ...r,
                response,
                status: "complete",
                endTime,
                latency,
                tokensUsed: { input: inputTokens, output: outputTokens, total: totalTokens },
                cost
              }
            : r
        )
      );

      toast.success("Response complete", {
        description: `${latency}ms · ${totalTokens} tokens · $${cost.toFixed(4)}`
      });
    } catch (error: any) {
      console.error("Test error:", error);
      
      setTestResults(current =>
        (current || []).map(r =>
          r.id === testId
            ? {
                ...r,
                status: "error" as const,
                endTime: Date.now(),
                error: error.message
              }
            : r
        )
      );

      toast.error("Test failed", {
        description: error.message
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      toast.info("Streaming stopped");
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentResponse("");
    setPrompt("");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const copyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const availableModels = UNIFIED_MODEL_CATALOG.filter(model => {
    const apiKey = getProviderApiKey(model.provider);
    return !!apiKey;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={20} />
            Configuration
          </CardTitle>
          <CardDescription>
            Configure model and parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={selectedModel?.id}
              onValueChange={(id) => {
                const model = availableModels.find(m => m.id === id);
                setSelectedModel(model || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No models available. Configure API keys first.
                  </div>
                ) : (
                  availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedModel && (
            <>
              <Separator />
              
              {/* Model Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Context Window</span>
                  <span className="font-mono">{selectedModel.contextWindow.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="secondary">{selectedModel.modelType}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost (per 1M)</span>
                  <span className="font-mono text-xs">
                    ${selectedModel.inputCostPer1M} / ${selectedModel.outputCostPer1M}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Parameters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Temperature</Label>
                    <span className="text-sm font-mono">{temperature.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={([val]) => setTemperature(val)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Tokens</Label>
                    <span className="text-sm font-mono">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([val]) => setMaxTokens(val)}
                    min={100}
                    max={4000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Top P</Label>
                    <span className="text-sm font-mono">{topP.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[topP]}
                    onValueChange={([val]) => setTopP(val)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming">Enable Streaming</Label>
                  <Switch
                    id="streaming"
                    checked={enableStreaming}
                    onCheckedChange={setEnableStreaming}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Testing Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle size={20} />
            Live Testing
          </CardTitle>
          <CardDescription>
            Send prompts and see real-time streaming responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversation Display */}
          <ScrollArea className="h-[400px] border rounded-lg p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && !currentResponse && (
                <div className="flex items-center justify-center h-[360px] text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Sparkle size={48} className="mx-auto opacity-20" />
                    <p>Start a conversation</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-xs font-mono mb-1 opacity-70">
                      {msg.role}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {currentResponse && (
                <div className="flex gap-3 justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="text-xs font-mono mb-1 opacity-70 flex items-center gap-1">
                      assistant
                      <span className="animate-pulse">▊</span>
                    </div>
                    <div className="whitespace-pre-wrap">{currentResponse}</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  runTest();
                }
              }}
            />
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Button onClick={stopStreaming} variant="destructive" className="gap-2">
                  <Stop size={16} weight="fill" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={runTest}
                  disabled={!selectedModel || !prompt.trim()}
                  className="gap-2"
                >
                  <Play size={16} weight="fill" />
                  Send (⌘+Enter)
                </Button>
              )}
              
              <Button onClick={clearConversation} variant="outline" size="icon">
                <Trash size={16} />
              </Button>

              <div className="flex-1" />

              {selectedModel && prompt && (
                <div className="text-xs text-muted-foreground font-mono">
                  Est. {estimateTokens(prompt)} tokens
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash size={20} />
                Test Results
              </CardTitle>
              <CardDescription>
                {(testResults || []).length} test{(testResults || []).length !== 1 ? "s" : ""} run
              </CardDescription>
            </div>
            {(testResults || []).length > 0 && (
              <Button onClick={clearResults} variant="outline" size="sm" className="gap-2">
                <Trash size={16} />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {(testResults || []).length === 0 ? (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Hash size={48} className="mx-auto opacity-20" />
                    <p>No tests run yet</p>
                  </div>
                </div>
              ) : (
                (testResults || []).map((result) => (
                  <Card key={result.id} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{result.modelName}</span>
                            {result.status === "complete" && (
                              <CheckCircle size={16} className="text-success" weight="fill" />
                            )}
                            {result.status === "error" && (
                              <XCircle size={16} className="text-destructive" weight="fill" />
                            )}
                            {result.status === "streaming" && (
                              <ArrowsClockwise size={16} className="text-primary animate-spin" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {result.prompt}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyResponse(result.response || result.error || "")}
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {result.status === "complete" && (
                        <>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Timer size={14} />
                              <span>{result.latency}ms</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash size={14} />
                              <span>{result.tokensUsed?.total} tokens</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CurrencyDollar size={14} />
                              <span>${result.cost?.toFixed(6)}</span>
                            </div>
                          </div>
                          <div className="text-sm bg-background rounded p-2 max-h-32 overflow-auto">
                            <p className="whitespace-pre-wrap line-clamp-4">{result.response}</p>
                          </div>
                        </>
                      )}
                      
                      {result.status === "error" && (
                        <Alert variant="destructive">
                          <Warning size={16} />
                          <AlertDescription className="text-xs">
                            {result.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.status === "streaming" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ArrowsClockwise size={16} className="animate-spin" />
                          Streaming response...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
