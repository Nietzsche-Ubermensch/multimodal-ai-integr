import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Warning,
  Lightning,
  ArrowsClockwise,
  ChartLine,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { validateApiKey, getProviderStatus } from "@/lib/api-service";

interface ProviderConfig {
  id: string;
  name: string;
  description: string;
  keyName: string;
  required: boolean;
}

const providers: ProviderConfig[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified gateway to 100+ models",
    keyName: "OPENROUTER_API_KEY",
    required: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "R1 reasoning and V3 chat models",
    keyName: "DEEPSEEK_API_KEY",
    required: true,
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok-4 and code-fast models",
    keyName: "XAI_API_KEY",
    required: true,
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "Accelerated inference platform",
    keyName: "NVIDIA_NIM_API_KEY",
    required: false,
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4 and embeddings",
    keyName: "OPENAI_API_KEY",
    required: false,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3 model family",
    keyName: "ANTHROPIC_API_KEY",
    required: false,
  },
];

interface ProviderStatus {
  provider: string;
  status: "online" | "offline" | "checking" | "unknown";
  latency?: number;
  lastChecked?: number;
  message?: string;
}

export function ApiStatusDashboard() {
  const [apiKeys] = useKV<Record<string, string>>("api-keys-temp", {});
  const [statuses, setStatuses] = useState<Record<string, ProviderStatus>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const checkProviderStatus = async (provider: ProviderConfig) => {
    const apiKey = apiKeys?.[provider.keyName];
    
    if (!apiKey) {
      setStatuses((prev) => ({
        ...prev,
        [provider.id]: {
          provider: provider.id,
          status: "unknown",
          message: "No API key configured",
        },
      }));
      return;
    }

    setStatuses((prev) => ({
      ...prev,
      [provider.id]: {
        provider: provider.id,
        status: "checking",
        message: "Checking connectivity...",
      },
    }));

    try {
      const result = await validateApiKey(provider.id, apiKey);
      
      setStatuses((prev) => ({
        ...prev,
        [provider.id]: {
          provider: provider.id,
          status: result.success ? "online" : "offline",
          latency: result.latency,
          lastChecked: Date.now(),
          message: result.success 
            ? `Connected (${result.details?.modelCount || 0} models)` 
            : result.message,
        },
      }));
    } catch (error) {
      setStatuses((prev) => ({
        ...prev,
        [provider.id]: {
          provider: provider.id,
          status: "offline",
          lastChecked: Date.now(),
          message: error instanceof Error ? error.message : "Connection failed",
        },
      }));
    }
  };

  const checkAllStatuses = async () => {
    setIsRefreshing(true);
    
    for (const provider of providers) {
      await checkProviderStatus(provider);
    }
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkAllStatuses();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkAllStatuses();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: ProviderStatus["status"]) => {
    switch (status) {
      case "online":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "offline":
        return "text-destructive bg-destructive/10 border-destructive/30";
      case "checking":
        return "text-accent bg-accent/10 border-accent/30";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/30";
    }
  };

  const getStatusIcon = (status: ProviderStatus["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle size={20} weight="fill" className="text-green-500" />;
      case "offline":
        return <XCircle size={20} weight="fill" className="text-destructive" />;
      case "checking":
        return <Lightning size={20} weight="fill" className="text-accent animate-pulse" />;
      default:
        return <Warning size={20} className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProviderStatus["status"]) => {
    const labels = {
      online: "Online",
      offline: "Offline",
      checking: "Checking...",
      unknown: "Unknown",
    };

    const variants = {
      online: "default" as const,
      offline: "destructive" as const,
      checking: "outline" as const,
      unknown: "secondary" as const,
    };

    return (
      <Badge variant={variants[status]} className="text-xs font-mono">
        {labels[status]}
      </Badge>
    );
  };

  const onlineCount = Object.values(statuses).filter((s) => s.status === "online").length;
  const configuredCount = providers.filter((p) => apiKeys?.[p.keyName]).length;
  const requiredCount = providers.filter((p) => p.required).length;
  const requiredOnline = providers.filter(
    (p) => p.required && statuses[p.id]?.status === "online"
  ).length;

  const avgLatency = Object.values(statuses)
    .filter((s) => s.status === "online" && s.latency)
    .reduce((sum, s) => sum + (s.latency || 0), 0) / (onlineCount || 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <ChartLine size={24} weight="duotone" className="text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">
                {onlineCount}/{configuredCount}
              </div>
              <div className="text-xs text-muted-foreground">Providers Online</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle size={24} weight="duotone" className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">
                {requiredOnline}/{requiredCount}
              </div>
              <div className="text-xs text-muted-foreground">Required Online</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Lightning size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">
                {Math.round(avgLatency)}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <ArrowsClockwise size={24} weight="duotone" className="text-foreground" />
            </div>
            <div className="flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={checkAllStatuses}
                disabled={isRefreshing}
                className="w-full gap-2"
              >
                <ArrowsClockwise
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const status = statuses[provider.id];
          const apiKey = apiKeys?.[provider.keyName];
          const hasKey = !!apiKey;

          return (
            <Card
              key={provider.id}
              className={`p-5 border-2 transition-all ${
                status?.status === "online"
                  ? "border-green-500/30 bg-green-500/5"
                  : status?.status === "offline"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{provider.name}</h3>
                      {provider.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {provider.description}
                    </p>
                    {getStatusBadge(status?.status || "unknown")}
                  </div>
                  <div className="ml-3">{getStatusIcon(status?.status || "unknown")}</div>
                </div>

                {!hasKey ? (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground">
                      No API key configured. Add one in the Security tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {status?.latency !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Latency</span>
                          <span className="font-mono font-semibold">
                            {status.latency}ms
                          </span>
                        </div>
                        <Progress
                          value={Math.min((status.latency / 2000) * 100, 100)}
                          className="h-1"
                        />
                      </div>
                    )}

                    {status?.message && (
                      <div
                        className={`p-3 rounded-lg border text-xs ${getStatusColor(
                          status.status
                        )}`}
                      >
                        {status.message}
                      </div>
                    )}

                    {status?.lastChecked && (
                      <div className="text-xs text-muted-foreground">
                        Last checked:{" "}
                        {new Date(status.lastChecked).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Auto-Refresh Status</h3>
            <p className="text-xs text-muted-foreground">
              Automatically check provider status every 30 seconds
            </p>
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <ArrowsClockwise size={16} className={autoRefresh ? "animate-spin" : ""} />
            {autoRefresh ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
