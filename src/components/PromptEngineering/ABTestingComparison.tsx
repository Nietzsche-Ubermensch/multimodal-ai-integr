import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftRight,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Clock,
  DollarSign,
  Zap,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface Variant {
  id: string;
  name: string;
  prompt: string;
  systemPrompt?: string;
}

interface TestCase {
  id: string;
  input: string;
  expected?: string;
}

interface ComparisonResult {
  variantA: {
    output: string;
    latency: number;
    tokens: number;
    cost: number;
    score?: number;
  };
  variantB: {
    output: string;
    latency: number;
    tokens: number;
    cost: number;
    score?: number;
  };
  winner: 'A' | 'B' | 'tie';
  input: string;
}

export default function ABTestingComparison({
  variantA,
  variantB,
  onWinnerSelected,
}: {
  variantA: Variant;
  variantB: Variant;
  onWinnerSelected?: (winnerId: string) => void;
}) {
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: '' },
  ]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [selectedModel, setSelectedModel] = useState('xai/grok-4-1-fast-reasoning');

  const models = [
    { id: 'xai/grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast (Reasoning)' },
    { id: 'xai/grok-4-1-fast-non-reasoning', name: 'Grok 4.1 Fast' },
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner' },
    { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5' },
  ];

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { id: Date.now().toString(), input: '' },
    ]);
  };

  const updateTestCase = (id: string, input: string) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, input } : tc)));
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id));
  };

  const runComparison = async () => {
    if (testCases.some((tc) => !tc.input.trim())) {
      toast.error('All test cases must have input');
      return;
    }

    setRunning(true);
    setProgress(0);
    const newResults: ComparisonResult[] = [];

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        setProgress(((i + 1) / testCases.length) * 100);

        // Run variant A
        const startA = Date.now();
        const responseA = await fetch('/api/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: variantA.systemPrompt || '' },
              { role: 'user', content: variantA.prompt.replace('{{input}}', testCase.input) },
            ],
          }),
        });
        const dataA = await responseA.json();
        const latencyA = Date.now() - startA;

        // Run variant B
        const startB = Date.now();
        const responseB = await fetch('/api/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: variantB.systemPrompt || '' },
              { role: 'user', content: variantB.prompt.replace('{{input}}', testCase.input) },
            ],
          }),
        });
        const dataB = await responseB.json();
        const latencyB = Date.now() - startB;

        // Determine winner
        let winner: 'A' | 'B' | 'tie' = 'tie';
        if (latencyA < latencyB * 0.9) winner = 'A';
        else if (latencyB < latencyA * 0.9) winner = 'B';

        newResults.push({
          input: testCase.input,
          variantA: {
            output: dataA.choices?.[0]?.message?.content || '',
            latency: latencyA,
            tokens: dataA.usage?.total_tokens || 0,
            cost: ((dataA.usage?.total_tokens || 0) / 1000) * 0.015,
          },
          variantB: {
            output: dataB.choices?.[0]?.message?.content || '',
            latency: latencyB,
            tokens: dataB.usage?.total_tokens || 0,
            cost: ((dataB.usage?.total_tokens || 0) / 1000) * 0.015,
          },
          winner,
        });
      }

      setResults(newResults);
      toast.success('A/B test completed successfully');
    } catch (error) {
      toast.error('A/B test failed: ' + (error as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const overallWinner = () => {
    const scores = { A: 0, B: 0, tie: 0 };
    results.forEach((r) => scores[r.winner]++);

    if (scores.A > scores.B) return 'A';
    if (scores.B > scores.A) return 'B';
    return 'tie';
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
            A/B Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge>Variant A: {variantA.name}</Badge>
              <Textarea
                value={variantA.prompt}
                readOnly
                rows={4}
                className="font-mono text-sm bg-blue-50 border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Badge>Variant B: {variantB.name}</Badge>
              <Textarea
                value={variantB.prompt}
                readOnly
                rows={4}
                className="font-mono text-sm bg-purple-50 border-purple-200"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Test Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Cases</CardTitle>
            <Button size="sm" onClick={addTestCase}>
              Add Test Case
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {testCases.map((testCase, index) => (
            <div key={testCase.id} className="flex gap-2">
              <Input
                placeholder={`Test case ${index + 1} input...`}
                value={testCase.input}
                onChange={(e) => updateTestCase(testCase.id, e.target.value)}
              />
              {testCases.length > 1 && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => removeTestCase(testCase.id)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}

          {running && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running tests...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button
            className="w-full"
            onClick={runComparison}
            disabled={running || testCases.some((tc) => !tc.input.trim())}
          >
            <Play className="w-4 h-4 mr-2" />
            {running ? 'Running...' : 'Run A/B Test'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Overall Winner */}
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Overall Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {overallWinner() === 'tie' ? (
                  <span className="text-gray-600">It's a tie!</span>
                ) : (
                  <span className="text-yellow-600">
                    Variant {overallWinner()}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                A wins: {results.filter((r) => r.winner === 'A').length} • B wins:{' '}
                {results.filter((r) => r.winner === 'B').length} • Ties:{' '}
                {results.filter((r) => r.winner === 'tie').length}
              </div>
            </CardContent>
          </Card>

          {/* Individual Results */}
          <div className="space-y-4">
            {results.map((result, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Test Case {i + 1}</CardTitle>
                    <Badge
                      variant={
                        result.winner === 'tie'
                          ? 'secondary'
                          : result.winner === 'A'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      Winner: {result.winner === 'tie' ? 'Tie' : `Variant ${result.winner}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Input: {result.input}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Variant A Results */}
                    <div
                      className={`p-4 rounded-lg ${
                        result.winner === 'A' ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        Variant A
                        {result.winner === 'A' && (
                          <Trophy className="w-4 h-4 text-blue-600" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {result.variantA.output}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{result.variantA.latency}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-gray-500" />
                          <span>{result.variantA.tokens} tokens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-500" />
                          <span>${result.variantA.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Variant B Results */}
                    <div
                      className={`p-4 rounded-lg ${
                        result.winner === 'B' ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        Variant B
                        {result.winner === 'B' && (
                          <Trophy className="w-4 h-4 text-purple-600" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {result.variantB.output}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{result.variantB.latency}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-gray-500" />
                          <span>{result.variantB.tokens} tokens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-500" />
                          <span>${result.variantB.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
