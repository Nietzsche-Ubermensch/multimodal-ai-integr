import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { Brain, Play, Copy, CheckCircle, XCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

export function AnthropicSDKDemo() {
  const [prompt, setPrompt] = useState("Explain the concept of neural attention mechanisms in 2-3 sentences.");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse("");

    try {
      if (useRealAPI) {
        toast.error("Real API integration requires backend setup with API keys");
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResponse(
        "Neural attention mechanisms allow models to dynamically focus on relevant parts of input sequences, " +
        "computing weighted representations based on learned importance scores. This enables transformers to " +
        "process long-range dependencies efficiently without sequential computation constraints."
      );
      
      toast.success("Response generated successfully");
    } catch (error) {
      toast.error("Failed to generate response");
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const installCode = `# Install Anthropic SDK
npm install @anthropic-ai/sdk

# Install AI SDK integration
npm install @ai-sdk/anthropic ai`;

  const basicUsage = `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
});

console.log(message.content);`;

  const streamingExample = `import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  messages: [
    { role: 'user', content: 'Write a poem about AI' }
  ],
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}`;

  const visionExample = `const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          type: 'text',
          text: 'Describe this image in detail'
        }
      ],
    },
  ],
});`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Brain className="text-accent" size={20} weight="bold" />
                </div>
                <div>
                  <CardTitle>Anthropic Claude SDK</CardTitle>
                  <CardDescription>Test Claude 3.5 Sonnet with real or simulated API</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="min-h-[100px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleTest}
                disabled={loading || !prompt}
                className="flex-1"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Play size={16} weight="fill" className="mr-2" />
                    Test Claude
                  </>
                )}
              </Button>
              
              <Button
                variant={useRealAPI ? "default" : "outline"}
                onClick={() => setUseRealAPI(!useRealAPI)}
                size="sm"
              >
                {useRealAPI ? <CheckCircle size={16} className="mr-2" /> : <XCircle size={16} className="mr-2" />}
                {useRealAPI ? "Real API" : "Simulated"}
              </Button>
            </div>

            {response && (
              <Alert>
                <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                  {response}
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-2 space-y-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="outline">claude-3-5-sonnet-20241022</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Context Window</span>
                <Badge variant="outline">200K tokens</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max Output</span>
                <Badge variant="outline">8K tokens</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Available Models</CardTitle>
            <CardDescription>Claude 3.5 family with vision capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Claude 3.5 Sonnet", id: "claude-3-5-sonnet-20241022", context: "200K", features: ["Vision", "Coding", "Analysis"] },
              { name: "Claude 3.5 Haiku", id: "claude-3-5-haiku-20241022", context: "200K", features: ["Fast", "Cost-effective"] },
              { name: "Claude 3 Opus", id: "claude-3-opus-20240229", context: "200K", features: ["Vision", "Complex tasks"] },
              { name: "Claude 3 Sonnet", id: "claude-3-sonnet-20240229", context: "200K", features: ["Balanced", "Vision"] },
            ].map((model) => (
              <div
                key={model.id}
                className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm font-semibold">{model.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{model.id}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{model.context}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {model.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Production-ready integration patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="install">Installation</TabsTrigger>
              <TabsTrigger value="basic">Basic Usage</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
              <TabsTrigger value="vision">Vision API</TabsTrigger>
            </TabsList>
            
            <TabsContent value="install" className="mt-4">
              <CodeBlock code={installCode} language="bash" />
            </TabsContent>
            
            <TabsContent value="basic" className="mt-4">
              <CodeBlock code={basicUsage} language="typescript" />
            </TabsContent>
            
            <TabsContent value="streaming" className="mt-4">
              <CodeBlock code={streamingExample} language="typescript" />
            </TabsContent>
            
            <TabsContent value="vision" className="mt-4">
              <CodeBlock code={visionExample} language="typescript" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
