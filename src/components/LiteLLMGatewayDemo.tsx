import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Gauge,
  ShieldCheck, 
  ChartLine,
  Lightning,
  Database,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Money,
  Clock
} from "@phosphor-icons/react";
import { CodeBlock } from "./CodeBlock";

export function LiteLLMGatewayDemo() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const installCode = `# Clone LiteLLM Repository
gh repo clone BerriAI/litellm
cd litellm

# Install LiteLLM
pip install litellm[proxy]

# Or install with all extras
pip install 'litellm[extra]'

# Start the proxy server
litellm --config config.yaml`;

  const configCode = `# config.yaml - LiteLLM AI Gateway Configuration

model_list:
  # OpenRouter Models (100+ models via single provider)
  - model_name: claude-3.5-sonnet
    litellm_params:
      model: openrouter/anthropic/claude-3.5-sonnet
      api_key: os.environ/OPENROUTER_API_KEY
      
  - model_name: gpt-4
    litellm_params:
      model: openrouter/openai/gpt-4-turbo
      api_key: os.environ/OPENROUTER_API_KEY

  # DeepSeek Models (Cost-effective)
  - model_name: deepseek-chat
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
      
  - model_name: deepseek-r1
    litellm_params:
      model: deepseek/deepseek-r1
      api_key: os.environ/DEEPSEEK_API_KEY

  # NVIDIA NIM (Enterprise inference)
  - model_name: llama-3-70b
    litellm_params:
      model: nvidia_nim/meta/llama3-70b-instruct
      api_key: os.environ/NVIDIA_NIM_API_KEY

  # xAI Grok (Web search capable)
  - model_name: grok-4
    litellm_params:
      model: xai/grok-4
      api_key: os.environ/XAI_API_KEY

# General Settings
litellm_settings:
  drop_params: true
  set_verbose: true
  request_timeout: 600
  
# Load Balancing & Failover
router_settings:
  routing_strategy: latency-based-routing
  allowed_fails: 3
  cooldown_time: 30
  
# Caching with Redis
cache:
  type: redis
  host: localhost
  port: 6379
  ttl: 3600

# Cost Tracking
success_callback: ["langfuse"]
failure_callback: ["langfuse"]

# Rate Limiting
general_settings:
  master_key: your-secret-master-key
  database_url: postgresql://...
  
# Budget Alerts
budget_manager:
  - user_id: user-123
    budget_duration: 1d
    max_budget: 10.0`;

  const usageCode = `from litellm import completion
import os

# All provider keys loaded from environment
# OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, etc.

# Example 1: Use via model routing
response = completion(
    model="claude-3.5-sonnet",  # From config.yaml
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ]
)

# Example 2: Direct provider specification
response = completion(
    model="deepseek/deepseek-chat",
    messages=[
        {"role": "user", "content": "Write Python code for quicksort"}
    ]
)

# Example 3: Automatic fallback chain
response = completion(
    model="gpt-4",
    messages=[...],
    fallbacks=["claude-3.5-sonnet", "deepseek-chat"]
)

print(response.choices[0].message.content)`;

  const guardrailsCode = `# Guardrails Configuration in config.yaml

guardrails:
  # Input validation
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: presidio
      guardrail_config:
        mode: "all"
        entities:
          - "EMAIL_ADDRESS"
          - "PHONE_NUMBER"
          - "CREDIT_CARD"
          - "SSN"
          
  # Content moderation
  - guardrail_name: "content-safety"
    litellm_params:
      guardrail: llama_guard
      categories:
        - "violence"
        - "hate"
        - "self-harm"
        - "sexual"
        - "harassment"

  # Prompt injection detection
  - guardrail_name: "injection-detection"
    litellm_params:
      guardrail: lakera
      guardrail_config:
        api_key: os.environ/LAKERA_API_KEY

# Apply guardrails to specific models
model_list:
  - model_name: production-gpt4
    litellm_params:
      model: openrouter/openai/gpt-4
      guardrails: ["pii-detection", "content-safety", "injection-detection"]`;

  const monitoringCode = `# Logging & Observability Configuration

litellm_settings:
  success_callback: ["langfuse", "prometheus", "datadog"]
  failure_callback: ["langfuse", "sentry"]
  service_callback: ["prometheus"]

# Langfuse for LLM Observability
langfuse:
  public_key: os.environ/LANGFUSE_PUBLIC_KEY
  secret_key: os.environ/LANGFUSE_SECRET_KEY
  host: https://cloud.langfuse.com

# Prometheus metrics endpoint
prometheus:
  port: 9090
  path: /metrics

# Cost tracking by user/project
budget_manager:
  - user_id: team-engineering
    budget_duration: 30d
    max_budget: 1000.0
    
  - user_id: team-research  
    budget_duration: 30d
    max_budget: 500.0

# Alert webhooks
alerts:
  - alert_type: budget_crossed
    webhook_url: https://your-server.com/alerts
    
  - alert_type: failed_requests
    threshold: 10
    webhook_url: https://your-server.com/alerts`;

  const features = [
    {
      icon: <Gauge size={24} weight="duotone" />,
      title: "100+ LLM Models",
      description: "Unified interface to OpenAI, Anthropic, Google, AWS, Azure, HuggingFace, and 100+ models",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      metric: "100+",
      label: "Models"
    },
    {
      icon: <Lightning size={24} weight="duotone" />,
      title: "Load Balancing",
      description: "Latency-based routing, automatic failover, and retry logic across providers",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      metric: "99.9%",
      label: "Uptime"
    },
    {
      icon: <Database size={24} weight="duotone" />,
      title: "Smart Caching",
      description: "Redis-backed caching with configurable TTL saves costs and reduces latency",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      metric: "80%+",
      label: "Cache Hit"
    },
    {
      icon: <ShieldCheck size={24} weight="duotone" />,
      title: "Guardrails",
      description: "PII detection, content moderation, prompt injection prevention, and custom policies",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      metric: "Real-time",
      label: "Protection"
    },
    {
      icon: <ChartLine size={24} weight="duotone" />,
      title: "Observability",
      description: "Integrated logging, metrics, tracing with Langfuse, Prometheus, and Datadog",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      metric: "Full",
      label: "Visibility"
    },
    {
      icon: <Money size={24} weight="duotone" />,
      title: "Cost Tracking",
      description: "Per-user budgets, cost alerts, and detailed analytics across all providers",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      metric: "Real-time",
      label: "Tracking"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Gauge size={24} className="text-primary-foreground" weight="bold" />
            </div>
            <div>
              <CardTitle>LiteLLM AI Gateway</CardTitle>
              <CardDescription>
                Production-ready proxy for 100+ LLMs with load balancing, caching, and guardrails
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/50 bg-primary/10">
            <AlertDescription>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-primary mt-0.5" weight="fill" />
                <div>
                  <p className="font-medium mb-1">Complete AI Gateway Solution</p>
                  <p className="text-sm text-muted-foreground">
                    LiteLLM acts as a unified proxy layer managing authentication, routing, caching, guardrails, and monitoring for all your LLM providers.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <Card 
                key={idx}
                className={`cursor-pointer transition-all hover:scale-105 ${activeFeature === feature.title ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveFeature(feature.title)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className={`p-3 ${feature.bgColor} rounded-lg w-fit`}>
                      <div className={feature.color}>{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-2xl font-bold">{feature.metric}</span>
                      <span className="text-xs text-muted-foreground">{feature.label}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup & Configuration</CardTitle>
          <CardDescription>
            Complete guide to deploying LiteLLM as your AI Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="install">Install</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="install" className="space-y-4">
              <CodeBlock
                code={installCode}
                language="bash"
                title="install-litellm.sh"
              />
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Quick Start:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Clone the BerriAI/litellm repository</li>
                      <li>Install LiteLLM with proxy support</li>
                      <li>Configure your model routing in config.yaml</li>
                      <li>Start the proxy server on port 4000</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <CodeBlock
                code={configCode}
                language="yaml"
                title="config.yaml"
              />
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge className="mt-0.5">Model Routing</Badge>
                  <p className="text-sm text-muted-foreground">
                    Define friendly model names that map to provider-specific endpoints
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge className="mt-0.5">Fallback Chains</Badge>
                  <p className="text-sm text-muted-foreground">
                    Automatic failover to backup models if primary fails
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge className="mt-0.5">Load Balancing</Badge>
                  <p className="text-sm text-muted-foreground">
                    Latency-based routing distributes load across providers
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <CodeBlock
                code={usageCode}
                language="python"
                title="litellm_usage.py"
              />
            </TabsContent>

            <TabsContent value="guardrails" className="space-y-4">
              <CodeBlock
                code={guardrailsCode}
                language="yaml"
                title="guardrails-config.yaml"
              />
              <Alert className="border-purple-500/50 bg-purple-500/10">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Security Layers:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>PII Detection & Redaction (Presidio)</li>
                      <li>Content Safety (LlamaGuard)</li>
                      <li>Prompt Injection Prevention (Lakera Guard)</li>
                      <li>Custom Policy Enforcement</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <CodeBlock
                code={monitoringCode}
                language="yaml"
                title="monitoring-config.yaml"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Metrics Tracked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Request latency (p50, p95, p99)</li>
                      <li>• Token usage and costs</li>
                      <li>• Error rates by provider</li>
                      <li>• Cache hit rates</li>
                      <li>• Guardrail violations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Alert Triggers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Budget thresholds exceeded</li>
                      <li>• High error rates detected</li>
                      <li>• Latency SLA violations</li>
                      <li>• Guardrail policy breaches</li>
                      <li>• Provider outages</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
              <Card className="bg-primary/10 border-primary/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm font-semibold">Client App</p>
                  <p className="text-xs text-muted-foreground mt-1">Web/Mobile/API</p>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-center">
                <ArrowsClockwise size={20} className="text-muted-foreground" />
              </div>

              <Card className="bg-accent/10 border-accent/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm font-semibold">LiteLLM Gateway</p>
                  <p className="text-xs text-muted-foreground mt-1">Port 4000</p>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center">
                <ArrowsClockwise size={20} className="text-muted-foreground" />
              </div>

              <Card className="bg-green-500/10 border-green-500/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm font-semibold">LLM Providers</p>
                  <p className="text-xs text-muted-foreground mt-1">100+ Models</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Clock size={16} />
                  Request Processing
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>1. Authentication & rate limiting</li>
                  <li>2. Guardrails validation</li>
                  <li>3. Cache check (Redis)</li>
                  <li>4. Model routing & load balancing</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lightning size={16} />
                  Provider Execution
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>5. Forward to selected provider</li>
                  <li>6. Automatic retry on failure</li>
                  <li>7. Fallback to backup model</li>
                  <li>8. Response streaming</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ChartLine size={16} />
                  Post-Processing
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>9. Cache response (if applicable)</li>
                  <li>10. Cost tracking & logging</li>
                  <li>11. Metrics export</li>
                  <li>12. Response to client</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
