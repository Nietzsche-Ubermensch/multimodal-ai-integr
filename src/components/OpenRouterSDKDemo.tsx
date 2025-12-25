import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Copy, 
  Check, 
  Lightning, 
  Code, 
  Eye,
  EyeSlash,
  GitBranch,
  Package,
  Terminal
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { OpenRouterSDK, testOpenRouterSDK } from "@/lib/openrouter-sdk";
import { CodeBlock } from "@/components/CodeBlock";

const DEMO_MODELS = [
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "x-ai/grok-beta", name: "Grok Beta", provider: "xAI" },
  { id: "google/gemini-pro", name: "Gemini Pro", provider: "Google" },
];

const CODE_EXAMPLES = {
  installation: `# Install the OpenRouter SDK
npm install @openrouter/ai-sdk-provider ai

# Or with other package managers
pnpm add @openrouter/ai-sdk-provider ai
yarn add @openrouter/ai-sdk-provider ai`,

  quickStart: `import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://your-site.com',
    'X-Title': 'Your App Name'
  }
});

const { text } = await generateText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  temperature: 0.7
});

console.log(text);`,

  streaming: `import { streamText } from 'ai';

const { textStream } = await streamText({
  model: openrouter('openai/gpt-4'),
  messages: [
    { role: 'user', content: 'Write a story about AI' }
  ]
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}`,

  multiProvider: `// Switch between models seamlessly
const models = {
  fast: openrouter('openai/gpt-3.5-turbo'),
  smart: openrouter('anthropic/claude-3-5-sonnet'),
  reasoning: openrouter('deepseek/deepseek-r1'),
  code: openrouter('x-ai/grok-code-fast-1')
};

// Use different models for different tasks
const quickResponse = await generateText({
  model: models.fast,
  messages: [{ role: 'user', content: 'Quick summary' }]
});

const deepAnalysis = await generateText({
  model: models.smart,
  messages: [{ role: 'user', content: 'Detailed analysis' }]
});`,

  errorHandling: `try {
  const sdk = new OpenRouterSDK({
    apiKey: process.env.OPENROUTER_API_KEY
  });

  const response = await sdk.chat({
    model: 'anthropic/claude-3-5-sonnet',
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.7
  });

  console.log(response);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}`,

  clone: `# Clone the OpenRouter TypeScript SDK repository
git clone https://github.com/OpenRouterTeam/typescript-sdk.git

# Navigate to the directory
cd typescript-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test`
};

