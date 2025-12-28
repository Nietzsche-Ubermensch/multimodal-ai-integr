import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Globe, Brain, MagnifyingGlass, ArrowRight } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RAGStage {
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  latency?: number;
  result?: string;
}

export function RAGPipelineDemo() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stages, setStages] = useState<RAGStage[]>([
    { name: 'Web Scraping', status: 'pending' },
    { name: 'Chunking', status: 'pending' },
    { name: 'Embedding', status: 'pending' },
    { name: 'Vector Storage', status: 'pending' },
    { name: 'Retrieval', status: 'pending' },
    { name: 'Generation', status: 'pending' },
  ]);
  const [finalResponse, setFinalResponse] = useState('');
  const [sources, setSources] = useState<any[]>([]);

  const updateStage = (index: number, updates: Partial<RAGStage>) => {
    setStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, ...updates } : stage))
    );
  };

  const runRAGPipeline = async () => {
    if (!url.trim() || !query.trim()) {
      toast.error('Please provide both URL and query');
      return;
    }

    setIsRunning(true);
    setFinalResponse('');
    setSources([]);

    // Reset stages
    setStages([
      { name: 'Web Scraping', status: 'pending' },
      { name: 'Chunking', status: 'pending' },
      { name: 'Embedding', status: 'pending' },
      { name: 'Vector Storage', status: 'pending' },
      { name: 'Retrieval', status: 'pending' },
      { name: 'Generation', status: 'pending' },
    ]);

    try {
      // Stage 1: Web Scraping
      updateStage(0, { status: 'running' });
      const scrapeStart = performance.now();
      
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        throw new Error('Scraping failed');
      }

      const scrapeData = await scrapeResponse.json();
      const scrapeLatency = performance.now() - scrapeStart;
      updateStage(0, { status: 'complete', latency: scrapeLatency, result: `Scraped ${scrapeData.content?.length || 0} characters` });

      // Stage 2: Chunking
      updateStage(1, { status: 'running' });
      const chunkStart = performance.now();
      
      const chunkResponse = await fetch('/api/chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: scrapeData.content }),
      });

      const chunkData = await chunkResponse.json();
      const chunkLatency = performance.now() - chunkStart;
      updateStage(1, { status: 'complete', latency: chunkLatency, result: `Created ${chunkData.chunks?.length || 0} chunks` });

      // Stage 3: Embedding
      updateStage(2, { status: 'running' });
      const embedStart = performance.now();
      
      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks: chunkData.chunks }),
      });

      const embedData = await embedResponse.json();
      const embedLatency = performance.now() - embedStart;
      updateStage(2, { status: 'complete', latency: embedLatency, result: `Generated ${embedData.embeddings?.length || 0} embeddings` });

      // Stage 4: Vector Storage
      updateStage(3, { status: 'running' });
      const storeStart = performance.now();
      
      const storeResponse = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chunks: chunkData.chunks,
          embeddings: embedData.embeddings,
          url 
        }),
      });

      const storeLatency = performance.now() - storeStart;
      updateStage(3, { status: 'complete', latency: storeLatency, result: 'Stored in vector DB' });

      // Stage 5: Retrieval
      updateStage(4, { status: 'running' });
      const retrieveStart = performance.now();
      
      const retrieveResponse = await fetch('/api/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 3 }),
      });

      const retrieveData = await retrieveResponse.json();
      const retrieveLatency = performance.now() - retrieveStart;
      updateStage(4, { status: 'complete', latency: retrieveLatency, result: `Retrieved ${retrieveData.documents?.length || 0} relevant chunks` });
      setSources(retrieveData.documents || []);

      // Stage 6: Generation
      updateStage(5, { status: 'running' });
      const generateStart = performance.now();
      
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          context: retrieveData.documents 
        }),
      });

      const generateData = await generateResponse.json();
      const generateLatency = performance.now() - generateStart;
      updateStage(5, { status: 'complete', latency: generateLatency, result: 'Generated answer' });
      setFinalResponse(generateData.answer || '');

      toast.success('RAG pipeline completed successfully!');
    } catch (error) {
      const currentStage = stages.findIndex((s) => s.status === 'running');
      if (currentStage !== -1) {
        updateStage(currentStage, { status: 'error', result: error instanceof Error ? error.message : 'Unknown error' });
      }
      toast.error('RAG pipeline failed');
    } finally {
      setIsRunning(false);
    }
  };

  const progress = (stages.filter((s) => s.status === 'complete').length / stages.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database size={24} className="text-accent" />
        <h2 className="text-2xl font-bold">RAG Pipeline Demo</h2>
      </div>
      <p className="text-muted-foreground">
        End-to-end Retrieval-Augmented Generation: Scrape → Chunk → Embed → Store → Retrieve → Generate
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">URL to Scrape</label>
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Query</label>
            <Textarea
              placeholder="What question do you want to answer using the scraped content?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              disabled={isRunning}
            />
          </div>

          <Button
            onClick={runRAGPipeline}
            disabled={isRunning || !url.trim() || !query.trim()}
            className="w-full gap-2"
          >
            {isRunning ? 'Running Pipeline...' : 'Run RAG Pipeline'}
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Progress */}
      {isRunning || stages.some((s) => s.status !== 'pending') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pipeline Progress</CardTitle>
              <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {stage.status === 'pending' && (
                      <div className="w-6 h-6 rounded-full border-2 border-muted" />
                    )}
                    {stage.status === 'running' && (
                      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    )}
                    {stage.status === 'complete' && (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                    {stage.status === 'error' && (
                      <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center text-white text-xs">
                        ✗
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{stage.name}</span>
                      {stage.latency && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {stage.latency.toFixed(0)}ms
                        </Badge>
                      )}
                    </div>
                    {stage.result && (
                      <p className="text-sm text-muted-foreground">{stage.result}</p>
                    )}
                  </div>
                  {idx < stages.length - 1 && stage.status === 'complete' && (
                    <ArrowRight size={20} className="text-muted-foreground mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Response */}
      {finalResponse && (
        <Card className="border-accent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-accent" />
              <CardTitle>Generated Answer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{finalResponse}</p>
            </div>

            {sources.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MagnifyingGlass size={16} />
                  Sources ({sources.length})
                </h3>
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div key={idx} className="p-3 border rounded-lg text-sm">
                      <p className="font-mono text-xs text-muted-foreground mb-1">
                        {source.url || url}
                      </p>
                      <p className="line-clamp-2">{source.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
