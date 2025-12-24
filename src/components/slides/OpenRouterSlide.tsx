import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowsLeftRight, Lightning, Funnel } from "@phosphor-icons/react";

export function OpenRouterSlide() {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Platform Analysis
        </p>
        <h2 className="text-4xl font-bold">
          OpenRouter Platform: Intelligent Model Routing
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6 flex-1">
        <div className="col-span-2">
          <Card className="p-6 border-l-4 border-accent bg-card/50 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <ArrowsLeftRight className="text-accent" size={28} weight="duotone" />
              <h3 className="text-2xl font-bold">Unified API Architecture</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              OpenRouter provides{" "}
              <span className="text-accent font-semibold">fully OpenAI-compatible API</span>{" "}
              access to 400+ models across 60+ providers through a single endpoint. Developers
              save immense time with only{" "}
              <span className="text-accent font-semibold">two lines of code changes</span>{" "}
              required to migrate existing applications.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The platform normalizes request/response schemas, eliminating the need to learn
              different APIs.{" "}
              <span className="text-accent font-semibold">Server-Sent Events (SSE)</span> enable
              streaming for all models, with automatic fallback to working alternatives on 5xx
              responses or rate limits.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="bg-accent/10 p-6 rounded-lg border border-accent text-center">
            <div className="text-5xl font-bold text-accent font-mono mb-2">400+</div>
            <div className="text-sm text-muted-foreground">Available Models</div>
          </div>
          <div className="bg-accent/10 p-6 rounded-lg border border-accent text-center">
            <div className="text-5xl font-bold text-accent font-mono mb-2">60+</div>
            <div className="text-sm text-muted-foreground">AI Providers</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <Lightning className="text-accent" size={24} weight="duotone" />
            <h3 className="text-xl font-bold">Intelligent Routing Mechanisms</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Lightning className="text-accent mt-1" size={20} weight="fill" />
              <div>
                <div className="font-bold">:nitro Suffix</div>
                <div className="text-sm text-muted-foreground">
                  Routes to highest throughput provider for fastest response times
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lightning className="text-accent mt-1" size={20} weight="fill" />
              <div>
                <div className="font-bold">:floor Suffix</div>
                <div className="text-sm text-muted-foreground">
                  Routes to lowest price provider for cost optimization
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lightning className="text-accent mt-1" size={20} weight="fill" />
              <div>
                <div className="font-bold">Auto-Routing</div>
                <div className="text-sm text-muted-foreground">
                  Automatically selects optimal model based on performance and cost
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <Funnel className="text-accent" size={24} weight="duotone" />
            <h3 className="text-xl font-bold">Provider Routing Control</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Fine-grained control over model providers through the{" "}
            <span className="text-accent font-semibold">provider object</span> enables
            strategic routing decisions:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>
                <strong className="text-accent">order:</strong> Specify attempt sequence
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>
                <strong className="text-accent">sort:</strong> Sort by price or throughput
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>
                <strong className="text-accent">max_price:</strong> Set cost upper limits
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>
                <strong className="text-accent">ignore:</strong> Exclude underperforming
                providers
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <Badge variant="outline" className="font-mono">
          openrouter.ai/api/v1
        </Badge>
        <Badge variant="outline" className="font-mono">
          OpenAI SDK Compatible
        </Badge>
        <Badge variant="outline" className="font-mono">
          Supports Text, Images, PDFs
        </Badge>
      </div>
    </div>
  );
}
