import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lightning, ChartLine, Wrench } from "@phosphor-icons/react";

export function BestPracticesSlide() {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Integration Best Practices
        </p>
        <h2 className="text-4xl font-bold">
          Performance, Security & Scalability
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-accent" size={28} weight="duotone" />
            <h3 className="text-2xl font-bold">Security Framework</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-accent mb-2">API Key Management</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Never hardcode API keys in source code
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Use environment variables for deployment
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement regular key rotation policies
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-2">Communication Security</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Enforce TLS 1.3 encryption for all API calls
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement certificate pinning for mobile apps
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Use OAuth 2.0/JWT for authentication
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <Lightning className="text-accent" size={28} weight="duotone" />
            <h3 className="text-2xl font-bold">Performance Optimization</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-accent mb-2">Request Optimization</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Batch requests to amortize overhead
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement prompt compression for token savings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Use streaming for better UX on long responses
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-2">Temperature Guidelines</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">0.1 - 0.3</span>
                  <Badge variant="secondary" className="text-xs">Focused & Deterministic</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">0.4 - 0.7</span>
                  <Badge variant="secondary" className="text-xs">Balanced</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">0.8 - 1.2</span>
                  <Badge variant="secondary" className="text-xs">Creative</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <ChartLine className="text-accent" size={28} weight="duotone" />
            <h3 className="text-2xl font-bold">Scalability Architecture</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-accent mb-2">Load Balancing</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement horizontal auto-scaling
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Use health checks and circuit breakers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Deploy across multiple regions
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-2">Monitoring & Observability</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Track request latency and throughput
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Monitor token usage and costs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement comprehensive logging
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-accent bg-card/50">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="text-accent" size={28} weight="duotone" />
            <h3 className="text-2xl font-bold">Error Handling</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-accent mb-2">Retry Mechanisms</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement exponential backoff with jitter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Handle 5xx server errors gracefully
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Respect rate limits (429 responses)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-2">Fallback Strategies</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Use OpenRouter's automatic provider fallback
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Implement tiered routing (fast→capable)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  Cache responses for redundancy
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 bg-accent/10 border border-accent rounded-lg p-4 text-center">
        <p className="text-sm">
          <strong className="text-accent">Key Principle:</strong> Balance cost, performance,
          and reliability by selecting appropriate models and implementing robust error
          handling strategies.
        </p>
      </div>
    </div>
  );
}
