import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, ShieldCheck, ChartBar } from "@phosphor-icons/react";

export function DeepseekPlatformSlide() {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Platform Analysis
        </p>
        <h2 className="text-4xl font-bold">
          Deepseek Platform: Core Architecture & Capabilities
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        <div className="col-span-2 space-y-6">
          <Card className="p-6 border-l-4 border-accent bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="text-accent" size={28} weight="duotone" />
              <h3 className="text-2xl font-bold">Mixture-of-Experts Architecture</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Deepseek implements a sophisticated{" "}
              <span className="text-accent font-semibold">MoE architecture</span> with 37
              billion activated parameters from a total of 671B parameters. This design
              selectively engages specialized expert networks based on input characteristics,
              achieving 40% faster implementation times and 78% increase in first-time
              successful integrations.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-accent font-mono mb-1">37B</div>
                <div className="text-sm text-muted-foreground">Activated Params</div>
              </div>
              <div className="bg-background p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-accent font-mono mb-1">671B</div>
                <div className="text-sm text-muted-foreground">Total Params</div>
              </div>
              <div className="bg-background p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-accent font-mono mb-1">164K</div>
                <div className="text-sm text-muted-foreground">Context Length</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-accent bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-accent" size={28} weight="duotone" />
              <h3 className="text-2xl font-bold">Enterprise-Grade Security</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The platform maintains{" "}
              <span className="text-accent font-semibold">99.9% uptime</span> with 4-hour
              technical support response times. Authentication protocols utilize{" "}
              <span className="text-accent font-semibold">256-bit encryption</span>{" "}
              standards, ensuring enterprise-grade security across all interactions.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-accent" size={20} weight="fill" />
                <span className="text-sm">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-accent" size={20} weight="fill" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-accent" size={20} weight="fill" />
                <span className="text-sm">4hr Response</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-accent bg-card/50">
            <h3 className="text-xl font-bold mb-4">Multimodal AI Models</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              <span className="text-accent font-semibold">Janus-Pro</span> combines visual
              and language processing using a unified architecture. It achieves{" "}
              <span className="text-accent font-semibold">84%+ accuracy</span> on
              benchmarks, outperforming DALL-E 3.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-accent font-semibold">DeepSeek-OCR</span> uses visual
              perception as a compression medium, achieving{" "}
              <span className="text-accent font-semibold">7-20x token reduction</span> for
              complex document processing.
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-accent bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <ChartBar className="text-accent" size={24} weight="duotone" />
              <h3 className="text-xl font-bold">API Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Daily API Calls</span>
                <span className="text-xl font-bold text-accent font-mono">1.2M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Implementation Speed</span>
                <span className="text-xl font-bold text-accent font-mono">35% Faster</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Documentation</span>
                <span className="text-xl font-bold text-accent font-mono">127+ Examples</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-border pt-4">
        <Badge variant="outline" className="font-mono">
          platform.deepseek.com
        </Badge>
        <Badge variant="outline" className="font-mono">
          MIT License
        </Badge>
        <Badge variant="outline" className="font-mono">
          15 Implementation Scenarios
        </Badge>
      </div>
    </div>
  );
}
