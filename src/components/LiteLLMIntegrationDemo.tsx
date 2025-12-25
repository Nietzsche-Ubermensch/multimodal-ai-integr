import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Play, Code, Terminal, GitBranch, CheckCircle, XCircle, Clock, Cpu } from "@phosphor-icons/react";
import { toast } from "sonner";

interface ProviderConfig {
  name: string;
  model: string;
  displayName: string;
  description: string;
  color: string;
}

const providers: ProviderConfig[] = [
  {
    name: "openrouter",
    model: "openrouter/anthropic/claude-3.5-sonnet",
    displayName: "OpenRouter (Claude 3.5)",
    description: "Gateway to 100+ models",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    name: "deepseek",
    model: "deepseek/deepseek-chat",
    displayName: "DeepSeek Chat",
    description: "Cost-effective MoE model",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    name: "anthropic",
    model: "anthropic/claude-3-5-sonnet-20241022",
    displayName: "Anthropic Direct",
    description: "Direct Claude API",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  },
  {
    name: "xai",
    model: "xai/grok-beta",
    displayName: "xAI Grok",
    description: "Web search capable",
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  {
    name: "openai",
    model: "openai/gpt-4-turbo",
    displayName: "OpenAI GPT-4",
    description: "Industry standard",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  }
];

export function LiteLLMIntegrationDemo() {
  const [selectedProvider, setSelectedProvider] = useState(providers[0].model);
  const [prompt, setPrompt] = useState("Explain quantum entanglement in one sentence.");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const simulateCompletion = async () => {
    setIsLoading(true);
    setLatency(null);
    const startTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const responses: Record<string, string> = {
      "openrouter/anthropic/claude-3.5-sonnet": "Quantum entanglement is a phenomenon where two particles become correlated such that measuring one instantaneously affects the other, regardless of distance, creating what Einstein called 'spooky action at a distance.'",
      "deepseek/deepseek-chat": "Quantum entanglement occurs when particles interact and become correlated, causing measurements on one particle to instantly influence the state of another, even across vast distances.",
      "anthropic/claude-3-5-sonnet-20241022": "Quantum entanglement is a quantum mechanical phenomenon where pairs or groups of particles interact such that the quantum state of each particle cannot be described independently, even when separated by large distances.",
      "xai/grok-beta": "Quantum entanglement is when two or more particles become connected in such a way that the state of one particle instantly influences the state of the other(s), no matter how far apart they are—basically, particles gossiping at faster-than-light speeds!",
      "openai/gpt-4-turbo": "Quantum entanglement is a physical phenomenon occurring when pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently of the others, even when separated by large distances."
    };

    setResponse(responses[selectedProvider] || "Response generated successfully.");
    setLatency(Date.now() - startTime);
    setIsLoading(false);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentProvider = providers.find(p => p.model === selectedProvider);

  const codeExamples = {
    installation: `# Install LiteLLM with all extras
pip install 'litellm[proxy]'

# Or with specific providers
pip install litellm anthropic openai

# Verify installation
litellm --version`,

    basicUsage: `from litellm import completion
import os

# Environment variables automatically loaded
# OPENROUTER_API_KEY, DEEPSEEK_API_KEY, etc.

response = completion(
    model="${selectedProvider}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ],
    temperature=0.7,
    max_tokens=2048
)

print(response.choices[0].message.content)`,

    routerConfig: `from litellm import Router

# Configure router with fallback chain
router = Router(
    model_list=[
        {
            "model_name": "primary",
            "litellm_params": {
                "model": "openrouter/anthropic/claude-3.5-sonnet",
                "api_key": os.getenv("OPENROUTER_API_KEY")
            },
            "tpm": 100000,
            "rpm": 1000
        },
        {
            "model_name": "fallback",
            "litellm_params": {
                "model": "deepseek/deepseek-chat",
                "api_key": os.getenv("DEEPSEEK_API_KEY")
            },
            "tpm": 200000,
            "rpm": 2000
        }
    ],
    fallbacks=[{"primary": ["fallback"]}],
    routing_strategy="latency-based-routing"
)

# Use router
response = router.completion(
    model="primary",
    messages=[{"role": "user", "content": "Hello"}]
)`,

    caching: `from litellm import completion
from redis import Redis

# Enable caching with Redis
redis_client = Redis(host='localhost', port=6379)

def cached_completion(messages, model, **kwargs):
    import hashlib
    import json
    
    # Generate cache key
    cache_data = {"messages": messages, "model": model}
    cache_key = hashlib.sha256(
        json.dumps(cache_data, sort_keys=True).encode()
    ).hexdigest()
    
    # Check cache
    cached = redis_client.get(f"litellm:{cache_key}")
    if cached:
        return cached.decode()
    
    # Make request
    response = completion(model=model, messages=messages, **kwargs)
    result = response.choices[0].message.content
    
    # Cache for 1 hour
    redis_client.setex(f"litellm:{cache_key}", 3600, result)
    
    return result`,

    errorHandling: `from litellm import completion
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def robust_completion(messages, model, **kwargs):
    try:
        return completion(model=model, messages=messages, **kwargs)
    except Exception as e:
        print(f"Attempt failed: {e}")
        raise

# Multi-provider fallback
def multi_provider_completion(messages, **kwargs):
    providers = [
        "openrouter/anthropic/claude-3.5-sonnet",
        "deepseek/deepseek-chat",
        "openai/gpt-4-turbo"
    ]
    
    for provider in providers:
        try:
            return completion(model=provider, messages=messages, **kwargs)
        except Exception as e:
            print(f"Provider {provider} failed: {e}")
            continue
    
    raise Exception("All providers failed")`
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="text-accent" weight="duotone" />
              Interactive LiteLLM Demo
            </CardTitle>
            <CardDescription>
              Test multi-provider integration with automatic fallback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.model} value={provider.model}>
                      <div className="flex items-center gap-2">
                        <span>{provider.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentProvider && (
              <Badge variant="outline" className={currentProvider.color}>
                {currentProvider.displayName}
              </Badge>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="min-h-[100px] font-mono text-sm"
              />
            </div>

            <Button
              onClick={simulateCompletion}
              disabled={isLoading || !prompt}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Clock className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play weight="fill" />
                  Test Completion
                </>
              )}
            </Button>

            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Response</label>
                  {latency && (
                    <Badge variant="outline" className="gap-1">
                      <Clock size={12} />
                      {latency}ms
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <ScrollArea className="h-[150px] w-full rounded-md border bg-muted/30 p-4">
                    <p className="text-sm leading-relaxed">{response}</p>
                  </ScrollArea>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(response, -1)}
                  >
                    {copiedIndex === -1 ? (
                      <Check className="text-green-400" />
                    ) : (
                      <Copy />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="text-accent" weight="duotone" />
              Architecture Overview
            </CardTitle>
            <CardDescription>
              How LiteLLM integrates with your backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle className="text-primary" weight="fill" size={16} />
                  <span className="text-primary font-semibold">Frontend (React/Next.js)</span>
                </div>
                <div className="ml-4 text-muted-foreground">↓ HTTPS Request</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <Code className="text-accent" weight="fill" size={16} />
                  <span className="text-accent font-semibold">API Gateway (/api/chat)</span>
                </div>
                <div className="ml-4 text-muted-foreground">↓ Route to LiteLLM</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
                  <Terminal className="text-foreground" weight="fill" size={16} />
                  <span className="font-semibold">LiteLLM Integration Layer</span>
                </div>
                <div className="ml-8 space-y-1 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Request Router & Load Balancer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Caching Layer (Redis)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Retry & Fallback Logic</span>
                  </div>
                </div>
                <div className="ml-4 text-muted-foreground">↓ Provider Selection</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-purple-400 text-xs">OpenRouter</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-blue-400 text-xs">DeepSeek</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-orange-400 text-xs">Anthropic</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-green-400 text-xs">xAI Grok</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <Alert>
              <CheckCircle className="h-4 w-4 text-green-400" weight="fill" />
              <AlertDescription className="text-xs">
                <strong>Key Benefits:</strong> Unified interface, automatic retries, intelligent routing, 
                cost tracking, and seamless fallback across 100+ models
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="text-accent" weight="duotone" />
            Implementation Code Examples
          </CardTitle>
          <CardDescription>
            Production-ready integration patterns for {currentProvider?.displayName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="installation" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="installation">Install</TabsTrigger>
              <TabsTrigger value="basicUsage">Basic</TabsTrigger>
              <TabsTrigger value="routerConfig">Router</TabsTrigger>
              <TabsTrigger value="caching">Cache</TabsTrigger>
              <TabsTrigger value="errorHandling">Errors</TabsTrigger>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="text-green-400" weight="fill" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• Redis caching (80%+ hit rate)</div>
            <div>• Latency-based routing</div>
            <div>• Request batching support</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="text-blue-400" weight="fill" />
              Reliability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• Automatic retry logic</div>
            <div>• Multi-provider fallback</div>
            <div>• Health check monitoring</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="text-purple-400" weight="fill" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>• Environment-based secrets</div>
            <div>• Rate limiting (100 req/hr)</div>
            <div>• Input validation & sanitization</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
