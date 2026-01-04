import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe,
  Lightning,
  Robot,
  MagnifyingGlass,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Brain,
  Database,
  Code,
  Sparkle,
  TreeStructure,
  CaretRight,
  Copy,
  Download,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createScrapingRouter,
  ScrapingRouter,
  ScrapingRequest,
  ScrapingResult,
  ScraperProvider,
  RouterDecision,
  ScrapingConfig,
} from "@/lib/unified-scraping";

interface UnifiedScrapingProps {
  onScrapedContent?: (content: string, metadata: ScrapingResult['metadata']) => void;
}

export function UnifiedScrapingLayer({ onScrapedContent }: UnifiedScrapingProps) {
  // Configuration state
  const [config, setConfig] = useState<ScrapingConfig>({
    oxylabs: { apiKey: "" },
    firecrawl: { apiKey: "" },
    langchain: { openaiKey: "" },
  });

  // Request state
  const [url, setUrl] = useState("https://example.com");
  const [mode, setMode] = useState<ScrapingRequest['mode']>("scrape");
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [preferredProvider, setPreferredProvider] = useState<ScraperProvider | "auto">("auto");
  const [autoSelect, setAutoSelect] = useState(true);

  // Result state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<(ScrapingResult & { routerDecision?: RouterDecision }) | null>(null);
  const [routerDecision, setRouterDecision] = useState<RouterDecision | null>(null);

  // Router instance
  const [router] = useState(() => createScrapingRouter(config));

  const updateConfig = useCallback((provider: keyof ScrapingConfig, key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [key]: value,
      },
    }));
    
    // Update router config
    router.updateConfig({
      [provider]: {
        ...config[provider],
        [key]: value,
      },
    });
  }, [router, config]);

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      const request: ScrapingRequest = {
        url,
        mode,
        prompt: prompt || undefined,
        options: {
          formats: ["markdown", "text"],
          onlyMainContent: true,
          searchQuery: mode === "search" ? searchQuery : undefined,
        },
        preferredProvider: autoSelect ? undefined : (preferredProvider as ScraperProvider),
      };

      setProgress(30);

      // Get router decision first
      const decision = router.selectProvider(request);
      setRouterDecision(decision);
      
      setProgress(50);

      // Execute scraping
      const scrapeResult = await router.scrape(request);
      
      setProgress(90);
      setResult(scrapeResult);

      if (scrapeResult.success) {
        toast.success(`Successfully scraped with ${scrapeResult.provider}`);
        
        // Callback with scraped content
        if (onScrapedContent && scrapeResult.data.content) {
          onScrapedContent(scrapeResult.data.content, scrapeResult.metadata);
        }
      } else {
        toast.error(scrapeResult.error || "Scraping failed");
      }

      setProgress(100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scraping failed");
      setResult({
        success: false,
        provider: preferredProvider === "auto" ? "firecrawl" : preferredProvider,
        data: { content: "" },
        metadata: {
          url,
          scrapedAt: new Date().toISOString(),
          latencyMs: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getProviderIcon = (provider: ScraperProvider) => {
    switch (provider) {
      case "oxylabs":
        return <Globe size={16} weight="duotone" />;
      case "firecrawl":
        return <Lightning size={16} weight="duotone" />;
      case "langchain":
        return <Robot size={16} weight="duotone" />;
    }
  };

  const getProviderColor = (provider: ScraperProvider) => {
    switch (provider) {
      case "oxylabs":
        return "text-blue-500";
      case "firecrawl":
        return "text-orange-500";
      case "langchain":
        return "text-purple-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl">
              <TreeStructure size={28} className="text-primary-foreground" weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl">Unified Scraping Layer</CardTitle>
              <CardDescription className="text-base">
                Intelligent web scraping with automatic provider selection for RAG pipelines
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border">
              <Globe size={24} className="text-blue-500" weight="duotone" />
              <div>
                <p className="font-medium text-sm">Oxylabs</p>
                <p className="text-xs text-muted-foreground">AI-powered scraping</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border">
              <Lightning size={24} className="text-orange-500" weight="duotone" />
              <div>
                <p className="font-medium text-sm">Firecrawl</p>
                <p className="text-xs text-muted-foreground">Fast & reliable</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border">
              <Robot size={24} className="text-purple-500" weight="duotone" />
              <div>
                <p className="font-medium text-sm">LangChain</p>
                <p className="text-xs text-muted-foreground">Agent-based</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scrape" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scrape" className="gap-2">
            <MagnifyingGlass size={16} />
            Scrape
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Code size={16} />
            Configure
          </TabsTrigger>
          <TabsTrigger value="router" className="gap-2">
            <TreeStructure size={16} />
            Router
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <Database size={16} />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Scrape Tab */}
        <TabsContent value="scrape" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Scraping Request</CardTitle>
              <CardDescription>
                Configure and execute web scraping with automatic provider selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scraping Mode</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v as ScrapingRequest['mode'])} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scrape">
                        <div className="flex items-center gap-2">
                          <MagnifyingGlass size={14} />
                          Scrape (Single Page)
                        </div>
                      </SelectItem>
                      <SelectItem value="crawl">
                        <div className="flex items-center gap-2">
                          <Globe size={14} />
                          Crawl (Multiple Pages)
                        </div>
                      </SelectItem>
                      <SelectItem value="search">
                        <div className="flex items-center gap-2">
                          <Sparkle size={14} />
                          Search & Scrape
                        </div>
                      </SelectItem>
                      <SelectItem value="extract">
                        <div className="flex items-center gap-2">
                          <Brain size={14} />
                          AI Extract
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Provider Selection</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoSelect}
                      onCheckedChange={setAutoSelect}
                      disabled={loading}
                    />
                    <span className="text-sm">{autoSelect ? "Auto" : "Manual"}</span>
                  </div>
                </div>
              </div>

              {!autoSelect && (
                <div className="space-y-2">
                  <Label>Preferred Provider</Label>
                  <Select 
                    value={preferredProvider} 
                    onValueChange={(v) => setPreferredProvider(v as ScraperProvider | "auto")}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oxylabs">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-blue-500" />
                          Oxylabs AI Studio
                        </div>
                      </SelectItem>
                      <SelectItem value="firecrawl">
                        <div className="flex items-center gap-2">
                          <Lightning size={14} className="text-orange-500" />
                          Firecrawl
                        </div>
                      </SelectItem>
                      <SelectItem value="langchain">
                        <div className="flex items-center gap-2">
                          <Robot size={14} className="text-purple-500" />
                          LangChain Agent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mode === "search" && (
                <div className="space-y-2">
                  <Label>Search Query</Label>
                  <Input
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>AI Extraction Prompt (Optional)</Label>
                <Textarea
                  placeholder="Describe what data you want to extract, e.g., 'Extract all product names and prices'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Use natural language to specify extraction requirements
                </p>
              </div>

              {loading && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {progress < 30 ? "Initializing..." : 
                       progress < 50 ? "Selecting provider..." :
                       progress < 90 ? "Scraping content..." : "Complete!"}
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button
                onClick={handleScrape}
                disabled={loading || !url.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <ArrowsClockwise className="animate-spin mr-2" size={18} />
                    Scraping...
                  </>
                ) : (
                  <>
                    <MagnifyingGlass className="mr-2" size={18} />
                    Start Scraping
                  </>
                )}
              </Button>

              {/* Router Decision Display */}
              {routerDecision && (
                <Alert className="border-primary/30 bg-primary/5">
                  <TreeStructure size={18} className="text-primary" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Router Decision</span>
                        <Badge variant="outline" className="gap-1">
                          {Math.round(routerDecision.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Selected:</span>
                        <Badge className={`gap-1 ${getProviderColor(routerDecision.selectedProvider)}`}>
                          {getProviderIcon(routerDecision.selectedProvider)}
                          {routerDecision.selectedProvider}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{routerDecision.reason}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configure Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API keys for each scraping provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Oxylabs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-blue-500" weight="duotone" />
                  <Label className="font-semibold">Oxylabs AI Studio</Label>
                  <Badge variant="outline" className="ml-auto">
                    {config.oxylabs?.apiKey ? "Configured" : "Not configured"}
                  </Badge>
                </div>
                <Input
                  type="password"
                  placeholder="Enter Oxylabs API key"
                  value={config.oxylabs?.apiKey || ""}
                  onChange={(e) => updateConfig("oxylabs", "apiKey", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key at{" "}
                  <a href="https://oxylabs.io" target="_blank" rel="noopener noreferrer" className="underline">
                    oxylabs.io
                  </a>
                </p>
              </div>

              <Separator />

              {/* Firecrawl */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightning size={20} className="text-orange-500" weight="duotone" />
                  <Label className="font-semibold">Firecrawl</Label>
                  <Badge variant="outline" className="ml-auto">
                    {config.firecrawl?.apiKey ? "Configured" : "Not configured"}
                  </Badge>
                </div>
                <Input
                  type="password"
                  placeholder="Enter Firecrawl API key (fc-...)"
                  value={config.firecrawl?.apiKey || ""}
                  onChange={(e) => updateConfig("firecrawl", "apiKey", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key at{" "}
                  <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline">
                    firecrawl.dev
                  </a>
                </p>
              </div>

              <Separator />

              {/* LangChain */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Robot size={20} className="text-purple-500" weight="duotone" />
                  <Label className="font-semibold">LangChain Agents</Label>
                  <Badge variant="outline" className="ml-auto">
                    {config.langchain?.openaiKey ? "Configured" : "Not configured"}
                  </Badge>
                </div>
                <Input
                  type="password"
                  placeholder="Enter OpenAI API key for LangChain agents"
                  value={config.langchain?.openaiKey || ""}
                  onChange={(e) => updateConfig("langchain", "openaiKey", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for LangChain agent-based scraping with GPT-4
                </p>
              </div>

              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  API keys are stored in browser memory only and never sent to external servers except the respective API endpoints.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Router Tab */}
        <TabsContent value="router" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Router</CardTitle>
              <CardDescription>
                Understand how the router automatically selects providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/30">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TreeStructure size={18} />
                  Auto-Selection Algorithm
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CaretRight size={14} />
                    <span>Evaluates task requirements (scrape/crawl/search/extract)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CaretRight size={14} />
                    <span>Checks provider capabilities and configuration status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CaretRight size={14} />
                    <span>Considers AI extraction needs for complex prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CaretRight size={14} />
                    <span>Optimizes for latency and cost efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CaretRight size={14} />
                    <span>Returns confidence score with reasoning</span>
                  </div>
                </div>
              </div>

              {/* Provider Capabilities */}
              <div className="space-y-4">
                <h4 className="font-semibold">Provider Capabilities</h4>
                
                <div className="grid gap-4">
                  {(["oxylabs", "firecrawl", "langchain"] as ScraperProvider[]).map((provider) => {
                    const caps = router.getCapabilities(provider);
                    return (
                      <Card key={provider} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          {getProviderIcon(provider)}
                          <span className="font-semibold capitalize">{provider}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <Badge variant={caps.scrape ? "default" : "outline"}>
                            Scrape {caps.scrape ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={caps.crawl ? "default" : "outline"}>
                            Crawl {caps.crawl ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={caps.search ? "default" : "outline"}>
                            Search {caps.search ? "✓" : "✗"}
                          </Badge>
                          <Badge variant={caps.aiPowered ? "default" : "outline"}>
                            AI-Powered {caps.aiPowered ? "✓" : "✗"}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Avg latency: {caps.avgLatencyMs}ms | Cost: ${caps.costPerRequest}/req | Max pages: {caps.maxPagesPerRequest}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scraping Results</CardTitle>
                  <CardDescription>
                    View and export scraped content
                  </CardDescription>
                </div>
                {result && result.success && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.data.content)}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([result.data.markdown || result.data.content], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `scraped-${Date.now()}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Downloaded as markdown");
                      }}
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <Alert>
                  <MagnifyingGlass size={16} />
                  <AlertDescription>
                    No scraping results yet. Configure a URL and click "Start Scraping" to begin.
                  </AlertDescription>
                </Alert>
              ) : result.success ? (
                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="font-medium flex items-center gap-1">
                        {getProviderIcon(result.provider)}
                        {result.provider}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Latency</p>
                      <p className="font-medium">{result.metadata.latencyMs}ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Content Length</p>
                      <p className="font-medium">{result.data.content.length} chars</p>
                    </div>
                    {result.metadata.tokensUsed && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Tokens Used</p>
                        <p className="font-medium">{result.metadata.tokensUsed}</p>
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-2">
                    <Label>Scraped Content</Label>
                    <ScrollArea className="h-96 rounded-lg border p-4 bg-muted/30">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {result.data.markdown || result.data.content}
                      </pre>
                    </ScrollArea>
                  </div>

                  {/* Structured Data */}
                  {result.data.structuredData && (
                    <div className="space-y-2">
                      <Label>Structured Data</Label>
                      <ScrollArea className="h-48 rounded-lg border p-4 bg-muted/30">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {JSON.stringify(result.data.structuredData, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Links */}
                  {result.data.links && result.data.links.length > 0 && (
                    <div className="space-y-2">
                      <Label>Discovered Links ({result.data.links.length})</Label>
                      <ScrollArea className="h-32 rounded-lg border p-4 bg-muted/30">
                        <div className="space-y-1">
                          {result.data.links.map((link, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              {link}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <Warning size={16} />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Scraping failed</p>
                      <p className="text-sm">{result.error}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
