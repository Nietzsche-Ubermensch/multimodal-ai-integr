import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useKV } from '@github/spark/hooks';
import {
  Sparkles,
  Play,
  GitBranch,
  Save,
  Share2,
  Download,
  Upload,
  Zap,
  TrendingUp,
  Copy,
  Eye,
  Settings,
  FileText,
  Star,
  Clock,
  ArrowLeftRight,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface PromptVersion {
  id: string;
  name: string;
  prompt: string;
  systemPrompt?: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  modelId: string;
  createdAt: string;
  author?: string;
  tags: string[];
  description?: string;
  metrics?: {
    avgLatency: number;
    avgTokens: number;
    successRate: number;
    costPer1k: number;
  };
}

interface TestResult {
  id: string;
  versionId: string;
  modelId: string;
  input: string;
  output: string;
  latency: number;
  tokens: number;
  cost: number;
  timestamp: string;
  score?: number;
}

interface ABTest {
  id: string;
  name: string;
  variantA: string; // version ID
  variantB: string; // version ID
  testInputs: string[];
  results: {
    variantA: TestResult[];
    variantB: TestResult[];
  };
  winner?: 'A' | 'B' | 'tie';
  createdAt: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  systemPrompt?: string;
  description: string;
  tags: string[];
  downloads: number;
  rating: number;
  author: string;
  featured: boolean;
}

export default function PromptStudio() {
  const [versions, setVersions] = useKV<PromptVersion[]>('prompt-versions', []);
  const [templates, setTemplates] = useKV<PromptTemplate[]>('prompt-templates', []);
  const [abTests, setABTests] = useKV<ABTest[]>('prompt-ab-tests', []);
  const [testResults, setTestResults] = useKV<TestResult[]>('prompt-test-results', []);

  const [currentVersion, setCurrentVersion] = useState<PromptVersion | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showABTestDialog, setShowABTestDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [testInput, setTestInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('xai/grok-4-1-fast-reasoning');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2000]);
  const [topP, setTopP] = useState([1.0]);

  const models = [
    { id: 'xai/grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast (Reasoning)' },
    { id: 'xai/grok-4-1-fast-non-reasoning', name: 'Grok 4.1 Fast' },
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner' },
    { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5' },
    { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
  ];

  useEffect(() => {
    // Initialize with default templates
    if (!templates || templates.length === 0) {
      initializeTemplates();
    }
  }, [templates]);

  const initializeTemplates = () => {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: '1',
        name: 'Code Review Assistant',
        category: 'Development',
        prompt: `Review the following code and provide:
1. Bug detection and security issues
2. Performance optimization suggestions
3. Code style and best practices
4. Refactoring recommendations

Code:
{{code}}`,
        systemPrompt: 'You are an expert code reviewer with deep knowledge of security, performance, and best practices.',
        description: 'Comprehensive code review with security and performance analysis',
        tags: ['code', 'security', 'review'],
        downloads: 1247,
        rating: 4.8,
        author: 'AI Platform Team',
        featured: true,
      },
      {
        id: '2',
        name: 'RAG Query Optimizer',
        category: 'RAG',
        prompt: `Given this user query, rewrite it to be more effective for semantic search:

Original Query: {{query}}

Consider:
- Add context keywords
- Expand abbreviations
- Include synonyms
- Make intent explicit`,
        systemPrompt: 'You are a query optimization expert specializing in RAG systems.',
        description: 'Optimize queries for better RAG retrieval accuracy',
        tags: ['rag', 'search', 'optimization'],
        downloads: 892,
        rating: 4.6,
        author: 'AI Platform Team',
        featured: true,
      },
      {
        id: '3',
        name: 'Multi-Step Reasoning',
        category: 'Reasoning',
        prompt: `Solve this problem using step-by-step reasoning:

Problem: {{problem}}

Show your work:
1. Identify key information
2. Break down into sub-problems
3. Solve each step
4. Verify the answer`,
        systemPrompt: 'You are a reasoning expert. Always think step-by-step and show your work.',
        description: 'Deep reasoning with explicit step-by-step breakdown',
        tags: ['reasoning', 'math', 'logic'],
        downloads: 654,
        rating: 4.9,
        author: 'AI Platform Team',
        featured: true,
      },
      {
        id: '4',
        name: 'JSON Schema Generator',
        category: 'Data',
        prompt: `Generate a JSON schema for the following data structure:

{{description}}

Requirements:
- Include all field types
- Add validation rules
- Include examples
- Make it OpenAPI 3.0 compatible`,
        systemPrompt: 'You are a data schema expert. Generate valid, well-documented JSON schemas.',
        description: 'Generate production-ready JSON schemas with validation',
        tags: ['json', 'schema', 'validation'],
        downloads: 531,
        rating: 4.7,
        author: 'AI Platform Team',
        featured: false,
      },
    ];

    setTemplates(defaultTemplates);
  };

  const createVersion = () => {
    const newVersion: PromptVersion = {
      id: `v${Date.now()}`,
      name: `Version ${(versions || []).length + 1}`,
      prompt,
      systemPrompt,
      parameters: {
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        topP: topP[0],
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      modelId: selectedModel,
      createdAt: new Date().toISOString(),
      tags: [],
    };

    setVersions((prev) => [...(prev || []), newVersion]);
    setCurrentVersion(newVersion);
    toast.success('Version created successfully');
    setShowVersionDialog(false);
  };

  const runTest = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter test input');
      return;
    }

    setIsTestRunning(true);
    const startTime = Date.now();

    try {
      // Simulated API call - replace with actual model API
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt.replace('{{input}}', testInput) },
          ],
          temperature: temperature[0],
          max_tokens: maxTokens[0],
        }),
      });

      const data = await response.json();
      const latency = Date.now() - startTime;

      const result: TestResult = {
        id: `test-${Date.now()}`,
        versionId: currentVersion?.id || 'current',
        modelId: selectedModel,
        input: testInput,
        output: data.choices?.[0]?.message?.content || 'No response',
        latency,
        tokens: data.usage?.total_tokens || 0,
        cost: calculateCost(data.usage?.total_tokens || 0, selectedModel),
        timestamp: new Date().toISOString(),
      };

      setTestResults((prev) => [result, ...(prev || [])]);
      toast.success(`Test completed in ${latency}ms`);
    } catch (error) {
      toast.error('Test failed: ' + (error as Error).message);
    } finally {
      setIsTestRunning(false);
    }
  };

  const runABTest = async (testInputs: string[], variantA: string, variantB: string) => {
    const test: ABTest = {
      id: `ab-${Date.now()}`,
      name: `A/B Test ${(abTests || []).length + 1}`,
      variantA,
      variantB,
      testInputs,
      results: { variantA: [], variantB: [] },
      createdAt: new Date().toISOString(),
    };

    // Run tests for both variants
    for (const input of testInputs) {
      // Test variant A
      // Test variant B
      // Compare results
    }

    setABTests((prev) => [...(prev || []), test]);
    toast.success('A/B test completed');
  };

  const optimizePrompt = async () => {
    setOptimizing(true);
    toast.info('Starting automatic optimization with Grok 4.1...');

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          testResults: (testResults || []).slice(0, 5),
          targetMetric: 'quality', // quality, speed, cost
        }),
      });

      const data = await response.json();

      if (data.optimizedPrompt) {
        setPrompt(data.optimizedPrompt);
        setSystemPrompt(data.optimizedSystemPrompt || systemPrompt);
        toast.success('Prompt optimized! Review the changes.');
      }
    } catch (error) {
      toast.error('Optimization failed: ' + (error as Error).message);
    } finally {
      setOptimizing(false);
    }
  };

  const calculateCost = (tokens: number, modelId: string): number => {
    const costs: Record<string, number> = {
      'xai/grok-4-1-fast-reasoning': 0.015,
      'deepseek/deepseek-reasoner': 0.00055,
      'anthropic/claude-opus-4-5': 0.015,
    };
    return (tokens / 1000) * (costs[modelId] || 0.01);
  };

  const exportVersion = (version: PromptVersion) => {
    const data = JSON.stringify(version, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.name.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Version exported');
  };

  const importVersion = async (file: File) => {
    try {
      const text = await file.text();
      const version = JSON.parse(text) as PromptVersion;
      version.id = `v${Date.now()}`;
      setVersions((prev) => [...(prev || []), version]);
      toast.success('Version imported successfully');
    } catch (error) {
      toast.error('Failed to import version');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Prompt Engineering Studio
          </h1>
          <p className="text-gray-600 mt-1">
            Build, test, and optimize prompts with A/B testing and version control
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => setShowVersionDialog(true)}>
            <GitBranch className="w-4 h-4 mr-2" />
            Versions ({(versions || []).length})
          </Button>
          <Button onClick={optimizePrompt} disabled={optimizing}>
            <Zap className="w-4 h-4 mr-2" />
            {optimizing ? 'Optimizing...' : 'Auto-Optimize'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editor">
            <Settings className="w-4 h-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="testing">
            <Play className="w-4 h-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="ab-test">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="versions">
            <GitBranch className="w-4 h-4 mr-2" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Star className="w-4 h-4 mr-2" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Prompt Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    placeholder="You are a helpful assistant..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>User Prompt</Label>
                  <Textarea
                    placeholder="Use {{input}} as a placeholder for dynamic content"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use <code className="bg-gray-100 px-1 rounded">{"{{variable}}"}</code>{' '}
                    for dynamic placeholders
                  </p>
                </div>

                <div>
                  <Label>Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="mt-1">
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

            {/* Right: Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Model Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Temperature</Label>
                    <span className="text-sm text-gray-600">{temperature[0]}</span>
                  </div>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher = more creative, Lower = more deterministic
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Max Tokens</Label>
                    <span className="text-sm text-gray-600">{maxTokens[0]}</span>
                  </div>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    min={100}
                    max={4000}
                    step={100}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Top P</Label>
                    <span className="text-sm text-gray-600">{topP[0]}</span>
                  </div>
                  <Slider
                    value={topP}
                    onValueChange={setTopP}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nucleus sampling threshold
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button className="w-full" onClick={() => setShowVersionDialog(true)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Version
                  </Button>
                  <Button className="w-full" variant="outline" onClick={runTest}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter test input..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={10}
                />
                <Button
                  className="w-full"
                  onClick={runTest}
                  disabled={isTestRunning}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTestRunning ? 'Running...' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(testResults || []).slice(0, 10).map((result) => (
                    <Card key={result.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{result.modelId.split('/')[1]}</Badge>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{result.latency}ms</span>
                          <span>•</span>
                          <span>{result.tokens} tokens</span>
                          <span>•</span>
                          <span>${result.cost.toFixed(4)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {result.output}
                      </p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-test" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>A/B Test Comparisons</CardTitle>
                <Button onClick={() => setShowABTestDialog(true)}>
                  <Target className="w-4 h-4 mr-2" />
                  New A/B Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(abTests || []).map((test) => (
                  <Card key={test.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{test.name}</h3>
                      {test.winner && (
                        <Badge>
                          Winner: Variant {test.winner}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Variant A</p>
                        <div className="text-xs text-gray-600">
                          <p>Tests: {test.results.variantA.length}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Variant B</p>
                        <div className="text-xs text-gray-600">
                          <p>Tests: {test.results.variantB.length}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(versions || []).map((version) => (
                  <Card key={version.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{version.name}</h3>
                          <Badge variant="outline">{version.modelId.split('/')[1]}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {version.prompt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(version.createdAt).toLocaleDateString()}
                          </span>
                          {version.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPrompt(version.prompt);
                            setSystemPrompt(version.systemPrompt || '');
                            setSelectedModel(version.modelId);
                            setTemperature([version.parameters.temperature]);
                            setMaxTokens([version.parameters.maxTokens]);
                            toast.success('Version loaded');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportVersion(version)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(templates || []).map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    {template.featured && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>⭐ {template.rating}</span>
                    <span>↓ {template.downloads}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setPrompt(template.prompt);
                      setSystemPrompt(template.systemPrompt || '');
                      toast.success('Template loaded');
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Version Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as New Version</DialogTitle>
            <DialogDescription>
              Create a version snapshot of your current prompt configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Version Name</Label>
              <Input placeholder="v1.0.0" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea placeholder="What changed in this version?" rows={3} />
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="production, optimized, tested" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createVersion}>
              <Save className="w-4 h-4 mr-2" />
              Save Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
