import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GithubLogo,
  Robot,
  Lightning,
  Eye,
  Code,
  Brain,
  MagnifyingGlass,
  PaperPlaneTilt,
  ArrowsClockwise,
  Copy,
  Trash,
  CheckCircle,
  Warning,
  Sparkle,
  CurrencyDollar,
  Clock,
  Key,
  ArrowRight,
  Funnel,
  GridFour,
  List,
  Star,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createGitHubModelsClient,
  GITHUB_MODELS_CATALOG,
  PROVIDER_NAMES,
  PROVIDER_COLORS,
  getProviders,
  getChatModels,
  getVisionModels,
  getReasoningModels,
  getFreeModels,
  calculateCost,
  type GitHubModel,
  type GitHubModelsClient,
  type ChatMessage,
  type ModelCapability,
} from "@/lib/github-models-client";

// ============================================================================
// GitHub Models Playground Component
// ============================================================================

export function GitHubModelsPlayground() {
  // Config State
  const [githubToken, setGithubToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<GitHubModel | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterCapability, setFilterCapability] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");

  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [streamEnabled, setStreamEnabled] = useState(true);

  // Stats
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [latency, setLatency] = useState(0);

  // Client ref
  const clientRef = useRef<GitHubModelsClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter models
  const filteredModels = GITHUB_MODELS_CATALOG.filter(model => {
    if (filterProvider !== "all" && model.provider !== filterProvider) return false;
    if (filterCapability !== "all" && !model.capabilities.includes(filterCapability as ModelCapability)) return false;
    if (showFreeOnly && (model.inputCostPer1M > 0 || model.outputCostPer1M > 0)) return false;
    if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !model.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Validate token
  const validateToken = async () => {
    if (!githubToken.trim()) {
      toast.error("Please enter a GitHub token");
      return;
    }

    setIsValidating(true);
    try {
      const client = createGitHubModelsClient(githubToken);
      const result = await client.validateToken();
      
      if (result.valid) {
        setIsTokenValid(true);
        clientRef.current = client;
        toast.success("GitHub token validated successfully!");
      } else {
        setIsTokenValid(false);
        toast.error(result.error || "Invalid token");
      }
    } catch (error) {
      setIsTokenValid(false);
      toast.error("Failed to validate token");
    } finally {
      setIsValidating(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;
    if (!selectedModel) {
      toast.error("Please select a model first");
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };

    const allMessages: ChatMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
      userMessage,
    ];

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    const startTime = Date.now();

    try {
      // Demo response (in production, use actual API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: generateDemoResponse(inputMessage, selectedModel),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update stats
      const inputTokens = Math.ceil(inputMessage.length / 4);
      const outputTokens = Math.ceil(assistantMessage.content.length / 4);
      setTotalTokens(prev => prev + inputTokens + outputTokens);
      setTotalCost(prev => prev + calculateCost(selectedModel, inputTokens, outputTokens));
      setLatency(Date.now() - startTime);

      toast.success("Response generated!");
    } catch (error) {
      toast.error("Failed to generate response");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate demo response
  const generateDemoResponse = (input: string, model: GitHubModel): string => {
    return `**Response from ${model.name}** (${PROVIDER_NAMES[model.provider] || model.provider})

I received your message: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"

This is a demo response. To use real GitHub Models:

1. Get a GitHub token with the \`models:read\` scope
2. Enter your token in the configuration panel
3. Your requests will be sent to GitHub's model inference API

**Model Info:**
- Provider: ${PROVIDER_NAMES[model.provider] || model.provider}
- Context Window: ${model.contextWindow.toLocaleString()} tokens
- Capabilities: ${model.capabilities.join(', ')}
${model.inputCostPer1M === 0 ? '- **Free to use!**' : `- Cost: $${model.inputCostPer1M}/1M input, $${model.outputCostPer1M}/1M output`}

How can I help you further?`;
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setTotalTokens(0);
    setTotalCost(0);
    setLatency(0);
    toast.success("Chat cleared");
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  // Get capability icon
  const getCapabilityIcon = (cap: string) => {
    switch (cap) {
      case 'vision': return <Eye size={12} />;
      case 'code': return <Code size={12} />;
      case 'reasoning': return <Brain size={12} />;
      case 'function_calling': return <Lightning size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl">
              <GithubLogo size={28} className="text-gray-900" weight="fill" />
            </div>
            <div>
              <CardTitle className="text-2xl">GitHub Models Playground</CardTitle>
              <CardDescription className="text-gray-300">
                70+ models from OpenAI, Meta, Mistral, Cohere & more - all with a single GitHub token
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Token Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key size={20} />
            GitHub Token
          </CardTitle>
          <CardDescription>
            Use your GitHub token to access all models. No additional API keys needed!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => {
                  setGithubToken(e.target.value);
                  setIsTokenValid(null);
                }}
              />
              {isTokenValid !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isTokenValid ? (
                    <CheckCircle size={20} className="text-green-500" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-red-500" weight="fill" />
                  )}
                </div>
              )}
            </div>
            <Button onClick={validateToken} disabled={isValidating}>
              {isValidating ? (
                <ArrowsClockwise size={16} className="animate-spin" />
              ) : (
                "Validate"
              )}
            </Button>
          </div>
          
          {!githubToken && (
            <Alert>
              <GithubLogo size={16} />
              <AlertDescription>
                Get a token at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  github.com/settings/tokens
                </a>
                {" "}with the <code className="bg-muted px-1 rounded">models:read</code> scope
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Robot size={20} />
                  Models ({filteredModels.length})
                </span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("grid")}
                  >
                    <GridFour size={14} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("list")}
                  >
                    <List size={14} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2">
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {getProviders().map(p => (
                      <SelectItem key={p} value={p}>
                        {PROVIDER_NAMES[p] || p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCapability} onValueChange={setFilterCapability}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Capability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Capabilities</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="reasoning">Reasoning</SelectItem>
                    <SelectItem value="function_calling">Functions</SelectItem>
                    <SelectItem value="embeddings">Embeddings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  <Star size={14} className="text-yellow-500" />
                  Free models only
                </Label>
                <Switch
                  checked={showFreeOnly}
                  onCheckedChange={setShowFreeOnly}
                />
              </div>

              <Separator />

              {/* Model List */}
              <ScrollArea className="h-[400px]">
                <div className={viewMode === "grid" ? "grid grid-cols-1 gap-2" : "space-y-2"}>
                  {filteredModels.map(model => (
                    <div
                      key={model.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedModel?.id === model.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PROVIDER_COLORS[model.provider] || '#888' }}
                            />
                            <span className="font-medium text-sm truncate">{model.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {model.capabilities.slice(0, 3).map(cap => (
                              <Badge
                                key={cap}
                                variant="outline"
                                className="text-xs h-5 gap-1"
                              >
                                {getCapabilityIcon(cap)}
                                {cap}
                              </Badge>
                            ))}
                            {model.inputCostPer1M === 0 && (
                              <Badge className="text-xs h-5 bg-green-500/10 text-green-600 border-green-500/20">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected Model Info */}
          {selectedModel && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${PROVIDER_COLORS[selectedModel.provider]}20` }}
                    >
                      <Robot size={20} style={{ color: PROVIDER_COLORS[selectedModel.provider] }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedModel.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {PROVIDER_NAMES[selectedModel.provider]} • {selectedModel.contextWindow.toLocaleString()} context
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {totalTokens > 0 && (
                      <>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Sparkle size={14} />
                          <span>{totalTokens.toLocaleString()} tokens</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CurrencyDollar size={14} />
                          <span>${totalCost.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={14} />
                          <span>{latency}ms</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <Card className="flex flex-col" style={{ height: 'calc(100vh - 500px)', minHeight: '400px' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chat</CardTitle>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearChat}>
                    <Trash size={14} className="mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <GithubLogo size={48} className="text-muted-foreground/30 mb-4" />
                    <h3 className="font-medium mb-2">
                      {selectedModel ? `Chat with ${selectedModel.name}` : 'Select a model to start'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {selectedModel 
                        ? 'Start a conversation by typing a message below'
                        : 'Choose a model from the list on the left to begin chatting'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <span className="text-sm font-medium">U</span>
                          ) : (
                            <Robot size={16} />
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[80%] rounded-lg p-4 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          <div className={`flex gap-1 mt-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs opacity-70 hover:opacity-100"
                              onClick={() => copyMessage(msg.content)}
                            >
                              <Copy size={12} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Robot size={16} />
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <ArrowsClockwise size={16} className="animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder={selectedModel ? "Type your message..." : "Select a model first"}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={!selectedModel || isGenerating}
                  className="min-h-[60px] max-h-[120px] resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!selectedModel || !inputMessage.trim() || isGenerating}
                  className="h-[60px] px-6"
                >
                  {isGenerating ? (
                    <ArrowsClockwise size={20} className="animate-spin" />
                  ) : (
                    <PaperPlaneTilt size={20} />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Temperature</Label>
                    <span className="text-sm text-muted-foreground">{temperature}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Max Tokens</Label>
                    <span className="text-sm text-muted-foreground">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([v]) => setMaxTokens(v)}
                    min={256}
                    max={8192}
                    step={256}
                  />
                </div>

                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Input
                    placeholder="You are a helpful assistant..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
