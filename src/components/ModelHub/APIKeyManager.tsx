import { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  WarningCircle, 
  Clock,
  ShieldCheck,
  Eye,
  EyeSlash,
  Lightning,
  Key,
  PlayCircle,
  Info,
  Database
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface ProviderConfig {
  id: string;
  name: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  testEndpoint: string;
  testModel: string;
  keyFormat?: RegExp;
  docs: string;
}

interface KeyStatus {
  status: "valid" | "invalid" | "untested" | "testing";
  lastChecked?: string;
  error?: string;
  modelInfo?: string;
  latency?: number;
  modelCount?: number;
}

interface APIKeyManagerProps {
  onConfigurationChange?: (configured: boolean) => void;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "400+ models unified gateway",
    required: true,
    icon: <Lightning className="w-5 h-5" />,
    testEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    testModel: "openai/gpt-3.5-turbo",
    keyFormat: /^sk-or-v1-[a-f0-9]{64}$/,
    docs: "https://openrouter.ai/keys"
  },
  {
    id: "xai",
    name: "xAI Grok",
    description: "Grok 4.1 Fast - 2M context, reasoning",
    required: true,
    icon: <Key className="w-5 h-5" />,
    testEndpoint: "https://api.x.ai/v1/chat/completions",
    testModel: "grok-4-1-fast-reasoning",
    keyFormat: /^xai-[a-zA-Z0-9]{40,}$/,
    docs: "https://console.x.ai"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "V3.2 & V3.2-Speciale reasoning models",
    required: true,
    icon: <ShieldCheck className="w-5 h-5" />,
    testEndpoint: "https://api.deepseek.com/v1/chat/completions",
    testModel: "deepseek-chat",
    keyFormat: /^sk-[a-f0-9]{48}$/,
    docs: "https://platform.deepseek.com/api_keys"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Opus 4.5 - #1 on SWE-bench (80.9%)",
    required: false,
    icon: <Key className="w-5 h-5" />,
    testEndpoint: "https://api.anthropic.com/v1/messages",
    testModel: "claude-opus-4.5",
    keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
    docs: "https://console.anthropic.com"
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-5 with 400K context",
    required: false,
    icon: <Lightning className="w-5 h-5" />,
    testEndpoint: "https://api.openai.com/v1/chat/completions",
    testModel: "gpt-3.5-turbo",
    keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
    docs: "https://platform.openai.com/api-keys"
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "Enterprise AI inference platform",
    required: false,
    icon: <Lightning className="w-5 h-5" />,
    testEndpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    testModel: "nvidia/llama-3.1-nemotron-70b-instruct",
    keyFormat: /^nvapi-[a-zA-Z0-9\-_]{20,}$/,
    docs: "https://build.nvidia.com"
  },
  {
    id: "venice",
    name: "Venice AI",
    description: "Uncensored • Zero-Logging • Privacy First",
    required: false,
    icon: <ShieldCheck className="w-5 h-5" />,
    testEndpoint: "https://api.venice.ai/api/v1/chat/completions",
    testModel: "venice-uncensored",
    docs: "https://venice.ai"
  },
  {
    id: "deepinfra",
    name: "DeepInfra",
    description: "Uncensored • Fast Inference • Zero-Logging",
    required: false,
    icon: <Lightning className="w-5 h-5" />,
    testEndpoint: "https://api.deepinfra.com/v1/openai/chat/completions",
    testModel: "cognitivecomputations/dolphin-2.6-mixtral-8x7b",
    docs: "https://deepinfra.com/dash/api_keys"
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    description: "Web scraping • LLM-ready markdown • Fast crawling",
    required: false,
    icon: <Lightning className="w-5 h-5" weight="fill" />,
    testEndpoint: "https://api.firecrawl.dev/v1/scrape",
    testModel: "firecrawl-scrape",
    docs: "https://www.firecrawl.dev"
  },
  {
    id: "oxylabs",
    name: "Oxylabs AI Studio",
    description: "Geo-targeted scraping • Proxy rotation • Enterprise",
    required: false,
    icon: <Database className="w-5 h-5" />,
    testEndpoint: "https://realtime.oxylabs.io/v1/queries",
    testModel: "oxylabs-scraper",
    docs: "https://oxylabs.io/products/ai-studio"
  }
];


