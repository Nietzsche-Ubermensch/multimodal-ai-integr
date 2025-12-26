import { useState } from "react";
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
import { 
  Globe, 
  Lightning, 
  Code,
  MagnifyingGlass,
  Robot,
  CheckCircle,
  ArrowsClockwise,
  Sparkle
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { CodeBlock } from "./CodeBlock";

interface ScrapingResult {
  success: boolean;
  data: any;
  latency: number;
  tokens?: number;
}

export function OxylabsAIStudioDemo() {
  const [oxylabsKey, setOxylabsKey] = useKV<string>("oxylabs_key", "");
  const [prompt, setPrompt] = useState("Extract all product prices and names from this page");
  const [url, setUrl] = useState("https://example.com");
  const [mode, setMode] = useState<"scrape" | "crawl">("scrape");
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);

  const runScraping = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockData = mode === "scrape" ? {
          url: url,
          title: "Example Product Page",
          extracted_data: {
            products: [
              { name: "Premium Widget", price: "$49.99", rating: 4.5 },
              { name: "Basic Gadget", price: "$29.99", rating: 4.2 },
              { name: "Pro Tool", price: "$99.99", rating: 4.8 }
            ]
          },
          markdown: "# Example Product Page\n\n## Products\n- Premium Widget: $49.99 (★4.5)\n- Basic Gadget: $29.99 (★4.2)\n- Pro Tool: $99.99 (★4.8)"
        } : {
          urls_discovered: 15,
          pages_scraped: 15,
          data_points: 45,
          aggregated_data: {
            total_products: 45,
            price_range: "$19.99 - $199.99",
            categories: ["Electronics", "Tools", "Accessories"]
          }
        };

        setResult({
          success: true,
          data: mockData,
          latency: Date.now() - startTime,
          tokens: Math.floor(Math.random() * 2000) + 500
        });
        
        toast.success(`${mode === "scrape" ? "Scraping" : "Crawling"} completed successfully`);
      } else {
        toast.error("Live API integration requires Oxylabs API key");
      }
    } catch (error) {
      toast.error("Scraping failed");
      setResult({
        success: false,
        data: null,
        latency: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const setupCode = `# Install Oxylabs AI Studio SDK
pip install oxylabs-ai-studio-py

# Or clone from GitHub
gh repo clone oxylabs/oxylabs-ai-studio-py
cd oxylabs-ai-studio-py
pip install -e .

# Set up authentication
export OXYLABS_API_KEY="your-api-key-here"`;

  const scrapeCode = `from oxylabs import AIStudio

# Initialize client
client = AIStudio(api_key="your-api-key")

# Natural language scraping
result = client.scrape(
    url="https://example.com/products",
    prompt="""
    Extract all products with:
    - Product name
    - Price
    - Rating
    - Availability status
    Return as structured JSON array
    """,
    format="json"
)

print(result.data)
# Output: [{"name": "...", "price": "...", "rating": ...}, ...]`;

  const crawlCode = `from oxylabs import AIStudio

client = AIStudio(api_key="your-api-key")

# AI-powered crawling
result = client.crawl(
    start_url="https://example.com",
    prompt="""
    Crawl the entire site and extract:
    - All product categories
    - Product listings in each category  
    - Pricing information
    Stop after 50 pages or when all categories are covered
    """,
    max_pages=50,
    output_format="structured"
)

# Aggregated results across all crawled pages
print(f"Pages crawled: {result.pages_count}")
print(f"Data extracted: {result.data}")`;

  const llmIntegrationCode = `from oxylabs import AIStudio
from openai import OpenAI

# Step 1: Scrape fresh data
oxylabs = AIStudio(api_key="oxylabs-key")
scraped_data = oxylabs.scrape(
    url="https://techcrunch.com",
    prompt="Extract latest AI news headlines and summaries"
)

# Step 2: Use in LLM for synthesis
openai_client = OpenAI()

response = openai_client.chat.completions.create(
    model="gpt-4",
    messages=[
        {
            "role": "system",
            "content": "You are a tech news analyst."
        },
        {
            "role": "user",
            "content": f"""
            Based on this fresh data from TechCrunch:
            {scraped_data.data}
            
            Provide a summary of top 3 AI trends today.
            """
        }
    ]
)

print(response.choices[0].message.content)`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe size={24} className="text-primary" weight="duotone" />
            </div>
            <div>
              <CardTitle>Oxylabs AI Studio</CardTitle>
              <CardDescription>
                AI-powered web scraping and crawling with natural language prompts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Robot size={16} />
                  Natural Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use plain English to describe what data you want to extract
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkle size={16} />
                  AI-Powered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced AI handles complex page structures automatically
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightning size={16} />
                  LLM-Ready Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Structured data perfect for feeding into LLMs for RAG
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interactive Demo</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <Badge variant={isDemo ? "default" : "outline"}>
                  {isDemo ? "Simulated" : "Live API"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scraping Mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scrape">
                    <div className="flex items-center gap-2">
                      <MagnifyingGlass size={16} />
                      Scrape (Single Page)
                    </div>
                  </SelectItem>
                  <SelectItem value="crawl">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Crawl (Multiple Pages)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Natural Language Prompt</Label>
              <Textarea
                placeholder="Describe what data you want to extract..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Example: "Extract all product names, prices, and customer ratings"
              </p>
            </div>

            {!isDemo && (
              <div className="space-y-2">
                <Label>Oxylabs API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your Oxylabs API key"
                  value={oxylabsKey}
                  onChange={(e) => setOxylabsKey(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={runScraping} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <ArrowsClockwise className="animate-spin mr-2" size={18} />
                  {mode === "scrape" ? "Scraping..." : "Crawling..."}
                </>
              ) : (
                <>
                  {mode === "scrape" ? <MagnifyingGlass className="mr-2" size={18} /> : <Globe className="mr-2" size={18} />}
                  {mode === "scrape" ? "Start Scraping" : "Start Crawling"}
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "border-green-500/50 bg-green-500/10" : "border-destructive/50 bg-destructive/10"}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-400 mt-0.5" weight="fill" />
                  <div className="flex-1 space-y-2">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {mode === "scrape" ? "Scraping" : "Crawling"} completed successfully
                        </span>
                        <div className="flex gap-2">
                          <Badge variant="outline">{result.latency}ms</Badge>
                          {result.tokens && (
                            <Badge variant="outline">{result.tokens} tokens</Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                    {result.data && (
                      <div className="mt-3">
                        <pre className="text-xs bg-background/50 p-3 rounded border overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            Python SDK examples for AI-powered web scraping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="scrape">Scrape</TabsTrigger>
              <TabsTrigger value="crawl">Crawl</TabsTrigger>
              <TabsTrigger value="llm">LLM Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <CodeBlock
                code={setupCode}
                language="bash"
                title="setup.sh"
              />
            </TabsContent>

            <TabsContent value="scrape" className="space-y-4">
              <CodeBlock
                code={scrapeCode}
                language="python"
                title="scrape_example.py"
              />
              <Alert>
                <AlertDescription>
                  Single-page scraping extracts specific data using natural language prompts. Perfect for targeted data extraction.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="crawl" className="space-y-4">
              <CodeBlock
                code={crawlCode}
                language="python"
                title="crawl_example.py"
              />
              <Alert>
                <AlertDescription>
                  AI-powered crawling automatically discovers and extracts data across multiple pages based on your instructions.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="llm" className="space-y-4">
              <CodeBlock
                code={llmIntegrationCode}
                language="python"
                title="oxylabs_llm_integration.py"
              />
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">RAG Workflow:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Oxylabs scrapes fresh data from the web</li>
                      <li>Data is structured and LLM-ready</li>
                      <li>Feed scraped context into GPT-4/Claude</li>
                      <li>LLM synthesizes answer with current information</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases for LLM Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">📰</div>
              <div>
                <h4 className="font-semibold mb-1">Real-Time News & Research</h4>
                <p className="text-sm text-muted-foreground">
                  Scrape current news, research papers, or documentation to provide LLMs with up-to-date information
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="font-semibold mb-1">Price Monitoring & Comparison</h4>
                <p className="text-sm text-muted-foreground">
                  Extract pricing data from e-commerce sites for competitive analysis and market intelligence
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold mb-1">Data Aggregation</h4>
                <p className="text-sm text-muted-foreground">
                  Crawl multiple sources to build comprehensive datasets for training or analysis
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="text-2xl">🔍</div>
              <div>
                <h4 className="font-semibold mb-1">Perplexity-Style Search</h4>
                <p className="text-sm text-muted-foreground">
                  Build AI search engines that scrape web results and synthesize answers with citations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
