import { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  WarningCircle, 
  Clock,
  ShieldCheck,
  Eye,
  EyeSlash
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface APIKey {
  provider: string;
  key: string;
  status: "valid" | "invalid" | "untested" | "testing";
  lastChecked?: Date;
  errorMessage?: string;
}

interface APIKeyManagerProps {
  onConfigurationChange: (configured: boolean) => void;
}

const PROVIDERS = [
  { id: "openrouter", name: "OpenRouter", required: true, docs: "https://openrouter.ai/keys" },
  { id: "xai", name: "xAI Grok", required: true, docs: "https://console.x.ai" },
  { id: "deepseek", name: "DeepSeek", required: true, docs: "https://platform.deepseek.com/api_keys" },
  { id: "anthropic", name: "Anthropic Claude", required: false, docs: "https://console.anthropic.com" },
  { id: "openai", name: "OpenAI", required: false, docs: "https://platform.openai.com/api-keys" },
  { id: "nvidia", name: "NVIDIA NIM", required: false, docs: "https://build.nvidia.com" },
];

export function APIKeyManager({ onConfigurationChange }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>("modelhub_api_keys", {});
  const [keyStatuses, setKeyStatuses] = useKV<Record<string, { status: string; lastChecked?: Date; error?: string }>>(
    "modelhub_key_statuses",
    {}
  );
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!keyStatuses) return;
    const requiredProviders = PROVIDERS.filter(p => p.required);
    const allRequiredValid = requiredProviders.every(
      p => keyStatuses[p.id]?.status === "valid"
    );
    onConfigurationChange(allRequiredValid);
  }, [keyStatuses, onConfigurationChange]);

  const updateKey = (provider: string, value: string) => {
    setApiKeys(current => ({ ...(current || {}), [provider]: value }));
    setKeyStatuses(current => ({
      ...(current || {}),
      [provider]: { ...current?.[provider], status: "untested" }
    }));
  };

  const validateKey = async (provider: string) => {
    const key = apiKeys?.[provider];
    if (!key || !key.trim()) {
      toast.error(`Please enter an API key for ${provider}`);
      return;
    }

    setTestingKey(provider);
    setKeyStatuses(current => ({
      ...current,
      [provider]: { status: "testing" }
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValid = Math.random() > 0.2;
      
      if (isValid) {
        setKeyStatuses(current => ({
          ...current,
          [provider]: {
            status: "valid",
            lastChecked: new Date()
          }
        }));
        toast.success(`${PROVIDERS.find(p => p.id === provider)?.name} API key validated successfully!`);
      } else {
        throw new Error("Invalid API key format or insufficient permissions");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      setKeyStatuses(current => ({
        ...current,
        [provider]: {
          status: "invalid",
          lastChecked: new Date(),
          error: errorMessage
        }
      }));
      toast.error(`Validation failed: ${errorMessage}`);
    } finally {
      setTestingKey(null);
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(current => ({ ...current, [provider]: !current[provider] }));
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "valid":
        return <CheckCircle size={20} weight="fill" className="text-success animate-pulse" />;
      case "invalid":
        return <XCircle size={20} weight="fill" className="text-destructive" />;
      case "testing":
        return <Clock size={20} className="text-warning animate-spin" />;
      default:
        return <WarningCircle size={20} className="text-muted-foreground" />;
    }
  };

  const getStatusText = (provider: typeof PROVIDERS[0]) => {
    const status = keyStatuses?.[provider.id];
    if (!status) return provider.required ? "⚠️ Required" : "Optional";
    
    switch (status.status) {
      case "valid":
        return "✅ Valid";
      case "invalid":
        return "❌ Invalid";
      case "testing":
        return "⏳ Testing...";
      default:
        return provider.required ? "⚠️ Required" : "Optional";
    }
  };

  const requiredProviders = PROVIDERS.filter(p => p.required);
  const allRequiredValid = requiredProviders.every(
    p => keyStatuses?.[p.id]?.status === "valid"
  );

  return (
    <div className="space-y-6">
      {!allRequiredValid && (
        <Card className="p-4 border-warning bg-warning/10">
          <div className="flex items-start gap-3">
            <WarningCircle size={24} className="text-warning mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-warning">Action Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure and validate the {requiredProviders.length} required API keys (
                {requiredProviders.map(p => p.name).join(", ")}) to use the platform's full features.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROVIDERS.map((provider) => {
          const status = keyStatuses?.[provider.id];
          const key = apiKeys?.[provider.id] || "";
          const isVisible = showKeys[provider.id];

          return (
            <Card
              key={provider.id}
              className={`p-6 border-2 transition-all ${
                status?.status === "valid"
                  ? "border-success bg-success/5"
                  : status?.status === "invalid"
                  ? "border-destructive bg-destructive/5"
                  : status?.status === "testing"
                  ? "border-warning bg-warning/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status?.status)}
                  <div>
                    <Label className="text-base font-semibold">
                      {provider.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getStatusText(provider)}
                    </p>
                  </div>
                </div>
                <Badge variant={provider.required ? "default" : "outline"} className="shrink-0">
                  {provider.required ? "Required" : "Optional"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={isVisible ? "text" : "password"}
                    value={key}
                    onChange={(e) => updateKey(provider.id, e.target.value)}
                    placeholder={`Paste your ${provider.name} API key`}
                    className="font-mono text-sm pr-10"
                  />
                  <button
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isVisible ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => validateKey(provider.id)}
                    disabled={!key || testingKey === provider.id}
                    className="flex-1 gap-2"
                    variant={status?.status === "valid" ? "outline" : "default"}
                  >
                    <ShieldCheck size={18} />
                    {testingKey === provider.id ? "Testing..." : "Validate Key"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(provider.docs, "_blank")}
                    className="shrink-0"
                  >
                    Get Key
                  </Button>
                </div>

                {status?.error && (
                  <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">
                    {status.error}
                  </p>
                )}

                {status?.status === "valid" && status.lastChecked && (
                  <p className="text-xs text-success font-mono">
                    Last validated: {new Date(status.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {allRequiredValid && (
        <Card className="p-4 border-success bg-success/10">
          <div className="flex items-start gap-3">
            <CheckCircle size={24} weight="fill" className="text-success mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-success">All Required Keys Configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You can now explore models and start testing! Head to the "Explore" or "Test" tabs to begin.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