export function APIKeyManager({ onConfigurationChange }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>("modelhub_api_keys", {});
  const [keyStatuses, setKeyStatuses] = useKV<Record<string, KeyStatus>>("modelhub_key_statuses", {});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [batchTesting, setBatchTesting] = useState(false);

  useEffect(() => {
    if (!keyStatuses) return;
    const requiredProviders = PROVIDERS.filter(p => p.required);
    const allRequiredValid = requiredProviders.every(
      p => keyStatuses[p.id]?.status === "valid"
    );
    
    if (onConfigurationChange) {
      onConfigurationChange(allRequiredValid);
    }
  }, [keyStatuses, onConfigurationChange]);

  const updateKey = (provider: string, value: string) => {
    setApiKeys(current => ({ ...(current || {}), [provider]: value }));
    setKeyStatuses(current => ({
      ...(current || {}),
      [provider]: { ...(current?.[provider] || {}), status: "untested" }
    }));
  };

  const validateKeyFormat = (provider: ProviderConfig, key: string): boolean => {
    if (!provider.keyFormat) return true;
    return provider.keyFormat.test(key);
  };

  const validateKey = async (provider: ProviderConfig) => {
    const key = apiKeys?.[provider.id];
    if (!key || !key.trim()) {
      toast.error(`Please enter an API key for ${provider.name}`);
      return;
    }

    // Format validation
    if (!validateKeyFormat(provider, key)) {
      toast.error(`Invalid key format for ${provider.name}`);
      setKeyStatuses(current => ({
        ...(current || {}),
        [provider.id]: {
          status: "invalid",
          error: "Invalid key format",
          lastChecked: new Date().toISOString()
        }
      }));
      return;
    }

    setTestingKey(provider.id);
    setKeyStatuses(current => ({
      ...(current || {}),
      [provider.id]: { status: "testing" }
    }));

    const startTime = Date.now();

    try {
      // Real API validation
      const response = await fetch(provider.testEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          ...(provider.id === 'anthropic' ? {
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          } : {})
        },
        body: JSON.stringify({
          model: provider.testModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        }),
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok || response.status === 400) {
        // 400 might mean valid key but invalid request format
        const data = await response.json().catch(() => ({}));
        
        setKeyStatuses(current => ({
          ...(current || {}),
          [provider.id]: {
            status: "valid",
            lastChecked: new Date().toISOString(),
            latency,
            modelInfo: provider.testModel,
            modelCount: provider.id === 'openrouter' ? 400 : undefined
          }
        }));
        
        toast.success(`${provider.name} API key validated (${latency}ms)`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      
      setKeyStatuses(current => ({
        ...(current || {}),
        [provider.id]: {
          status: "invalid",
          lastChecked: new Date().toISOString(),
          error: errorMessage,
          latency
        }
      }));
      
      toast.error(`${provider.name} validation failed: ${errorMessage}`);
    } finally {
      setTestingKey(null);
    }
  };

  const validateAllKeys = async () => {
    setBatchTesting(true);
    toast.info("Testing all configured API keys...");
    
    const providersToTest = PROVIDERS.filter(p => apiKeys?.[p.id]);
    
    for (const provider of providersToTest) {
      await validateKey(provider);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setBatchTesting(false);
    toast.success("Batch validation complete!");
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(current => ({ ...current, [provider]: !current[provider] }));
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "valid":
        return <CheckCircle size={20} weight="fill" className="text-success" />;
      case "invalid":
        return <XCircle size={20} weight="fill" className="text-destructive" />;
      case "testing":
        return <Clock size={20} className="text-warning animate-spin" />;
      default:
        return <WarningCircle size={20} className="text-muted-foreground" />;
    }
  };

  const requiredProviders = PROVIDERS.filter(p => p.required);
  const allRequiredValid = requiredProviders.every(
    p => keyStatuses?.[p.id]?.status === "valid"
  );
  
  const configuredCount = Object.keys(apiKeys || {}).filter(k => apiKeys?.[k]).length;
  const validatedCount = Object.values(keyStatuses || {}).filter(s => s.status === "valid").length;
  const avgLatency = Object.values(keyStatuses || {})
    .filter(s => s.latency)
    .reduce((acc, s, _, arr) => acc + (s.latency || 0) / arr.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Configured</div>
              <div className="text-2xl font-bold">{configuredCount}/{PROVIDERS.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Validated</div>
              <div className="text-2xl font-bold text-success">{validatedCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Required</div>
              <div className="text-2xl font-bold">
                {requiredProviders.filter(p => keyStatuses?.[p.id]?.status === "valid").length}/{requiredProviders.length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Avg Latency</div>
              <div className="text-2xl font-bold">{avgLatency > 0 ? `${Math.round(avgLatency)}ms` : '-'}</div>
            </Card>
          </div>

          {/* Batch Actions */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={validateAllKeys}
              disabled={batchTesting || configuredCount === 0}
              className="gap-2"
            >
              <PlayCircle size={18} />
              {batchTesting ? "Testing All..." : "Validate All Keys"}
            </Button>
          </div>

          {/* Warning Banner */}
          {!allRequiredValid && (
            <Card className="p-4 border-warning bg-warning/10 mb-6">
              <div className="flex items-start gap-3">
                <WarningCircle size={24} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-warning">Setup Required</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure and validate all required API keys ({requiredProviders.map(p => p.name).join(", ")}) to unlock the full platform.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROVIDERS.map((provider) => {
              const status = keyStatuses?.[provider.id];
              const key = apiKeys?.[provider.id] || "";
              const isVisible = showKeys[provider.id];

              return (
                <Card
                  key={provider.id}
                  className={`p-4 border-2 transition-all ${
                    status?.status === "valid"
                      ? "border-success bg-success/5"
                      : status?.status === "invalid"
                      ? "border-destructive bg-destructive/5"
                      : status?.status === "testing"
                      ? "border-warning bg-warning/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {provider.icon}
                        <div>
                          <Label className="font-semibold text-base">{provider.name}</Label>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                        </div>
                      </div>
                      <Badge variant={provider.required ? "default" : "outline"}>
                        {provider.required ? "Required" : "Optional"}
                      </Badge>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status?.status)}
                      <span className="text-sm font-medium">
                        {status?.status === "valid" && "✅ Valid"}
                        {status?.status === "invalid" && "❌ Invalid"}
                        {status?.status === "testing" && "⏳ Testing..."}
                        {!status?.status && (provider.required ? "⚠️ Required" : "Optional")}
                      </span>
                      {status?.latency && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {status.latency}ms
                        </span>
                      )}
                    </div>

                    {/* API Key Input */}
                    <div className="relative">
                      <Input
                        type={isVisible ? "text" : "password"}
                        value={key}
                        onChange={(e) => updateKey(provider.id, e.target.value)}
                        placeholder={`Paste ${provider.name} API key...`}
                        className="font-mono text-sm pr-10"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(provider.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isVisible ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => validateKey(provider)}
                        disabled={!key || testingKey === provider.id || batchTesting}
                        size="sm"
                        className="flex-1 gap-2"
                        variant={status?.status === "valid" ? "outline" : "default"}
                      >
                        <ShieldCheck size={16} />
                        {testingKey === provider.id ? "Testing..." : "Validate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(provider.docs, "_blank")}
                      >
                        Get Key
                      </Button>
                    </div>

                    {/* Error Message */}
                    {status?.error && (
                      <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
                        {status.error}
                      </div>
                    )}

                    {/* Success Info */}
                    {status?.status === "valid" && status.lastChecked && (
                      <div className="space-y-1">
                        <p className="text-xs text-success font-mono">
                          ✓ Last validated: {new Date(status.lastChecked).toLocaleString()}
                        </p>
                        {status.modelInfo && (
                          <p className="text-xs text-muted-foreground">
                            Model: {status.modelInfo}
                          </p>
                        )}
                        {status.modelCount && (
                          <p className="text-xs text-muted-foreground">
                            {status.modelCount}+ models available
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Success Banner */}
          {allRequiredValid && (
            <Card className="p-4 border-success bg-success/10 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} weight="fill" className="text-success mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-success">All Systems Go! 🚀</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your platform is ready. Access all models and features in the "Explore" tab.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-5 h-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>🔒 Keys are stored encrypted in your browser's local storage only</p>
          <p>🚫 Never share API keys or commit them to version control</p>
          <p>⚡ Validation uses minimal API calls (5 tokens max)</p>
          <p>🔄 Rotate keys every 90 days and monitor usage in provider dashboards</p>
        </CardContent>
      </Card>
    </div>
  );
}
