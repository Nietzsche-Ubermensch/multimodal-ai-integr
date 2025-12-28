import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ChatCircle, Code, Eye, Cube, Lightning } from "@phosphor-icons/react";

interface ModelCard {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  pricing: { input: string; output: string };
  capabilities: string[];
  bestFor: string[];
  icon: typeof Brain;
}

const MODELS: ModelCard[] = [
  {
    id: "grok-4-1-fast-reasoning",
    name: "Grok 4.1 Fast (Reasoning)",
    provider: "xAI",
    contextWindow: "2M tokens",
    pricing: { input: "$0.20/1M", output: "$1.00/1M" },
    capabilities: ["Reasoning", "Function Calling", "Vision", "Audio", "Web Search"],
    bestFor: ["Complex analysis", "Multi-step reasoning", "Research tasks"],
    icon: Brain
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextWindow: "200K tokens",
    pricing: { input: "$3.00/1M", output: "$15.00/1M" },
    capabilities: ["Function Calling", "Vision", "Structured Output"],
    bestFor: ["Balanced performance", "Code generation", "Analysis"],
    icon: ChatCircle
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat v3",
    provider: "DeepSeek",
    contextWindow: "64K tokens",
    pricing: { input: "$0.14/1M", output: "$0.28/1M" },
    capabilities: ["Function Calling", "Code Generation"],
    bestFor: ["Cost-effective chat", "General tasks"],
    icon: Code
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: "128K tokens",
    pricing: { input: "$10.00/1M", output: "$30.00/1M" },
    capabilities: ["Function Calling", "Vision", "JSON Mode"],
    bestFor: ["Production applications", "Complex reasoning"],
    icon: Lightning
  },
  {
    id: "meta-llama-3-70b",
    name: "Llama 3 70B Instruct",
    provider: "OpenRouter",
    contextWindow: "8K tokens",
    pricing: { input: "$0.59/1M", output: "$0.79/1M" },
    capabilities: ["Function Calling", "Open Source"],
    bestFor: ["Cost optimization", "High throughput"],
    icon: Cube
  },
  {
    id: "grok-2-vision",
    name: "Grok 2 Vision",
    provider: "xAI",
    contextWindow: "32K tokens",
    pricing: { input: "$2.00/1M", output: "$10.00/1M" },
    capabilities: ["Vision", "Image Understanding"],
    bestFor: ["Image analysis", "Visual QA"],
    icon: Eye
  }
];

export function ModelExplorer() {
  return (
    <div className="space-y-6">
      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-4">Model Explorer</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Browse available models with detailed specifications. Click "Test Model" to start experimenting.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODELS.map((model) => {
          const Icon = model.icon;
          return (
            <Card
              key={model.id}
              className="p-6 border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{model.provider}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Context:</span>
                  <span className="font-mono font-semibold">{model.contextWindow}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pricing:</span>
                  <div className="text-right font-mono">
                    <div className="text-xs text-success">{model.pricing.input} in</div>
                    <div className="text-xs text-warning">{model.pricing.output} out</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Capabilities:</p>
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Best for:</p>
                <ul className="text-xs space-y-1">
                  {model.bestFor.map((use, i) => (
                    <li key={i} className="text-muted-foreground">• {use}</li>
                  ))}
                </ul>
              </div>

              <Button className="w-full" variant="outline">
                Test Model
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
