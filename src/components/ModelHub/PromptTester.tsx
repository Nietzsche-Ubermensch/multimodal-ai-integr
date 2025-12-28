import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaperPlaneRight, FloppyDisk } from "@phosphor-icons/react";

interface PromptTesterProps {
  apiKeysConfigured: boolean;
}

export function PromptTester({ apiKeysConfigured }: PromptTesterProps) {
  return (
    <div className="space-y-6">
      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-4">Prompt Tester</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Test prompts against individual models and view detailed response metadata.
        </p>

        {!apiKeysConfigured && (
          <div className="bg-warning/10 border border-warning p-4 rounded-lg mb-6">
            <p className="text-sm text-warning">
              ⚠️ Please configure your API keys in the "API Config" tab to use the prompt tester.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Select Model</label>
            <Select disabled={!apiKeysConfigured}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grok-4">Grok 4.1 Fast (Reasoning)</SelectItem>
                <SelectItem value="claude">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="deepseek">DeepSeek Chat v3</SelectItem>
                <SelectItem value="gpt4">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Temperature</label>
            <Select defaultValue="0.7" disabled={!apiKeysConfigured}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.0">0.0 (Deterministic)</SelectItem>
                <SelectItem value="0.7">0.7 (Balanced)</SelectItem>
                <SelectItem value="1.0">1.0 (Creative)</SelectItem>
                <SelectItem value="1.5">1.5 (Very Creative)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Prompt</label>
            <Textarea
              placeholder="Enter your prompt here... (Cmd/Ctrl+Enter to send)"
              className="min-h-[200px] font-mono resize-none"
              disabled={!apiKeysConfigured}
            />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" disabled={!apiKeysConfigured}>
              <PaperPlaneRight size={18} />
              Send Prompt
            </Button>
            <Button variant="outline" className="gap-2" disabled={!apiKeysConfigured}>
              <FloppyDisk size={18} />
              Save Prompt
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-4">Response</h3>
        <div className="min-h-[300px] bg-muted/20 rounded-lg p-6 font-mono text-sm">
          <p className="text-muted-foreground italic">
            Response will appear here after sending a prompt...
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Token Count</p>
            <p className="text-2xl font-bold font-mono">-</p>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Latency</p>
            <p className="text-2xl font-bold font-mono">-</p>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg">
            <p className="text-muted-foreground mb-1">Est. Cost</p>
            <p className="text-2xl font-bold font-mono">-</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
