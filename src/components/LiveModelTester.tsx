import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Stop,
  Copy,
  Check,
  Lightning,
  Key,
  Warning,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Hash
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/api-client";

interface ProviderConfig {
  id: string;
  name: string;
  models: string[];
  envVar: string;
  color: string;
  description: string;
}

const providers: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    envVar: 'OPENAI_API_KEY',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    description: 'GPT models for general-purpose tasks'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307'],
    envVar: 'ANTHROPIC_API_KEY',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Claude models for reasoning and analysis'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      'meta-llama/llama-3.2-3b-instruct:free',
      'google/gemini-flash-1.5',
      'anthropic/claude-3-haiku'
    ],
    envVar: 'OPENROUTER_API_KEY',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Unified access to 100+ models'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    models: ['sonar', 'sonar-pro'],
    envVar: 'PERPLEXITYAI_API_KEY',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Real-time web search with citations'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    envVar: 'DEEPSEEK_API_KEY',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Advanced reasoning models'
  },
  {
    id: 'xai',
    name: 'xAI',
    models: ['grok-beta', 'grok-vision-beta'],
    envVar: 'XAI_API_KEY',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    description: 'Grok models with real-time data'
  }
];

export function LiveModelTester() {
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Explain quantum computing in simple terms.');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [useRealApi, setUseRealApi] = useState<boolean>(false);
  const [enableStreaming, setEnableStreaming] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [metrics, setMetrics] = useState<{
    latency: number;
    tokens: number;
    tokensPerSecond: number;
  }>({ latency: 0, tokens: 0, tokensPerSecond: 0 });
  const [copied, setCopied] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);
  const abortRef = useRef<boolean>(false);

  const currentProvider = providers.find(p => p.id === selectedProvider)!;

  useEffect(() => {
    if (currentProvider?.models.length > 0 && !selectedModel) {
      setSelectedModel(currentProvider.models[0]);
    }
  }, [selectedProvider, currentProvider, selectedModel]);

  useEffect(() => {
    if (scrollRef.current && isProcessing) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, isProcessing]);

  const simulateResponse = async () => {
    const sampleResponses: Record<string, string> = {
      openai: "Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or 'qubits' that can exist in multiple states simultaneously. This allows them to solve certain complex problems exponentially faster than classical computers, particularly in areas like cryptography, drug discovery, and optimization.",
      anthropic: "Quantum computing represents a fundamental shift in how we process information. Imagine a classical computer as someone checking every door in a massive hotel one by one. A quantum computer, through superposition, can check all doors simultaneously. Combined with entanglement—where qubits become interconnected—quantum computers can explore vast solution spaces in parallel, making them exceptionally powerful for specific computational challenges.",
      openrouter: "Think of quantum computing like this: A regular computer is like flipping coins one at a time and recording each result. A quantum computer can flip many coins at once and, through quantum mechanics, explore all possible outcomes simultaneously until it 'observes' the answer. This makes it incredibly powerful for certain problems but not necessarily faster for everyday tasks like browsing the web.",
      perplexity: "Quantum computing leverages the principles of quantum mechanics—superposition and entanglement—to perform calculations. Qubits can represent both 0 and 1 simultaneously (superposition), and when qubits are entangled, measuring one instantly affects others. This enables quantum computers to tackle problems in cryptography, materials science, and AI that would take classical computers millions of years. [Source: Nature Physics, 2024]",
      deepseek: "Quantum computing exploits quantum superposition and entanglement to achieve computational advantages. A qubit in superposition exists in a probabilistic state between 0 and 1 until measured. Quantum gates manipulate these states, and entanglement creates correlations between qubits. For specific algorithms like Shor's (factoring) or Grover's (search), quantum computers demonstrate exponential or polynomial speedups over classical approaches.",
      xai: "Quantum computing is a revolutionary approach to computation based on quantum mechanics. Key concepts: (1) Superposition: qubits exist in multiple states simultaneously, (2) Entanglement: qubits become correlated, and (3) Quantum interference: amplifying correct answers while canceling incorrect ones. This enables solving certain problems—like simulating molecules or breaking encryption—that are intractable for classical computers."
    };

    const responseText = sampleResponses[selectedProvider] || sampleResponses.openai;
    const words = responseText.split(' ');

    abortRef.current = false;
    setResponse('');
    setError('');
    startTimeRef.current = Date.now();
    tokenCountRef.current = 0;

    for (let i = 0; i < words.length && !abortRef.current; i++) {
      const word = i === 0 ? words[i] : ` ${words[i]}`;
      setResponse(prev => prev + word);
      tokenCountRef.current++;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const tps = tokenCountRef.current / elapsed;

      setMetrics({
        latency: Date.now() - startTimeRef.current,
        tokens: tokenCountRef.current,
        tokensPerSecond: tps
      });

      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    }

    return !abortRef.current;
  };

  const handleRealApiCall = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    abortRef.current = false;
    setResponse('');
    setError('');
    startTimeRef.current = Date.now();
    tokenCountRef.current = 0;

    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    try {
      if (enableStreaming) {
        const stream = apiClient.streamChatCompletion(
          { provider: selectedProvider, apiKey },
          { model: selectedModel, messages, temperature, maxTokens }
        );

        for await (const chunk of stream) {
          if (abortRef.current) break;
          
          setResponse(prev => prev + chunk);
          tokenCountRef.current++;

          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setMetrics({
            latency: Date.now() - startTimeRef.current,
            tokens: tokenCountRef.current,
            tokensPerSecond: tokenCountRef.current / elapsed
          });
        }
      } else {
        const result = await apiClient.chatCompletion(
          { provider: selectedProvider, apiKey },
          { model: selectedModel, messages, temperature, maxTokens }
        );

        const content = result.choices[0]?.message?.content || '';
        const elapsed = Date.now() - startTimeRef.current;
        
        setResponse(content);
        setMetrics({
          latency: elapsed,
          tokens: result.usage?.completion_tokens || 0,
          tokensPerSecond: (result.usage?.completion_tokens || 0) / (elapsed / 1000)
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('API call failed: ' + errorMessage);
      return false;
    }
  };

  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsProcessing(true);

    try {
      let success;
      if (useRealApi) {
        success = await handleRealApiCall();
      } else {
        success = await simulateResponse();
      }

      if (success && !abortRef.current) {
        toast.success('Response completed!');
      }
    } catch (err) {
      toast.error('Test failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsProcessing(false);
    toast.info('Stopped');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeExample = (): string => {
    return `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.${currentProvider.envVar},
  ${selectedProvider !== 'openai' ? `baseURL: '${apiClient['getBaseURL'](selectedProvider)}',` : ''}
});

${enableStreaming ? `// Streaming response
const stream = await client.chat.completions.create({
  model: '${selectedModel}',
  messages: [{ role: 'user', content: '${prompt}' }],
  temperature: ${temperature},
  max_tokens: ${maxTokens},
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}` : `// Non-streaming response
const response = await client.chat.completions.create({
  model: '${selectedModel}',
  messages: [{ role: 'user', content: '${prompt}' }],
  temperature: ${temperature},
  max_tokens: ${maxTokens}
});

console.log(response.choices[0].message.content);`}`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="text-accent" weight="duotone" size={24} />
            Live Model Testing with Real API Integration
          </CardTitle>
          <CardDescription>
            Test real AI models with actual API calls or use simulation mode for development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider.models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key size={16} />
                  API Key {!useRealApi && '(Optional for simulation)'}
                </Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter ${currentProvider.name} API key...`}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {currentProvider.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                  className="min-h-[100px]"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Temperature: {temperature.toFixed(2)}</Label>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(val[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Max Tokens: {maxTokens}</Label>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={(val) => setMaxTokens(val[0])}
                    min={100}
                    max={4000}
                    step={100}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={useRealApi}
                    onCheckedChange={setUseRealApi}
                    disabled={isProcessing}
                  />
                  <div>
                    <Label className="text-sm font-medium">Real API Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      {useRealApi ? 'Using actual API calls' : 'Using simulation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={enableStreaming}
                    onCheckedChange={setEnableStreaming}
                    disabled={isProcessing}
                  />
                  <div>
                    <Label className="text-sm font-medium">Streaming</Label>
                    <p className="text-xs text-muted-foreground">
                      {enableStreaming ? 'Token-by-token' : 'Full response'}
                    </p>
                  </div>
                </div>
              </div>

              {useRealApi && !apiKey && (
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <Warning className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-xs text-yellow-300">
                    Real API mode requires an API key. Add your key above or switch to simulation mode.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {!isProcessing ? (
                  <Button
                    onClick={handleTest}
                    disabled={useRealApi && !apiKey}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Play size={20} weight="fill" />
                    {useRealApi ? 'Test Real API' : 'Simulate Response'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Stop size={20} weight="fill" />
                    Stop
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={14} />
                      Latency
                    </span>
                    <span className="text-sm font-mono">
                      {metrics.latency}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hash size={14} />
                      Tokens
                    </span>
                    <span className="text-sm font-mono">
                      {metrics.tokens}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lightning size={14} />
                      Speed
                    </span>
                    <span className="text-sm font-mono">
                      {metrics.tokensPerSecond.toFixed(1)} t/s
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant={isProcessing ? "default" : response ? "secondary" : "outline"}>
                      {isProcessing ? 'Processing...' : response ? 'Complete' : 'Ready'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs text-muted-foreground">Provider Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <Badge variant="outline">{currentProvider.name}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-mono text-xs truncate max-w-[120px]">
                      {selectedModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge variant={useRealApi ? "default" : "secondary"} className="text-xs">
                      {useRealApi ? 'Live' : 'Simulated'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                Response
              </Label>
              {response && (
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </div>

            <Card className="min-h-[300px]">
              <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
                {response ? (
                  <div className="space-y-2">
                    <div className="prose prose-sm max-w-none prose-invert">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {response}
                        {isProcessing && (
                          <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-sm text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Code size={48} className="text-muted-foreground opacity-30 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {isProcessing ? 'Generating response...' : 'Response will appear here'}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          <Separator />

          <Tabs defaultValue="code" className="w-full">
            <TabsList>
              <TabsTrigger value="code">Implementation Code</TabsTrigger>
              <TabsTrigger value="info">Security Info</TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-4">
              <div className="relative">
                <ScrollArea className="h-[300px] w-full rounded-md border bg-code-bg p-4">
                  <pre className="text-xs font-mono">
                    <code className="text-foreground">{getCodeExample()}</code>
                  </pre>
                </ScrollArea>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(getCodeExample());
                    toast.success('Code copied!');
                  }}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription className="text-xs space-y-2">
                  <p>
                    <strong>⚠️ Security Notice:</strong> This component uses{' '}
                    <code className="text-xs bg-muted px-1 rounded">dangerouslyAllowBrowser: true</code>{' '}
                    for demonstration purposes only.
                  </p>
                  <p>
                    <strong>Production Best Practice:</strong> Never expose API keys in frontend code.
                    Always use a backend proxy that:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Stores API keys securely in environment variables</li>
                    <li>Validates and sanitizes user inputs</li>
                    <li>Implements rate limiting per user/IP</li>
                    <li>Logs requests for monitoring</li>
                    <li>Handles errors gracefully</li>
                  </ul>
                  <p className="pt-2">
                    See the <code className="text-xs bg-muted px-1 rounded">api-gateway</code> directory
                    for a production-ready backend implementation.
                  </p>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
