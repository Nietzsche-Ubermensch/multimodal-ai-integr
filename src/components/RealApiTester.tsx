import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Key, 
  Warning,
  Code,
  Copy,
  Check
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface ProviderModel {
  provider: string;
  model: string;
  displayName: string;
  description: string;
  endpoint: string;
  color: string;
}

const providerModels: ProviderModel[] = [
  {
    provider: "perplexity",
    model: "perplexity/sonar-pro",
    displayName: "Perplexity Sonar Pro",
    description: "Real-time web search with citations",
    endpoint: "https://api.perplexity.ai/chat/completions",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  },
  {
    provider: "perplexity",
    model: "perplexity/sonar-reasoning",
    displayName: "Perplexity Sonar Reasoning",
    description: "Advanced reasoning with web search",
    endpoint: "https://api.perplexity.ai/chat/completions",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  },
  {
    provider: "openrouter",
    model: "openrouter/meta-llama/llama-2-70b-chat",
    displayName: "OpenRouter Llama 2 70B",
    description: "Meta's flagship open model",
    endpoint: "https://openrouter.ai/api/v1",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    provider: "openrouter",
    model: "openrouter/anthropic/claude-2",
    displayName: "OpenRouter Claude 2",
    description: "Anthropic via OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    provider: "nvidia_nim",
    model: "nvidia_nim/meta/llama3-70b-instruct",
    displayName: "NVIDIA NIM Llama 3 70B",
    description: "Enterprise-grade inference",
    endpoint: "https://integrate.api.nvidia.com/v1",
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  {
    provider: "nvidia_nim",
    model: "nvidia_nim/nvidia/nemotron-4-340b-instruct",
    displayName: "NVIDIA Nemotron 4 340B",
    description: "Massive parameter model",
    endpoint: "https://integrate.api.nvidia.com/v1",
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  {
    provider: "huggingface",
    model: "huggingface/microsoft/codebert-base",
    displayName: "HuggingFace CodeBERT",
    description: "Code understanding embeddings",
    endpoint: "https://api-inference.huggingface.co",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  },
  {
    provider: "huggingface",
    model: "huggingface/BAAI/bge-reranker-base",
    displayName: "HuggingFace BGE Reranker",
    description: "Semantic reranking",
    endpoint: "https://api-inference.huggingface.co",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  }
];

interface TestResult {
  success: boolean;
  latency?: number;
  response?: string;
  error?: string;
  tokens?: number;
}

export function RealApiTester() {
  const [selectedModel, setSelectedModel] = useState(providerModels[0].model);
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("Explain quantum computing in one sentence.");
  const [useRealApi, setUseRealApi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentModel = providerModels.find(p => p.model === selectedModel)!;

  const simulateApiCall = async (): Promise<TestResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const mockResponses: Record<string, string> = {
      "perplexity/sonar-pro": "Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to perform computations exponentially faster than classical computers for specific problem domains. [Source: Nature Physics, 2024]",
      "perplexity/sonar-reasoning": "Quantum computing leverages quantum bits (qubits) that can exist in multiple states simultaneously, enabling parallel processing of vast solution spaces through quantum superposition and entanglement—making it fundamentally different from binary classical computing.",
      "openrouter/meta-llama/llama-2-70b-chat": "Quantum computing uses quantum bits (qubits) that can represent both 0 and 1 simultaneously through superposition, allowing it to solve certain complex problems exponentially faster than classical computers.",
      "openrouter/anthropic/claude-2": "Quantum computing is a revolutionary computing paradigm that harnesses quantum mechanical phenomena—such as superposition and entanglement—to process information in ways that fundamentally differ from classical binary computing.",
      "nvidia_nim/meta/llama3-70b-instruct": "Quantum computing leverages the principles of quantum mechanics, specifically superposition and entanglement, to perform calculations that would be intractable for classical computers.",
      "nvidia_nim/nvidia/nemotron-4-340b-instruct": "Quantum computing represents a paradigm shift in computational technology, utilizing quantum bits (qubits) that exploit quantum superposition and entanglement to solve specific classes of problems—such as cryptography, optimization, and molecular simulation—exponentially faster than classical architectures.",
      "huggingface/microsoft/codebert-base": "[Embedding response: 768-dimensional vector for semantic code search]",
      "huggingface/BAAI/bge-reranker-base": "[Reranking scores: Document relevance ordering based on semantic similarity]"
    };

    return {
      success: true,
      latency: Math.floor(800 + Math.random() * 1200),
      response: mockResponses[selectedModel] || "Quantum computing uses quantum mechanics principles to perform computations.",
      tokens: Math.floor(50 + Math.random() * 100)
    };
  };

  const makeRealApiCall = async (): Promise<TestResult> => {
    const envVarMap: Record<string, string> = {
      perplexity: "PERPLEXITYAI_API_KEY",
      openrouter: "OPENROUTER_API_KEY",
      nvidia_nim: "NVIDIA_NIM_API_KEY",
      huggingface: "HF_TOKEN"
    };

    const provider = currentModel.provider;
    const envVarName = envVarMap[provider];

    const codeSnippet = `from litellm import completion
import os

os.environ['${envVarName}'] = "${apiKey || 'your-api-key-here'}"

response = completion(
    model="${selectedModel}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ]
)

print(response.choices[0].message.content)`;

    return {
      success: false,
      error: `Real API integration requires backend implementation. Use this code:\n\n${codeSnippet}`,
      latency: 0
    };
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      const result = useRealApi ? await makeRealApiCall() : await simulateApiCall();
      
      if (!useRealApi && result.success) {
        result.latency = Date.now() - startTime;
      }

      setTestResult(result);

      if (result.success) {
        toast.success(`${currentModel.displayName} responded successfully!`);
      } else {
        toast.error("Test failed - see details below");
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error("API test failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCodeExample = () => {
    const envVarMap: Record<string, string> = {
      perplexity: "PERPLEXITYAI_API_KEY",
      openrouter: "OPENROUTER_API_KEY",
      nvidia_nim: "NVIDIA_NIM_API_KEY",
      huggingface: "HF_TOKEN"
    };

    const provider = currentModel.provider;
    const envVarName = envVarMap[provider];

    return {
      python: `from litellm import completion
import os

# Set API key from environment
os.environ['${envVarName}'] = ""

# Make completion request
response = completion(
    model="${selectedModel}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ],
    temperature=0.7,
    max_tokens=2048
)

print(response.choices[0].message.content)`,

      pythonStreaming: `from litellm import completion
import os

os.environ['${envVarName}'] = ""

# Streaming response
response = completion(
    model="${selectedModel}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end='')`,

      curl: `curl ${currentModel.endpoint}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $${envVarName}" \\
  -d '{
    "model": "${selectedModel.replace(provider + '/', '')}",
    "messages": [
      {
        "role": "user",
        "content": "${prompt}"
      }
    ]
  }'`,

      javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${currentModel.endpoint}',
  apiKey: process.env.${envVarName}
});

const response = await client.chat.completions.create({
  model: '${selectedModel.replace(provider + '/', '')}',
  messages: [
    {
      role: 'user',
      content: '${prompt}'
    }
  ]
});

console.log(response.choices[0].message.content);`
    };
  };

  const codeExamples = getCodeExample();

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="text-accent" weight="duotone" />
            Live API Testing - LiteLLM Backend
          </CardTitle>
          <CardDescription>
            Test real API integrations with Perplexity, OpenRouter, NVIDIA NIM, and HuggingFace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Code size={16} />
                  Select Provider & Model
                </label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels.map(model => (
                      <SelectItem key={model.model} value={model.model}>
                        <div className="flex items-center gap-2">
                          <span>{model.displayName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className={currentModel.color}>
                  {currentModel.displayName}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentModel.description}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key size={16} />
                  API Key (Optional for simulation)
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter ${currentModel.provider.toUpperCase()} API key...`}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Required only if "Use Real API" is enabled
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Test Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your test prompt..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setUseRealApi(!useRealApi)}
                  variant={useRealApi ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  {useRealApi ? (
                    <>
                      <CheckCircle weight="fill" />
                      Real API Enabled
                    </>
                  ) : (
                    <>
                      <Warning />
                      Simulation Mode
                    </>
                  )}
                </Button>
              </div>

              {useRealApi && !apiKey && (
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <Warning className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-xs text-yellow-300">
                    Real API mode requires an API key. Add your key above or switch to simulation mode.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleTest}
                disabled={isLoading || !prompt || (useRealApi && !apiKey)}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="animate-spin" />
                    Testing API...
                  </>
                ) : (
                  <>
                    <Play weight="fill" />
                    Test {currentModel.displayName}
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {testResult && (
                <Card className={testResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {testResult.success ? (
                        <>
                          <CheckCircle className="text-green-400" weight="fill" />
                          Success
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-400" weight="fill" />
                          Failed
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testResult.success && (
                      <>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>{testResult.latency}ms</span>
                          </div>
                          {testResult.tokens && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {testResult.tokens} tokens
                              </Badge>
                            </div>
                          )}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Response</label>
                          <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/30 p-3">
                            <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                              {testResult.response}
                            </p>
                          </ScrollArea>
                        </div>
                      </>
                    )}
                    {!testResult.success && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-red-400">Error Details</label>
                        <ScrollArea className="h-[200px] w-full rounded-md border border-red-500/20 bg-red-500/5 p-3">
                          <pre className="text-xs leading-relaxed font-mono text-red-300 whitespace-pre-wrap">
                            {testResult.error}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!testResult && (
                <Card className="bg-muted/30 border-border">
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground py-12">
                      <Code size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Run a test to see results here</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="text-accent" />
              Implementation Code
            </h3>
            <Tabs defaultValue="python" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="pythonStreaming">Streaming</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>

              {Object.entries(codeExamples).map(([key, code], index) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="relative">
                    <ScrollArea className="h-[300px] w-full rounded-md border bg-code-bg p-4">
                      <pre className="text-xs font-mono">
                        <code className="text-foreground">{code}</code>
                      </pre>
                    </ScrollArea>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(code, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="text-green-400" />
                      ) : (
                        <Copy />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <Alert>
            <Warning className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Note:</strong> Real API calls require backend implementation for security. 
              Never expose API keys in frontend code. Use simulation mode for testing UI/UX or 
              implement a secure backend proxy following the code examples above.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Perplexity AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• Real-time web search</div>
            <div>• Citation support</div>
            <div>• Reasoning models</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">OpenRouter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• 100+ model access</div>
            <div>• Unified API gateway</div>
            <div>• Transparent pricing</div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">NVIDIA NIM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• Enterprise inference</div>
            <div>• Optimized GPUs</div>
            <div>• High throughput</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">HuggingFace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• 500K+ models</div>
            <div>• Embeddings & reranking</div>
            <div>• Open-source focus</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
