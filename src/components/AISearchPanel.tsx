import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MagnifyingGlass,
  Globe,
  Newspaper,
  Image,
  GraduationCap,
  Code,
  Lightning,
  ArrowsClockwise,
  Link,
  CaretRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Coins,
  Sparkle,
  Robot,
  ArrowRight,
  Key,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createAISearchEngine,
  type AISearchEngine,
  type AISearchResult,
  type SearchSource,
  type SearchMode,
  type AISearchConfig,
} from "@/lib/ai-search-service";

interface SearchHistoryEntry {
  id: string;
  query: string;
  result: AISearchResult;
  timestamp: string;
}

export function AISearchPanel() {
  // Config state
  const [config, setConfig] = useState<AISearchConfig>({
    firecrawlApiKey: "",
    oxylabsApiKey: "",
    groqApiKey: "",
    openaiApiKey: "",
  });
  const [showConfig, setShowConfig] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("web");
  const [isSearching, setIsSearching] = useState(false);
  const [currentResult, setCurrentResult] = useState<AISearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

  // Engine ref
  const engineRef = useRef<AISearchEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    engineRef.current = createAISearchEngine(config);
  }, []);

  // Update engine config
  const updateConfig = useCallback((newConfig: Partial<AISearchConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  }, []);

  // Handle search
  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setCurrentResult(null);

    try {
      if (!engineRef.current) {
        engineRef.current = createAISearchEngine(config);
      }

      const result = await engineRef.current.search(q, {
        mode: searchMode,
        maxSources: 5,
        synthesizeAnswer: true,
      });

      setCurrentResult(result);

      // Add to history
      const historyEntry: SearchHistoryEntry = {
        id: crypto.randomUUID(),
        query: q,
        result,
        timestamp: new Date().toISOString(),
      };
      setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

      toast.success(`Found ${result.sources.length} sources`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle follow-up question click
  const handleFollowUp = (question: string) => {
    setQuery(question);
    handleSearch(question);
  };

  // Copy answer to clipboard
  const copyAnswer = () => {
    if (currentResult?.answer) {
      navigator.clipboard.writeText(currentResult.answer);
      toast.success("Answer copied to clipboard");
    }
  };

  const getModeIcon = (mode: SearchMode) => {
    switch (mode) {
      case "web":
        return <Globe size={16} />;
      case "news":
        return <Newspaper size={16} />;
      case "images":
        return <Image size={16} />;
      case "academic":
        return <GraduationCap size={16} />;
      case "code":
        return <Code size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-background border-orange-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Sparkle size={28} className="text-white" weight="duotone" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Search</CardTitle>
                <CardDescription className="text-base">
                  Perplexity-style AI search with web scraping and answer synthesis
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Key size={16} className="mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Config Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Configuration</CardTitle>
            <CardDescription>
              Configure API keys for web search and AI synthesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Firecrawl API Key</Label>
                <Input
                  type="password"
                  placeholder="fc-..."
                  value={config.firecrawlApiKey}
                  onChange={(e) => updateConfig({ firecrawlApiKey: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  For web search and scraping. Get key at firecrawl.dev
                </p>
              </div>
              <div className="space-y-2">
                <Label>Oxylabs AI Studio Key</Label>
                <Input
                  type="password"
                  placeholder="Enter key..."
                  value={config.oxylabsApiKey}
                  onChange={(e) => updateConfig({ oxylabsApiKey: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  For AI-powered scraping. Get key at aistudio.oxylabs.io
                </p>
              </div>
              <div className="space-y-2">
                <Label>Groq API Key</Label>
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={config.groqApiKey}
                  onChange={(e) => updateConfig({ groqApiKey: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  For fast answer synthesis with Llama 3.1
                </p>
              </div>
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={config.openaiApiKey}
                  onChange={(e) => updateConfig({ openaiApiKey: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Fallback for answer synthesis
                </p>
              </div>
            </div>
            <Alert>
              <Lightning size={16} />
              <AlertDescription>
                Without API keys, the search will use demo data. Configure at least one search provider and one LLM for full functionality.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Mode Tabs */}
            <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as SearchMode)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="web" className="gap-2">
                  <Globe size={14} />
                  Web
                </TabsTrigger>
                <TabsTrigger value="news" className="gap-2">
                  <Newspaper size={14} />
                  News
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-2">
                  <Image size={14} />
                  Images
                </TabsTrigger>
                <TabsTrigger value="academic" className="gap-2">
                  <GraduationCap size={14} />
                  Academic
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code size={14} />
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder="Ask anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="pl-10 h-12 text-lg"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                size="lg"
                className="h-12 px-6"
              >
                {isSearching ? (
                  <ArrowsClockwise size={20} className="animate-spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            {!currentResult && !isSearching && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {[
                  "What is RAG in AI?",
                  "Best web scraping tools 2024",
                  "How to build an AI agent",
                  "LangChain vs LlamaIndex",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArrowsClockwise size={24} className="animate-spin text-primary" />
                <div>
                  <p className="font-medium">Searching the web...</p>
                  <p className="text-sm text-muted-foreground">
                    Finding and analyzing relevant sources
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {currentResult && !isSearching && (
        <div className="space-y-4">
          {/* Answer Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Robot size={20} className="text-primary" />
                  <CardTitle className="text-lg">AI Answer</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock size={12} />
                    {currentResult.metadata.processingTimeMs}ms
                  </Badge>
                  {currentResult.metadata.tokensUsed > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Sparkle size={12} />
                      {currentResult.metadata.tokensUsed} tokens
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {currentResult.metadata.model}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed bg-transparent p-0 border-none">
                  {currentResult.answer}
                </pre>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyAnswer}>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsUp size={14} className="mr-1" />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown size={14} className="mr-1" />
                    Not helpful
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentResult.sources.length} sources analyzed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link size={20} />
                Sources ({currentResult.sources.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {currentResult.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{source.title}</p>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {source.url}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {source.snippet}
                        </p>
                      </div>
                      <CaretRight size={16} className="text-muted-foreground flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Questions */}
          {currentResult.followUpQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkle size={20} />
                  Related Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {currentResult.followUpQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 text-left"
                      onClick={() => handleFollowUp(question)}
                    >
                      <MagnifyingGlass size={16} className="mr-3 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !isSearching && !currentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchHistory.map((entry) => (
                  <Button
                    key={entry.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => {
                      setQuery(entry.query);
                      setCurrentResult(entry.result);
                    }}
                  >
                    <MagnifyingGlass size={16} className="mr-3 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{entry.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.result.sources.length} sources • {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <CaretRight size={16} className="text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
