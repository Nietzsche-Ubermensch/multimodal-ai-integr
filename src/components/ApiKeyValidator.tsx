import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  Lightning, 
  Warning,
  Eye,
  EyeSlash,
  ShieldCheck
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { validateApiKey } from "@/lib/api-service";

interface ApiKeyConfig {
  name: string;
  provider: string;
  placeholder: string;
  pattern: RegExp;
  testEndpoint: string;
  required: boolean;
  description: string;
}

const apiKeyConfigs: ApiKeyConfig[] = [
  {
    name: "OPENROUTER_API_KEY",
    provider: "OpenRouter",
    placeholder: "sk-or-v1-...",
    pattern: /^sk-or-v1-[a-zA-Z0-9]{64,}$/,
    testEndpoint: "https://openrouter.ai/api/v1/models",
    required: true,
    description: "Access 100+ models through unified OpenAI-compatible API"
  },
  {
    name: "DEEPSEEK_API_KEY",
    provider: "DeepSeek",
    placeholder: "sk-...",
    pattern: /^sk-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.deepseek.com/v1/models",
    required: true,
    description: "DeepSeek R1, V3, and specialized reasoning models"
  },
  {
    name: "XAI_API_KEY",
    provider: "xAI",
    placeholder: "xai-...",
    pattern: /^xai-[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.x.ai/v1/models",
    required: true,
    description: "Grok-4, Grok-Code-Fast, and real-time reasoning"
  },
  {
    name: "NVIDIA_NIM_API_KEY",
    provider: "NVIDIA",
    placeholder: "nvapi-...",
    pattern: /^nvapi-[a-zA-Z0-9-_]{32,}$/,
    testEndpoint: "https://integrate.api.nvidia.com/v1/models",
    required: false,
    description: "Nemotron models and NVIDIA accelerated inference"
  },
  {
    name: "OPENAI_API_KEY",
    provider: "OpenAI",
    placeholder: "sk-proj-...",
    pattern: /^sk-(proj-)?[a-zA-Z0-9]{32,}$/,
    testEndpoint: "https://api.openai.com/v1/models",
    required: false,
    description: "GPT-4, GPT-3.5, and embeddings (can route via OpenRouter)"
  },
  {
    name: "ANTHROPIC_API_KEY",
    provider: "Anthropic",
    placeholder: "sk-ant-...",
    pattern: /^sk-ant-[a-zA-Z0-9-_]{32,}$/,
    testEndpoint: "https://api.anthropic.com/v1/models",
    required: false,
    description: "Claude 3 models (can route via OpenRouter)"
  }
];

type ValidationStatus = "idle" | "validating" | "valid" | "invalid" | "error";

interface KeyValidation {
  status: ValidationStatus;
  message: string;
  latency?: number;
  details?: string;
}

export function ApiKeyValidator() {
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>("api-keys-temp", {});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validations, setValidations] = useState<Record<string, KeyValidation>>({});
  const [isValidatingAll, setIsValidatingAll] = useState(false);

  const updateApiKey = (name: string, value: string) => {
    setApiKeys((current) => ({
      ...current,
      [name]: value
    }));
    
    setValidations((current) => ({
      ...current,
      [name]: { status: "idle", message: "" }
    }));
  };

  const toggleKeyVisibility = (name: string) => {
    setShowKeys((current) => ({
      ...current,
      [name]: !current[name]
    }));
  };

  const validateKeyFormat = (config: ApiKeyConfig, key: string): boolean => {
    return config.pattern.test(key);
  };

  const validateSingleKey = async (config: ApiKeyConfig) => {
    const key = apiKeys?.[config.name];
    
    if (!key) {
      setValidations((current) => ({
        ...current,
        [config.name]: {
          status: "idle",
          message: config.required ? "Required field" : "Optional"
        }
      }));
      return;
    }

    if (!validateKeyFormat(config, key)) {
      setValidations((current) => ({
        ...current,
        [config.name]: {
          status: "invalid",
          message: "Invalid key format",
          details: `Expected format: ${config.placeholder}`
        }
      }));
      toast.error(`${config.provider}: Invalid key format`);
      return;
    }

    setValidations((current) => ({
      ...current,
      [config.name]: {
        status: "validating",
        message: "Testing connection..."
      }
    }));

    try {
      const providerKey = config.provider.toLowerCase().replace(/\s+/g, "");
      const result = await validateApiKey(providerKey, key);

      if (result.success) {
        const modelInfo = result.details?.modelCount 
          ? ` (${result.details.modelCount} models available)` 
          : "";
        
        setValidations((current) => ({
          ...current,
          [config.name]: {
            status: "valid",
            message: "Key validated successfully",
            latency: result.latency,
            details: `Connection established, ready for inference${modelInfo}`
          }
        }));
        toast.success(`${config.provider}: Key validated (${result.latency}ms)`);
      } else {
        setValidations((current) => ({
          ...current,
          [config.name]: {
            status: "error",
            message: result.message,
            latency: result.latency,
            details: result.details?.error || "Authentication failed"
          }
        }));
        toast.error(`${config.provider}: ${result.message}`);
      }
    } catch (error) {
      setValidations((current) => ({
        ...current,
        [config.name]: {
          status: "error",
          message: "Connection failed",
          details: error instanceof Error ? error.message : "Unknown error"
        }
      }));
      toast.error(`${config.provider}: Connection error`);
    }
  };

  const validateAllKeys = async () => {
    setIsValidatingAll(true);
    
    for (const config of apiKeyConfigs) {
      if (apiKeys?.[config.name]) {
        await validateSingleKey(config);
      }
    }
    
    setIsValidatingAll(false);
    
    const validCount = Object.values(validations).filter(v => v.status === "valid").length;
    const totalConfigured = Object.keys(apiKeys || {}).filter(k => apiKeys?.[k]).length;
    
    toast.success(`Validation complete: ${validCount}/${totalConfigured} keys valid`);
  };

  const clearAllKeys = () => {
    setApiKeys({});
    setValidations({});
    setShowKeys({});
    toast.info("All API keys cleared");
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "valid":
        return <CheckCircle size={20} weight="fill" className="text-green-500" />;
      case "invalid":
      case "error":
        return <XCircle size={20} weight="fill" className="text-destructive" />;
      case "validating":
        return <Lightning size={20} weight="fill" className="text-accent animate-pulse" />;
      default:
        return <Key size={20} className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (config: ApiKeyConfig, validation?: KeyValidation) => {
    if (!validation || validation.status === "idle") {
      return config.required ? (
        <Badge variant="destructive" className="text-xs">Required</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Optional</Badge>
      );
    }

    switch (validation.status) {
      case "valid":
        return <Badge variant="default" className="text-xs bg-green-500">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive" className="text-xs">Invalid Format</Badge>;
      case "error":
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case "validating":
        return <Badge variant="outline" className="text-xs">Testing...</Badge>;
      default:
        return null;
    }
  };

  const configuredCount = Object.keys(apiKeys || {}).filter(k => apiKeys?.[k]).length;
  const validCount = Object.values(validations).filter(v => v.status === "valid").length;
  const requiredCount = apiKeyConfigs.filter(c => c.required).length;
  const requiredValid = apiKeyConfigs.filter(c => 
    c.required && validations[c.name]?.status === "valid"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Key size={24} weight="duotone" className="text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{configuredCount}/6</div>
              <div className="text-xs text-muted-foreground">Keys Configured</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle size={24} weight="duotone" className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{validCount}/{configuredCount}</div>
              <div className="text-xs text-muted-foreground">Validated</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <ShieldCheck size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{requiredValid}/{requiredCount}</div>
              <div className="text-xs text-muted-foreground">Required Valid</div>
            </div>
          </div>
        </Card>
      </div>

      {requiredValid < requiredCount && configuredCount > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Warning size={20} className="text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> {requiredCount - requiredValid} required API key(s) not validated. 
            Configure and validate all required keys for full platform functionality.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {apiKeyConfigs.map((config) => {
          const validation = validations[config.name];
          const keyValue = apiKeys?.[config.name] || "";
          const isVisible = showKeys[config.name];

          return (
            <Card key={config.name} className="p-5 bg-card/50 border-border hover:border-accent/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-mono text-sm font-semibold">
                        {config.name}
                      </Label>
                      {getStatusBadge(config, validation)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {config.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {config.provider}
                    </Badge>
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
                        onChange={(e) => updateApiKey(config.name, e.target.value)}
                        placeholder={config.placeholder}
                        className="font-mono text-sm pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility(config.name)}
                      >
                        {isVisible ? (
                          <EyeSlash size={16} className="text-muted-foreground" />
                        ) : (
                          <Eye size={16} className="text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => validateSingleKey(config)}
                      disabled={!keyValue || validation?.status === "validating"}
                      className="gap-2"
                    >
                      <Lightning size={16} weight="fill" />
                      Test
                    </Button>
                  </div>

                  {validation && validation.status !== "idle" && (
                    <div className={`p-3 rounded-lg border text-xs ${
                      validation.status === "valid" 
                        ? "bg-green-500/10 border-green-500/30 text-green-500" 
                        : validation.status === "validating"
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{validation.message}</span>
                        {validation.latency && (
                          <span className="font-mono">{validation.latency}ms</span>
                        )}
                      </div>
                      {validation.details && (
                        <div className="text-xs opacity-80">{validation.details}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={validateAllKeys}
          disabled={configuredCount === 0 || isValidatingAll}
          className="gap-2 flex-1"
          size="lg"
        >
          <Lightning size={20} weight="fill" />
          {isValidatingAll ? "Validating All Keys..." : `Validate All Keys (${configuredCount})`}
        </Button>
        <Button
          variant="outline"
          onClick={clearAllKeys}
          disabled={configuredCount === 0}
          size="lg"
        >
          Clear All
        </Button>
      </div>

      <Alert className="border-primary/30 bg-primary/5">
        <ShieldCheck size={20} className="text-primary" />
        <AlertDescription className="text-sm">
          <strong>Real API Testing:</strong> This validator makes actual API calls to verify your keys. 
          Keys are stored locally in your browser and never sent to third parties. Due to CORS restrictions, 
          some providers may require a backend proxy for validation. For production, implement server-side validation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