export function OpenRouterSDKDemo() {
  const [apiKey, setApiKey] = useKV<string>("openrouter_sdk_demo_key", "");
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEMO_MODELS[0].id);
  const [prompt, setPrompt] = useState("Explain the concept of recursion in programming with a simple example.");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; response?: string; error?: string; latency: number } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [useRealApi, setUseRealApi] = useState(false);

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestSDK = async () => {
    if (!apiKey) {
      toast.error("Please enter an OpenRouter API key");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testOpenRouterSDK(apiKey, selectedModel);
      setTestResult(result);
      
      if (result.success) {
        toast.success(`SDK test successful! Latency: ${result.latency}ms`);
      } else {
        toast.error(`SDK test failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Test failed");
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        latency: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunDemo = async () => {
    if (useRealApi && !apiKey) {
      toast.error("Please enter an OpenRouter API key for real API calls");
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      if (useRealApi && apiKey) {
        const sdk = new OpenRouterSDK({ apiKey });
        const result = await sdk.chat({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        setResponse(result);
        toast.success("Response generated successfully");
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const simulatedResponse = `[SIMULATED RESPONSE from ${DEMO_MODELS.find(m => m.id === selectedModel)?.name}]\n\nRecursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems.\n\nSimple Example - Calculating Factorial:\n\nfunction factorial(n) {\n  // Base case: stop recursion\n  if (n <= 1) return 1;\n  \n  // Recursive case: function calls itself\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // Output: 120\n\nHow it works:\n- factorial(5) = 5 × factorial(4)\n- factorial(4) = 4 × factorial(3)\n- factorial(3) = 3 × factorial(2)\n- factorial(2) = 2 × factorial(1)\n- factorial(1) = 1 (base case)\n\nResult: 5 × 4 × 3 × 2 × 1 = 120`;
        setResponse(simulatedResponse);
        toast.success("Simulated response generated");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate response");
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GitBranch size={20} weight="bold" className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Clone & Install SDK</h3>
              <p className="text-sm text-muted-foreground">Get started with the TypeScript SDK</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <Terminal size={14} /> Clone Repository
              </Label>
              <div className="relative">
                <CodeBlock language="bash" code={CODE_EXAMPLES.clone} />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <Package size={14} /> NPM Installation
              </Label>
              <div className="relative">
                <CodeBlock language="bash" code={CODE_EXAMPLES.installation} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Lightning size={20} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Interactive SDK Test</h3>
              <p className="text-sm text-muted-foreground">Test SDK with your API key</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sdk-api-key" className="text-sm mb-2 block">OpenRouter API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="sdk-api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="sdk-model" className="text-sm mb-2 block">Model</Label>
              <select
                id="sdk-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
              >
                {DEMO_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>

            <Button 
              onClick={handleTestSDK} 
              disabled={isTesting || !apiKey}
              className="w-full"
            >
              {isTesting ? (
                <>Testing SDK...</>
              ) : (
                <>
                  <Play size={16} weight="bold" className="mr-2" />
                  Test SDK Connection
                </>
              )}
            </Button>

            {testResult && (
              <Alert className={testResult.success ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
                <AlertDescription>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <Check size={16} className="text-green-500 mt-0.5" weight="bold" />
                    ) : (
                      <Lightning size={16} className="text-red-500 mt-0.5" weight="bold" />
                    )}
                    <div className="flex-1 text-sm">
                      {testResult.success ? (
                        <>
                          <div className="font-semibold mb-1">SDK Test Successful!</div>
                          <div className="text-xs opacity-80 mb-2">Latency: {testResult.latency}ms</div>
                          <div className="bg-background/50 p-2 rounded font-mono text-xs break-words">
                            {testResult.response}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold mb-1">Test Failed</div>
                          <div className="text-xs opacity-80">{testResult.error}</div>
                        </>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <Tabs defaultValue="quickstart" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
              <TabsTrigger value="multi">Multi-Model</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart" className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">Basic Text Generation</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(CODE_EXAMPLES.quickStart, 'quickstart')}
                >
                  {copiedCode === 'quickstart' ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              <CodeBlock language="typescript" code={CODE_EXAMPLES.quickStart} />
            </TabsContent>

            <TabsContent value="streaming" className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">Streaming Responses</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(CODE_EXAMPLES.streaming, 'streaming')}
                >
                  {copiedCode === 'streaming' ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              <CodeBlock language="typescript" code={CODE_EXAMPLES.streaming} />
            </TabsContent>

            <TabsContent value="multi" className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">Multi-Provider Routing</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(CODE_EXAMPLES.multiProvider, 'multi')}
                >
                  {copiedCode === 'multi' ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              <CodeBlock language="typescript" code={CODE_EXAMPLES.multiProvider} />
            </TabsContent>

            <TabsContent value="errors" className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">Error Handling</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(CODE_EXAMPLES.errorHandling, 'errors')}
                >
                  {copiedCode === 'errors' ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              <CodeBlock language="typescript" code={CODE_EXAMPLES.errorHandling} />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Code size={20} weight="bold" className="text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Live Demo</h3>
              <p className="text-sm text-muted-foreground">Try the SDK in action</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="use-real-api" className="text-xs text-muted-foreground cursor-pointer">
                {useRealApi ? "Live API" : "Simulated"}
              </Label>
              <Switch
                id="use-real-api"
                checked={useRealApi}
                onCheckedChange={setUseRealApi}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="demo-prompt" className="text-sm mb-2 block">Your Prompt</Label>
              <Textarea
                id="demo-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <Button 
              onClick={handleRunDemo} 
              disabled={isLoading || (useRealApi && !apiKey)}
              className="w-full"
              variant="default"
            >
              {isLoading ? (
                <>Generating...</>
              ) : (
                <>
                  <Play size={16} weight="bold" className="mr-2" />
                  Run Demo {useRealApi && "(Live API)"}
                </>
              )}
            </Button>

            {response && (
              <div>
                <Label className="text-sm mb-2 block">Response</Label>
                <div className="bg-secondary/50 p-4 rounded-lg border border-border max-h-64 overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    {response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
