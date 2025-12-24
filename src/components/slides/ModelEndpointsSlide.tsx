import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Eye, FileText } from "@phosphor-icons/react";

export function ModelEndpointsSlide() {
  const models = [
    {
      name: "Grok-4 & Grok-4-Fast",
      provider: "xAI",
      context: "256K tokens",
      features: ["Text/Vision", "Function Calling", "Structured Outputs"],
      pricing: "Variable",
    },
    {
      name: "Deepseek-Chat-V3-0324",
      provider: "Deepseek",
      context: "164K tokens",
      features: ["MoE 37B", "Reasoning", "Code Generation"],
      pricing: "Free",
    },
    {
      name: "Llama-3.1-70B",
      provider: "Meta (via NVIDIA)",
      context: "128K tokens",
      features: ["Multilingual", "Long Context", "High Quality"],
      pricing: "$0.001/$0.001",
    },
    {
      name: "Gemini-Embedding-001",
      provider: "Google",
      context: "2048 tokens",
      features: ["100+ Languages", "MRL", "MTEB Leader"],
      pricing: "$0.15/1M",
    },
  ];

  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Model Specifications
        </p>
        <h2 className="text-4xl font-bold">
          Model Endpoints & Technical Specifications
        </h2>
      </div>

      <div className="space-y-4 flex-1 overflow-auto">
        {models.map((model, index) => (
          <Card
            key={index}
            className="p-6 border-l-4 border-accent bg-card/50 hover:bg-card transition-all"
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-3">
                <div className="flex items-center gap-3 mb-2">
                  {index === 0 && <Eye className="text-accent" size={24} weight="duotone" />}
                  {index === 1 && <FileText className="text-accent" size={24} weight="duotone" />}
                  {index === 2 && <Table className="text-accent" size={24} weight="duotone" />}
                  {index === 3 && <Table className="text-accent" size={24} weight="duotone" />}
                  <h3 className="text-xl font-bold">{model.name}</h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {model.provider}
                </Badge>
              </div>

              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Context Window</div>
                <div className="text-lg font-mono text-accent">{model.context}</div>
              </div>

              <div className="col-span-4">
                <div className="text-sm text-muted-foreground mb-2">Key Features</div>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="col-span-3 text-right">
                <div className="text-sm text-muted-foreground mb-1">Pricing</div>
                <div className="text-lg font-mono font-bold text-accent">
                  {model.pricing}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-accent/10 border border-accent rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Integration Quick Reference</h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-bold mb-2 text-accent">OpenRouter Access</div>
            <code className="block bg-background p-2 rounded font-mono text-xs">
              openrouter.ai/api/v1
            </code>
          </div>
          <div>
            <div className="font-bold mb-2 text-accent">NVIDIA NIM</div>
            <code className="block bg-background p-2 rounded font-mono text-xs">
              integrate.api.nvidia.com/v1
            </code>
          </div>
          <div>
            <div className="font-bold mb-2 text-accent">Deepseek Direct</div>
            <code className="block bg-background p-2 rounded font-mono text-xs">
              api.deepseek.com
            </code>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <Badge variant="outline" className="font-mono">
          13+ Models Documented
        </Badge>
        <Badge variant="outline" className="font-mono">
          Multiple Providers
        </Badge>
        <Badge variant="outline" className="font-mono">
          OpenAI Compatible
        </Badge>
      </div>
    </div>
  );
}
