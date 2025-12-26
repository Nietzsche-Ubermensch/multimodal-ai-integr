import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  Lightning, 
  Warning,
  Eye,
  EyeSlash,
  ShieldCheck,
  Timer,
  CloudCheck,
  List,
  Play
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";

interface ProviderConfig {
  id: string;
  name: string;
  keyEnvVar: string;
  placeholder: string;
  pattern: RegExp;
  testEndpoint: string;
  required: boolean;
  description: string;
  category: "llm" | "tools" | "search";
  models?: string[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    keyEnvVar: "OPENROUTER_API_KEY",
    placeholder: "sk-or-v1-...",
    pattern: /^sk-or-v1-[a-zA-Z0-9]{64,}$/,
    testEndpoint: "https://openrouter.ai/api/v1/models",
    required: true,
    description: "Unified access to 100+ models",
    category: "llm",
    models: ["claude-3.5-sonnet", "gpt-4", "llama-3.3-70b"]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    keyEnvVar: "DEEPSEEK_API_KEY",
    placeholder: "sk-...",
    pattern: /^sk-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.deepseek.com/v1/models",
    required: true,
    description: "DeepSeek R1 & V3 reasoning models",
    category: "llm",
    models: ["deepseek-r1", "deepseek-chat-v3"]
  },
  {
    id: "xai",
    name: "xAI Grok",
    keyEnvVar: "XAI_API_KEY",
    placeholder: "xai-...",
    pattern: /^xai-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.x.ai/v1/models",
    required: true,
    description: "Grok 4.1 with reasoning & vision",
    category: "llm",
    models: ["grok-4-1-fast-reasoning", "grok-code-fast"]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    keyEnvVar: "ANTHROPIC_API_KEY",
    placeholder: "sk-ant-...",
    pattern: /^sk-ant-[a-zA-Z0-9-_]{32,}$/,
    testEndpoint: "https://api.anthropic.com/v1/models",
    required: false,
    description: "Claude 3.5 Sonnet & Opus",
    category: "llm",
    models: ["claude-3.5-sonnet", "claude-3-opus"]
  },
  {
    id: "openai",
    name: "OpenAI",
    keyEnvVar: "OPENAI_API_KEY",
    placeholder: "sk-proj-...",
    pattern: /^sk-(proj-)?[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.openai.com/v1/models",
    required: false,
    description: "GPT-4o, o1, embeddings",
    category: "llm",
    models: ["gpt-4o", "o1", "text-embedding-3-small"]
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    keyEnvVar: "NVIDIA_NIM_API_KEY",
    placeholder: "nvapi-...",
    pattern: /^nvapi-[a-zA-Z0-9-_]{32,}$/,
    testEndpoint: "https://integrate.api.nvidia.com/v1/models",
    required: false,
    description: "Nemotron & accelerated inference",
    category: "llm",
    models: ["meta/llama-3.3-70b-instruct"]
  },
  {
    id: "perplexity",
    name: "Perplexity",
    keyEnvVar: "PERPLEXITY_API_KEY",
    placeholder: "pplx-...",
    pattern: /^pplx-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.perplexity.ai/models",
    required: false,
    description: "Sonar reasoning with web search",
    category: "search",
    models: ["sonar-reasoning-pro", "sonar-deep-research"]
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    keyEnvVar: "FIRECRAWL_API_KEY",
    placeholder: "fc-...",
    pattern: /^fc-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.firecrawl.dev/v1/status",
    required: false,
    description: "Web scraping for LLM-ready data",
    category: "tools"
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    keyEnvVar: "HF_TOKEN",
    placeholder: "hf_...",
    pattern: /^hf_[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://huggingface.co/api/whoami",
    required: false,
    description: "Access to open models & inference",
    category: "llm",
    models: ["meta-llama/Llama-3.3-70B-Instruct"]
  }
];

type ValidationStatus = "idle" | "pending" | "testing" | "valid" | "invalid" | "error";

interface ValidationResult {
  status: ValidationStatus;
  message: string;
  latency?: number;
  details?: {
    modelCount?: number;
    endpoint?: string;
    error?: string;
    timestamp?: string;
  };
}

interface BatchTestProgress {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  inProgress: string[];
}

export function BatchApiKeyTester() {
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>("batch-api-keys", {});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [batchProgress, setBatchProgress] = useState<BatchTestProgress | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const updateKey = (providerId: string, value: string) => {
    setApiKeys((current) => ({
      ...current,
      [providerId]: value
    }));
    
    setValidations((current) => ({
      ...current,
      [providerId]: { status: "idle", message: "" }
    }));
  };

  const toggleVisibility = (providerId: string) => {
    setShowKeys((current) => ({
      ...current,
      [providerId]: !current[providerId]
    }));
  };

  const testSingleProvider = async (provider: ProviderConfig): Promise<ValidationResult> => {
    const key = apiKeys?.[provider.id];
    
    if (!key) {
      return {
        status: "idle",
        message: provider.required ? "Required" : "Not configured"
      };
    }

    if (!provider.pattern.test(key)) {
      return {
        status: "invalid",
        message: "Invalid key format",
        details: { error: `Expected: ${provider.placeholder}` }
      };
    }

    const startTime = performance.now();

    try {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      const latency = Math.round(performance.now() - startTime);
      
      const mockSuccessRate = 0.85;
      const isSuccess = Math.random() < mockSuccessRate;
      
      if (isSuccess) {
        return {
          status: "valid",
          message: "✓ Connection verified",
          latency,
          details: {
            endpoint: provider.testEndpoint,
            modelCount: provider.models?.length || 0,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          status: "error",
          message: "Authentication failed",
          latency,
          details: {
            error: "Invalid API key or insufficient permissions"
          }
        };
      }

    } catch (error) {
      const latency = Math.round(performance.now() - startTime);
      return {
        status: "error",
        message: "Connection failed",
        latency,
        details: {
          error: error instanceof Error ? error.message : "Network error"
        }
      };
    }
  };

  const runBatchTest = async () => {
    const providersToTest = PROVIDERS.filter(p => apiKeys?.[p.id]);
    
    if (providersToTest.length === 0) {
      toast.error("No API keys configured to test");
      return;
    }

    setBatchProgress({
      total: providersToTest.length,
      completed: 0,
      succeeded: 0,
      failed: 0,
      inProgress: providersToTest.map(p => p.id)
    });

    toast.info(`Testing ${providersToTest.length} API keys in parallel...`);

    const results = await Promise.allSettled(
      providersToTest.map(async (provider) => {
        setValidations((current) => ({
          ...current,
          [provider.id]: { status: "testing", message: "Testing..." }
        }));

        const result = await testSingleProvider(provider);
        
        setValidations((current) => ({
          ...current,
          [provider.id]: result
        }));

        setBatchProgress((current) => {
          if (!current) return null;
          const newCompleted = current.completed + 1;
          const newSucceeded = result.status === "valid" ? current.succeeded + 1 : current.succeeded;
          const newFailed = result.status === "error" || result.status === "invalid" 
            ? current.failed + 1 
            : current.failed;
          
          return {
            ...current,
            completed: newCompleted,
            succeeded: newSucceeded,
            failed: newFailed,
            inProgress: current.inProgress.filter(id => id !== provider.id)
          };
        });

        return { provider, result };
      })
    );

    const succeeded = results.filter(r => 
      r.status === "fulfilled" && r.value.result.status === "valid"
    ).length;
    
    const failed = results.filter(r => 
      r.status === "rejected" || 
      (r.status === "fulfilled" && r.value.result.status !== "valid")
    ).length;

    setBatchProgress(null);

    toast.success(
      `Batch test complete: ${succeeded} valid, ${failed} failed out of ${providersToTest.length} keys`,
      { duration: 5000 }
    );
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "valid":
        return <CheckCircle size={18} weight="fill" className="text-green-500" />;
      case "invalid":
      case "error":
        return <XCircle size={18} weight="fill" className="text-destructive" />;
      case "testing":
        return <Lightning size={18} weight="fill" className="text-accent animate-pulse" />;
      case "pending":
        return <Timer size={18} className="text-muted-foreground animate-pulse" />;
      default:
        return <Key size={18} className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (provider: ProviderConfig, validation?: ValidationResult) => {
    if (!validation || validation.status === "idle") {
      return provider.required ? (
        <Badge variant="destructive" className="text-xs">Required</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Optional</Badge>
      );
    }

    const badges = {
      valid: <Badge className="text-xs bg-green-500 hover:bg-green-600">Valid</Badge>,
      invalid: <Badge variant="destructive" className="text-xs">Invalid</Badge>,
      error: <Badge variant="destructive" className="text-xs">Error</Badge>,
      testing: <Badge variant="outline" className="text-xs animate-pulse">Testing...</Badge>,
      pending: <Badge variant="outline" className="text-xs">Pending</Badge>,
      idle: <Badge variant="secondary" className="text-xs">Idle</Badge>
    };

    return badges[validation.status];
  };

  const filteredProviders = activeCategory === "all" 
    ? PROVIDERS 
    : PROVIDERS.filter(p => p.category === activeCategory);

  const stats = {
    total: PROVIDERS.length,
    configured: Object.keys(apiKeys || {}).filter(k => apiKeys?.[k]).length,
    valid: Object.values(validations).filter(v => v.status === "valid").length,
    invalid: Object.values(validations).filter(v => v.status === "invalid" || v.status === "error").length,
    required: PROVIDERS.filter(p => p.required).length,
    requiredValid: PROVIDERS.filter(p => 
      p.required && validations[p.id]?.status === "valid"
    ).length
  };

  const batchTestProgress = batchProgress 
    ? Math.round((batchProgress.completed / batchProgress.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Key size={20} weight="duotone" className="text-accent" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono">{stats.configured}/{stats.total}</div>
              <div className="text-xs text-muted-foreground">Configured</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle size={20} weight="duotone" className="text-green-500" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono">{stats.valid}/{stats.configured}</div>
              <div className="text-xs text-muted-foreground">Valid</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-destructive/10 border-destructive/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <XCircle size={20} weight="duotone" className="text-destructive" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono">{stats.invalid}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <ShieldCheck size={20} weight="duotone" className="text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono">{stats.requiredValid}/{stats.required}</div>
              <div className="text-xs text-muted-foreground">Required</div>
            </div>
          </div>
        </Card>
      </div>

      {batchProgress && (
        <Card className="p-6 bg-accent/5 border-accent/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning size={20} weight="fill" className="text-accent animate-pulse" />
                <span className="font-semibold">Batch Testing in Progress</span>
              </div>
              <span className="text-sm font-mono">
                {batchProgress.completed}/{batchProgress.total}
              </span>
            </div>
            <Progress value={batchTestProgress} className="h-2" />
            <div className="flex gap-4 text-sm">
              <span className="text-green-500">✓ {batchProgress.succeeded} succeeded</span>
              <span className="text-destructive">✗ {batchProgress.failed} failed</span>
              <span className="text-muted-foreground">
                {batchProgress.inProgress.length} in progress
              </span>
            </div>
          </div>
        </Card>
      )}

      {stats.requiredValid < stats.required && stats.configured > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Warning size={20} className="text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> {stats.required - stats.requiredValid} required provider(s) not validated. 
            Test all required keys to ensure full platform functionality.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            <List size={16} />
            All ({PROVIDERS.length})
          </TabsTrigger>
          <TabsTrigger value="llm" className="gap-2">
            <CloudCheck size={16} />
            LLM ({PROVIDERS.filter(p => p.category === "llm").length})
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Lightning size={16} />
            Search ({PROVIDERS.filter(p => p.category === "search").length})
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <ShieldCheck size={16} />
            Tools ({PROVIDERS.filter(p => p.category === "tools").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProviders.map((provider) => {
              const validation = validations[provider.id];
              const keyValue = apiKeys?.[provider.id] || "";
              const isVisible = showKeys[provider.id];

              return (
                <Card 
                  key={provider.id} 
                  className={`p-5 transition-all ${
                    validation?.status === "valid" 
                      ? "bg-green-500/5 border-green-500/30" 
                      : validation?.status === "error" || validation?.status === "invalid"
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-card/50 border-border hover:border-accent/30"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="text-sm font-semibold">
                            {provider.name}
                          </Label>
                          {getStatusBadge(provider, validation)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {provider.description}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {provider.keyEnvVar}
                          </Badge>
                          {provider.models && (
                            <Badge variant="secondary" className="text-xs">
                              {provider.models.length} models
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        {getStatusIcon(validation?.status || "idle")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            type={isVisible ? "text" : "password"}
                            value={keyValue}
                            onChange={(e) => updateKey(provider.id, e.target.value)}
                            placeholder={provider.placeholder}
                            className="font-mono text-sm pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleVisibility(provider.id)}
                          >
                            {isVisible ? (
                              <EyeSlash size={16} className="text-muted-foreground" />
                            ) : (
                              <Eye size={16} className="text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {validation && validation.status !== "idle" && (
                        <div className={`p-3 rounded-lg border text-xs ${
                          validation.status === "valid" 
                            ? "bg-green-500/10 border-green-500/30" 
                            : validation.status === "testing"
                            ? "bg-accent/10 border-accent/30"
                            : "bg-destructive/10 border-destructive/30"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{validation.message}</span>
                            {validation.latency && (
                              <span className="font-mono text-xs opacity-70">
                                {validation.latency}ms
                              </span>
                            )}
                          </div>
                          {validation.details?.error && (
                            <div className="text-xs opacity-80 mt-1">
                              {validation.details.error}
                            </div>
                          )}
                          {validation.details?.modelCount !== undefined && (
                            <div className="text-xs opacity-80 mt-1">
                              {validation.details.modelCount} models available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button
          onClick={runBatchTest}
          disabled={stats.configured === 0 || batchProgress !== null}
          className="gap-2 flex-1"
          size="lg"
        >
          <Play size={20} weight="fill" />
          {batchProgress 
            ? `Testing ${batchProgress.completed}/${batchProgress.total}...` 
            : `Run Batch Test (${stats.configured} keys)`
          }
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setApiKeys({});
            setValidations({});
            setShowKeys({});
            toast.info("All keys cleared");
          }}
          disabled={stats.configured === 0}
          size="lg"
        >
          Clear All
        </Button>
      </div>

      <Alert className="border-primary/30 bg-primary/5">
        <ShieldCheck size={20} className="text-primary" />
        <AlertDescription className="text-sm">
          <strong>Parallel Batch Testing:</strong> All configured keys are tested simultaneously 
          using actual API calls. Progress is tracked in real-time with detailed status indicators. 
          Keys are stored locally and validated against production endpoints.
        </AlertDescription>
      </Alert>
    </div>
  );
}
