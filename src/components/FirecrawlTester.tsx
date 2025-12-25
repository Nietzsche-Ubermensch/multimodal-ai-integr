import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Copy, 
  CheckCircle, 
  XCircle, 
  CircleNotch,
  Globe,
  FileText,
  Sparkle,
  Code
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogImage?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

type ApiMode = "scrape" | "map" | "search";

export function FirecrawlTester() {
  const [url, setUrl] = useState("https://firecrawl.dev");
  const [searchQuery, setSearchQuery] = useState("latest AI models 2024");
  const [apiMode, setApiMode] = useState<ApiMode>("scrape");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FirecrawlResponse | null>(null);
  const [useRealApi, setUseRealApi] = useState(false);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [onlyMainContent, setOnlyMainContent] = useState(true);

  const handleScrape = async () => {
    setLoading(true);
    setResponse(null);

    try {
      if (useRealApi) {
        const apiKey = prompt("Enter your Firecrawl API key (get one at firecrawl.dev):");
        if (!apiKey) {
          toast.error("API key required for real API testing");
          setLoading(false);
          return;
        }

        const formats = ["markdown"];
        if (includeHtml) formats.push("html");

        let result;
        if (apiMode === "scrape") {
          const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              url,
              formats,
              onlyMainContent
            })
          });

          result = await scrapeResponse.json();
        } else if (apiMode === "map") {
          const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              url
            })
          });

          result = await mapResponse.json();
        } else {
          const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              query: searchQuery,
              limit: 5,
              scrapeOptions: {
                formats,
                onlyMainContent
              }
            })
          });

          result = await searchResponse.json();
        }

        setResponse(result);
        toast.success(`${apiMode.charAt(0).toUpperCase() + apiMode.slice(1)} completed successfully!`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (apiMode === "scrape") {
          setResponse({
            success: true,
            data: {
              markdown: `# ${url}\n\n## Demo Content\n\nThis is a **simulated** response from Firecrawl API.\n\n### Key Features:\n- Clean Markdown extraction\n- Automatic content cleaning\n- JavaScript rendering support\n- Anti-bot bypass\n\n> Enable "Use Real API" to test with actual Firecrawl API\n\nGet your API key at [firecrawl.dev](https://firecrawl.dev)`,
              html: includeHtml ? "<html><body><h1>Demo Content</h1><p>This is simulated HTML content</p></body></html>" : undefined,
              metadata: {
                title: "Demo Page Title",
                description: "This is a simulated scraping response",
                statusCode: 200
              }
            }
          });
        } else if (apiMode === "map") {
          setResponse({
            success: true,
            data: {
              markdown: JSON.stringify({
                links: [
                  "/",
                  "/about",
                  "/products",
                  "/blog",
                  "/contact",
                  "/docs",
                  "/api",
                  "/pricing"
                ],
                totalLinks: 8
              }, null, 2)
            }
          });
        } else {
          setResponse({
            success: true,
            data: {
              markdown: JSON.stringify({
                results: [
                  {
                    title: "Latest AI Models in 2024",
                    url: "https://example.com/ai-models-2024",
                    content: "# Latest AI Models 2024\n\nGPT-4, Claude 3.5, Gemini Pro...",
                    relevance: 0.95
                  },
                  {
                    title: "AI Model Comparison",
                    url: "https://example.com/comparison",
                    content: "# Model Comparison\n\nDeepSeek R1 vs GPT-4...",
                    relevance: 0.89
                  }
                ],
                totalResults: 2
              }, null, 2)
            }
          });
        }

        toast.success("Demo response generated (simulated)");
      }
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getCodeExample = () => {
    if (apiMode === "scrape") {
      return `from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key='fc-...')

result = app.scrape_url(
    "${url}",
    params={
        'formats': ['markdown'${includeHtml ? ", 'html'" : ""}],
        'onlyMainContent': ${onlyMainContent}
    }
)

print(result['markdown'])`;
    } else if (apiMode === "map") {
      return `from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key='fc-...')

result = app.map_url("${url}")

print(result['links'])`;
    } else {
      return `from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key='fc-...')

result = app.search({
    'query': '${searchQuery}',
    'limit': 5,
    'scrapeOptions': {
        'formats': ['markdown'],
        'onlyMainContent': ${onlyMainContent}
    }
})

for item in result['data']:
    print(item['title'], item['url'])`;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Globe size={32} weight="bold" className="text-accent" />
            Live Firecrawl API Tester
          </h2>
          <p className="text-muted-foreground mt-2">
            Test real-time web scraping with LLM-ready output formats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="real-api" className="text-sm">Real API</Label>
          <Switch
            id="real-api"
            checked={useRealApi}
            onCheckedChange={setUseRealApi}
          />
          {useRealApi && (
            <Badge variant="destructive" className="animate-pulse">
              Live
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={apiMode} onValueChange={(v) => setApiMode(v as ApiMode)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrape">
            <FileText size={16} className="mr-2" weight="bold" />
            Scrape
          </TabsTrigger>
          <TabsTrigger value="map">
            <Globe size={16} className="mr-2" weight="bold" />
            Map
          </TabsTrigger>
          <TabsTrigger value="search">
            <Sparkle size={16} className="mr-2" weight="bold" />
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="flex-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scrape Configuration</CardTitle>
              <CardDescription>Extract clean content from a single URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Target URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="include-html"
                    checked={includeHtml}
                    onCheckedChange={setIncludeHtml}
                  />
                  <Label htmlFor="include-html" className="text-sm cursor-pointer">
                    Include HTML
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="main-content"
                    checked={onlyMainContent}
                    onCheckedChange={setOnlyMainContent}
                  />
                  <Label htmlFor="main-content" className="text-sm cursor-pointer">
                    Only Main Content
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleScrape} 
                disabled={loading || !url}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" weight="fill" />
                    Scrape URL
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="flex-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Map Configuration</CardTitle>
              <CardDescription>Discover all URLs on a domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="map-url">Domain URL</Label>
                <Input
                  id="map-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <Button 
                onClick={handleScrape} 
                disabled={loading || !url}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" />
                    Mapping...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" weight="fill" />
                    Map URLs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="flex-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Configuration</CardTitle>
              <CardDescription>Web search with automatic content scraping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search query..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="search-main-content"
                  checked={onlyMainContent}
                  onCheckedChange={setOnlyMainContent}
                />
                <Label htmlFor="search-main-content" className="text-sm cursor-pointer">
                  Only Main Content
                </Label>
              </div>

              <Button 
                onClick={handleScrape} 
                disabled={loading || !searchQuery}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" weight="fill" />
                    Search & Scrape
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {response && (
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {response.success ? (
                  <>
                    <CheckCircle size={24} weight="fill" className="text-green-500" />
                    Response
                  </>
                ) : (
                  <>
                    <XCircle size={24} weight="fill" className="text-red-500" />
                    Error
                  </>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
              >
                <Copy size={16} className="mr-2" />
                Copy JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                  {response.success ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {response.data?.markdown || JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>{response.error}</AlertDescription>
                    </Alert>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="json">
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="code">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(getCodeExample())}
                  >
                    <Copy size={16} />
                  </Button>
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <pre className="text-xs font-mono">
                      {getCodeExample()}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!useRealApi && (
        <Alert>
          <Code size={16} />
          <AlertDescription>
            Demo mode active. Enable "Real API" to test with actual Firecrawl API.
            Get your free API key at <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline font-semibold">firecrawl.dev</a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
