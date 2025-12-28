import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PaperPlaneRight } from "@phosphor-icons/react";

interface ResponseComparisonProps {
  apiKeysConfigured: boolean;
}

const AVAILABLE_MODELS = [
  { id: "grok-4", name: "Grok 4.1 Fast", provider: "xAI" },
  { id: "claude", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "deepseek", name: "DeepSeek Chat v3", provider: "DeepSeek" },
  { id: "gpt4", name: "GPT-4 Turbo", provider: "OpenAI" }
];

export function ResponseComparison({ apiKeysConfigured }: ResponseComparisonProps) {
  return (
    <div className="space-y-6">
      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-4">Response Comparison</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Compare responses from multiple models side-by-side for the same prompt.
        </p>

        {!apiKeysConfigured && (
          <div className="bg-warning/10 border border-warning p-4 rounded-lg mb-6">
            <p className="text-sm text-warning">
              ⚠️ Please configure your API keys in the "API Config" tab to use the comparison feature.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Select Models to Compare (2-4)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AVAILABLE_MODELS.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox id={model.id} disabled={!apiKeysConfigured} />
                  <Label
                    htmlFor={model.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    <div className="font-semibold">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Shared Prompt</label>
            <Textarea
              placeholder="Enter a prompt to send to all selected models..."
              className="min-h-[150px] font-mono resize-none"
              disabled={!apiKeysConfigured}
            />
          </div>

          <Button className="w-full gap-2" size="lg" disabled={!apiKeysConfigured}>
            <PaperPlaneRight size={20} />
            Compare Responses
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold">Model {i}</h3>
              <p className="text-xs text-muted-foreground font-mono">Response will appear here</p>
            </div>
            <div className="min-h-[200px] bg-muted/20 rounded-lg p-4 font-mono text-sm">
              <p className="text-muted-foreground italic">
                Select models and send a prompt to compare...
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-muted/20 p-2 rounded">
                <p className="text-muted-foreground">Tokens</p>
                <p className="font-mono font-bold">-</p>
              </div>
              <div className="bg-muted/20 p-2 rounded">
                <p className="text-muted-foreground">Latency</p>
                <p className="font-mono font-bold">-</p>
              </div>
              <div className="bg-muted/20 p-2 rounded">
                <p className="text-muted-foreground">Cost</p>
                <p className="font-mono font-bold">-</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
