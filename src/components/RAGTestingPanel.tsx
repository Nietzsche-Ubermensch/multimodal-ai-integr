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
import { Slider } from "@/components/ui/slider";
import {
  Globe,
  Lightning,
  Brain,
  MagnifyingGlass,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Database,
  ChatCircleDots,
  PaperPlaneTilt,
  Trash,
  Copy,
  Sparkle,
  FileText,
  Robot,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { createScrapingRouter, type ScrapingResult } from "@/lib/unified-scraping";
import { LITELLM_MODELS, getLiteLLMModelInfo, calculateLiteLLMCost, type LiteLLMModel } from "@/lib/litellm-langfuse";

interface RAGDocument {
  id: string;
  url: string;
  title: string;
  content: string;
  chunks: string[];
  scrapedAt: string;
  provider: string;
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  model: string;
  relevantChunks: string[];
  tokens: { input: number; output: number; total: number };
  latencyMs: number;
  cost: number;
  timestamp: string;
}

export function RAGTestingPanel() {
  // Document State
  const [url, setUrl] = useState("");
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isScrapin, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);

  // Scraping Config
  const [scrapingConfig, setScrapingConfig] = useState({
    oxylabsKey: "",
    firecrawlKey: "",
  });

  // RAG Config
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [topK, setTopK] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  // QA State
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  // Get selected document
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Scraping Router
  const [router] = useState(() => createScrapingRouter({
    oxylabs: { apiKey: scrapingConfig.oxylabsKey },
    firecrawl: { apiKey: scrapingConfig.firecrawlKey },
  }));

  // Chunk text into smaller pieces
  const chunkText = useCallback((text: string, size: number, overlap: number): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += size - overlap) {
      const chunk = words.slice(i, i + size).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }, []);

  // Handle URL Scraping
  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsScraping(true);
    setScrapeProgress(10);

    try {
      // Update router config
      router.updateConfig({
        oxylabs: { apiKey: scrapingConfig.oxylabsKey },
        firecrawl: { apiKey: scrapingConfig.firecrawlKey },
      });

      setScrapeProgress(30);

      const result = await router.scrape({
        url,
        mode: 'scrape',
        options: {
          formats: ['markdown', 'text'],
          onlyMainContent: true,
        },
      });

      setScrapeProgress(70);

      if (result.success && result.data.content) {
        const content = result.data.markdown || result.data.content;
        const chunks = chunkText(content, chunkSize, chunkOverlap);
        
        const newDoc: RAGDocument = {
          id: crypto.randomUUID(),
          url,
          title: result.metadata.title || new URL(url).hostname,
          content,
          chunks,
          scrapedAt: result.metadata.scrapedAt,
          provider: result.provider,
        };

        setDocuments(prev => [...prev, newDoc]);
        setSelectedDocId(newDoc.id);
        setScrapeProgress(100);
        toast.success(`Scraped ${chunks.length} chunks from ${newDoc.title}`);
        setUrl("");
      } else {
        throw new Error(result.error || "Failed to scrape content");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scraping failed");
    } finally {
      setIsScraping(false);
      setTimeout(() => setScrapeProgress(0), 1000);
    }
  };

  // Simple semantic search (cosine similarity simulation)
  const searchChunks = useCallback((query: string, chunks: string[], k: number): string[] => {
    // In a real implementation, this would use embeddings
    // For demo, we use a simple keyword matching approach
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scored = chunks.map(chunk => {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      
      queryWords.forEach(word => {
        if (chunkLower.includes(word)) {
          score += 1;
        }
      });
      
      // Bonus for exact phrase matches
      if (chunkLower.includes(query.toLowerCase())) {
        score += 5;
      }
      
      return { chunk, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .filter(s => s.score > 0)
      .map(s => s.chunk);
  }, []);

  // Handle Question Answering
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (!selectedDoc) {
      toast.error("Please select a document first");
      return;
    }

    setIsAnswering(true);
    const startTime = Date.now();

    try {
      // Find relevant chunks
      const relevantChunks = searchChunks(question, selectedDoc.chunks, topK);
      
      if (relevantChunks.length === 0) {
        toast.warning("No relevant content found for your question");
        setIsAnswering(false);
        return;
      }

      // Build context
      const context = relevantChunks.join('\n\n---\n\n');
      
      // Simulate LLM call (in production, use actual API)
      const modelInfo = getLiteLLMModelInfo(selectedModel);
      
      // Demo response generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const answer = `Based on the content from ${selectedDoc.title}:

${relevantChunks[0].substring(0, 200)}...

**Key Points:**
1. The document discusses topics related to "${question}"
2. Found ${relevantChunks.length} relevant sections
3. Content was sourced from: ${selectedDoc.url}

*Note: This is a demo response. Connect to a real LLM API for actual question answering.*`;

      const tokens = {
        input: Math.ceil((context.length + question.length) / 4),
        output: Math.ceil(answer.length / 4),
        total: Math.ceil((context.length + question.length + answer.length) / 4),
      };

      const cost = modelInfo ? calculateLiteLLMCost(modelInfo, tokens) : 0;

      const entry: QAEntry = {
        id: crypto.randomUUID(),
        question,
        answer,
        model: selectedModel,
        relevantChunks,
        tokens,
        latencyMs: Date.now() - startTime,
        cost,
        timestamp: new Date().toISOString(),
      };

      setQaHistory(prev => [entry, ...prev]);
      setQuestion("");
      toast.success("Answer generated!");
    } catch (error) {
      toast.error("Failed to generate answer");
    } finally {
      setIsAnswering(false);
    }
  };

  // Delete document
  const handleDeleteDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDocId === docId) {
      setSelectedDocId(null);
    }
    toast.success("Document removed");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl">
              <Brain size={28} className="text-primary-foreground" weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl">RAG Testing Panel</CardTitle>
              <CardDescription className="text-base">
                Scrape URLs, build knowledge base, and ask questions using different models
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Document Management */}
        <div className="lg:col-span-1 space-y-4">
          {/* URL Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe size={20} />
                Add Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL to Scrape</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isScrapin}
                />
              </div>

              {isScrapin && scrapeProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scraping...</span>
                    <span className="font-mono">{scrapeProgress}%</span>
                  </div>
                  <Progress value={scrapeProgress} />
                </div>
              )}

              <Button
                onClick={handleScrape}
                disabled={isScrapin || !url.trim()}
                className="w-full"
              >
                {isScrapin ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin mr-2" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Lightning size={16} className="mr-2" />
                    Scrape URL
                  </>
                )}
              </Button>

              {/* Scraping Config */}
              <div className="pt-4 space-y-3">
                <Label className="text-xs text-muted-foreground">API Keys (Optional)</Label>
                <Input
                  type="password"
                  placeholder="Firecrawl API Key"
                  value={scrapingConfig.firecrawlKey}
                  onChange={(e) => setScrapingConfig(prev => ({ ...prev, firecrawlKey: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Document List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database size={20} />
                Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <Alert>
                  <FileText size={16} />
                  <AlertDescription>
                    No documents yet. Scrape a URL to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDocId === doc.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedDocId(doc.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{doc.url}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.chunks.length} chunks
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {doc.provider}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(doc.id);
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* RAG Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkle size={20} />
                RAG Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Chunk Size</Label>
                  <span className="text-sm text-muted-foreground">{chunkSize} words</span>
                </div>
                <Slider
                  value={[chunkSize]}
                  onValueChange={([v]) => setChunkSize(v)}
                  min={100}
                  max={1000}
                  step={50}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top K Results</Label>
                  <span className="text-sm text-muted-foreground">{topK}</span>
                </div>
                <Slider
                  value={[topK]}
                  onValueChange={([v]) => setTopK(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Model for Answers</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LITELLM_MODELS.slice(0, 10).map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ${(model.inputCostPer1M + model.outputCostPer1M).toFixed(2)}/M
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Q&A Interface */}
        <div className="lg:col-span-2 space-y-4">
          {/* Question Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChatCircleDots size={20} />
                Ask Questions
              </CardTitle>
              <CardDescription>
                {selectedDoc 
                  ? `Asking about: ${selectedDoc.title}`
                  : 'Select a document to start asking questions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about the document..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={!selectedDoc || isAnswering}
                  rows={3}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={handleAskQuestion}
                disabled={!selectedDoc || !question.trim() || isAnswering}
                className="w-full"
              >
                {isAnswering ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin mr-2" />
                    Generating Answer...
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt size={16} className="mr-2" />
                    Ask Question
                  </>
                )}
              </Button>

              {!selectedDoc && (
                <Alert>
                  <Warning size={16} />
                  <AlertDescription>
                    Please scrape a URL and select a document before asking questions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Q&A History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Robot size={20} />
                Q&A History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qaHistory.length === 0 ? (
                <Alert>
                  <MagnifyingGlass size={16} />
                  <AlertDescription>
                    No questions asked yet. Start by asking a question about your document.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {qaHistory.map(entry => (
                      <Card key={entry.id} className="p-4">
                        <div className="space-y-3">
                          {/* Question */}
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ChatCircleDots size={16} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{entry.question}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Answer */}
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-accent/10">
                              <Robot size={16} className="text-accent" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <pre className="text-sm whitespace-pre-wrap font-sans">
                                {entry.answer}
                              </pre>
                              
                              {/* Metadata */}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.model.split('/').pop()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {entry.tokens.total} tokens
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {entry.latencyMs}ms
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  ${entry.cost.toFixed(6)}
                                </Badge>
                              </div>

                              {/* Source Chunks */}
                              {entry.relevantChunks.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Source chunks ({entry.relevantChunks.length}):
                                  </p>
                                  <div className="space-y-1">
                                    {entry.relevantChunks.slice(0, 2).map((chunk, i) => (
                                      <div 
                                        key={i}
                                        className="text-xs p-2 bg-muted/50 rounded border-l-2 border-primary/50"
                                      >
                                        {chunk.substring(0, 150)}...
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(entry.answer)}
                                >
                                  <Copy size={14} className="mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Selected Document Preview */}
          {selectedDoc && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText size={20} />
                  Document Preview
                </CardTitle>
                <CardDescription>
                  {selectedDoc.title} • {selectedDoc.chunks.length} chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                    {selectedDoc.content.substring(0, 2000)}
                    {selectedDoc.content.length > 2000 && '...'}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
