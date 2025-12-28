import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { catalogInstance, UnifiedModel } from '@/data/unifiedModelCatalog';
import { Flask, Play, Download, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface BatchResult {
  modelId: string;
  modelName: string;
  response: string;
  latency: number;
  tokens: number;
  cost: number;
  status: 'success' | 'error';
  error?: string;
}

export function BatchModelTester() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  const allModels = catalogInstance.getAllModels().filter((m) => m.modelType !== 'embedding');

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  // Helper to test a single model
  const testSingleModel = async (modelId: string): Promise<BatchResult> => {
    const model = catalogInstance.getModel(modelId);
    if (!model) {
      return {
        modelId,
        modelName: 'Unknown',
        response: '',
        latency: 0,
        tokens: 0,
        cost: 0,
        status: 'error',
        error: 'Model not found',
      };
    }

    try {
      const startTime = performance.now();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: model.provider,
          model: model.sourceId,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const endTime = performance.now();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const tokens = data.usage?.total_tokens || 0;
      const cost =
        (inputTokens / 1_000_000) * (model.inputCostPer1M || 0) +
        (outputTokens / 1_000_000) * (model.outputCostPer1M || 0);

      return {
        modelId: model.id,
        modelName: model.name,
        response: data.choices?.[0]?.message?.content || '',
        latency: endTime - startTime,
        tokens,
        cost,
        status: 'success',
      };
    } catch (error) {
      return {
        modelId: model.id,
        modelName: model.name,
        response: '',
        latency: 0,
        tokens: 0,
        cost: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runBatchTest = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (selectedModels.length === 0) {
      toast.error('Please select at least one model');
      return;
    }

    setIsRunning(true);
    setResults([]);

    // Use concurrent execution with controlled parallelism for better performance
    // Limit concurrent requests to avoid overwhelming APIs
    const CONCURRENCY_LIMIT = 3;
    const batchResults: BatchResult[] = [];
    
    // Process models in batches for concurrent execution
    for (let i = 0; i < selectedModels.length; i += CONCURRENCY_LIMIT) {
      const batch = selectedModels.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map(testSingleModel);
      
      // Execute batch concurrently
      const results = await Promise.allSettled(batchPromises);
      
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled') {
          batchResults.push(result.value);
        } else {
          // Handle rejected promises - create error result for failed API calls
          const modelId = batch[j];
          const model = catalogInstance.getModel(modelId);
          batchResults.push({
            modelId,
            modelName: model?.name || 'Unknown',
            response: '',
            latency: 0,
            tokens: 0,
            cost: 0,
            status: 'error',
            error: result.reason instanceof Error ? result.reason.message : 'Request failed',
          });
        }
      }
      
      // Update UI after each batch for progressive feedback
      setResults([...batchResults]);
    }

    setIsRunning(false);
    toast.success(`Batch test completed! ${batchResults.filter((r) => r.status === 'success').length}/${batchResults.length} successful`);
  };

  const exportResults = () => {
    const markdown = `# Batch Test Results

**Prompt:** ${prompt}

**Models Tested:** ${selectedModels.length}

## Results

${results
  .map(
    (r) => `
### ${r.modelName} (${r.modelId})

**Status:** ${r.status === 'success' ? '✅ Success' : '❌ Error'}
**Latency:** ${r.latency.toFixed(0)}ms
**Tokens:** ${r.tokens}
**Cost:** $${r.cost.toFixed(4)}

${r.status === 'success' ? `**Response:**\n\n${r.response}` : `**Error:** ${r.error}`}

---
`
  )
  .join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-test-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Results exported!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Flask size={24} className="text-accent" />
        <h2 className="text-2xl font-bold">Batch Model Tester</h2>
      </div>
      <p className="text-muted-foreground">
        Test the same prompt across multiple models simultaneously and compare results.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Test Prompt</Label>
            <Textarea
              placeholder="Enter your test prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Select Models ({selectedModels.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModels(allModels.map((m) => m.id))}
                >
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedModels([])}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-auto p-4 border rounded-lg">
              {allModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-start gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => toggleModel(model.id)}
                >
                  <Checkbox checked={selectedModels.includes(model.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runBatchTest}
              disabled={isRunning || selectedModels.length === 0 || !prompt.trim()}
              className="gap-2"
            >
              <Play size={16} weight="fill" />
              {isRunning ? 'Running...' : 'Run Batch Test'}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={exportResults} className="gap-2">
                <Download size={16} />
                Export Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Results ({results.filter((r) => r.status === 'success').length}/{results.length} successful)
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setResults([])}>
              <X size={16} />
              Clear
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">
                  {(
                    results.filter((r) => r.status === 'success').reduce((acc, r) => acc + r.latency, 0) /
                    results.filter((r) => r.status === 'success').length
                  ).toFixed(0)}
                  ms
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">
                  {results.reduce((acc, r) => acc + r.tokens, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${results.reduce((acc, r) => acc + r.cost, 0).toFixed(4)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {((results.filter((r) => r.status === 'success').length / results.length) * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Results */}
          <div className="grid grid-cols-1 gap-4">
            {results.map((result, idx) => (
              <Card key={idx} className={result.status === 'error' ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{result.modelName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{result.modelId}</p>
                    </div>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status === 'success' ? '✅ Success' : '❌ Error'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-mono">{result.latency.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-mono">{result.tokens}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-mono">${result.cost.toFixed(4)}</p>
                    </div>
                  </div>

                  {result.status === 'success' ? (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                      <p className="text-sm text-destructive">{result.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
