import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CodeBlock } from "@/components/CodeBlock";
import { Brain, Play, Copy, CheckCircle, XCircle, Sliders } from "@phosphor-icons/react";
import { toast } from "sonner";

interface ModelParameters {
  temperature: number;
  max_tokens: number;
  top_p: number;
  top_k: number;
  includeTemperature: boolean;
  includeMaxTokens: boolean;
  includeTopP: boolean;
  includeTopK: boolean;
}

export function AnthropicSDKDemo() {
  const [prompt, setPrompt] = useState("Explain the concept of neural attention mechanisms in 2-3 sentences.");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [parameters, setParameters] = useState<ModelParameters>({
    temperature: 1.0,
    max_tokens: 1024,
    top_p: 1.0,
    top_k: 0,
    includeTemperature: true,
    includeMaxTokens: true,
    includeTopP: false,
    includeTopK: false,
  });

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
      
      const usedParams = {
        ...(parameters.includeTemperature && { temperature: parameters.temperature }),
        ...(parameters.includeMaxTokens && { max_tokens: parameters.max_tokens }),
        ...(parameters.includeTopP && { top_p: parameters.top_p }),
        ...(parameters.includeTopK && { top_k: parameters.top_k }),
      };
      
      setResponse(
        `Neural attention mechanisms allow models to dynamically focus on relevant parts of input sequences, ` +
        `computing weighted representations based on learned importance scores. This enables transformers to ` +
        `process long-range dependencies efficiently without sequential computation constraints.\n\n` +
        `[Parameters used: ${JSON.stringify(usedParams, null, 2)}]`
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
  max_tokens: ${parameters.includeMaxTokens ? parameters.max_tokens : 1024},${parameters.includeTemperature ? `\n  temperature: ${parameters.temperature},` : ''}${parameters.includeTopP ? `\n  top_p: ${parameters.top_p},` : ''}${parameters.includeTopK ? `\n  top_k: ${parameters.top_k},` : ''}
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

              <Button
                variant={showParameters ? "default" : "outline"}
                onClick={() => setShowParameters(!showParameters)}
                size="sm"
              >
                <Sliders size={16} className="mr-2" />
                Parameters
              </Button>
            </div>

            {showParameters && (
              <Card className="border-accent/30 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Model Parameters</CardTitle>
                  <CardDescription className="text-xs">
                    Configure model parameters like temperature, max tokens, etc. Check the boxes to include parameters in this request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="temp-include"
                            checked={parameters.includeTemperature}
                            onCheckedChange={(checked) => 
                              setParameters(p => ({ ...p, includeTemperature: checked }))
                            }
                          />
                          <Label htmlFor="temp-include" className="text-sm font-medium">
                            Temperature
                          </Label>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {parameters.temperature.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[parameters.temperature]}
                        onValueChange={([value]) => 
                          setParameters(p => ({ ...p, temperature: value }))
                        }
                        min={0}
                        max={2}
                        step={0.1}
                        disabled={!parameters.includeTemperature}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls randomness in the output. Lower values are more deterministic.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="topp-include"
                            checked={parameters.includeTopP}
                            onCheckedChange={(checked) => 
                              setParameters(p => ({ ...p, includeTopP: checked }))
                            }
                          />
                          <Label htmlFor="topp-include" className="text-sm font-medium">
                            Top P
                          </Label>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {parameters.top_p.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[parameters.top_p]}
                        onValueChange={([value]) => 
                          setParameters(p => ({ ...p, top_p: value }))
                        }
                        min={0}
                        max={1}
                        step={0.05}
                        disabled={!parameters.includeTopP}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nucleus sampling parameter. Controls diversity via cumulative probability.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="topk-include"
                            checked={parameters.includeTopK}
                            onCheckedChange={(checked) => 
                              setParameters(p => ({ ...p, includeTopK: checked }))
                            }
                          />
                          <Label htmlFor="topk-include" className="text-sm font-medium">
                            Top K
                          </Label>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {parameters.top_k}
                        </span>
                      </div>
                      <Input
                        type="number"
                        value={parameters.top_k}
                        onChange={(e) => 
                          setParameters(p => ({ ...p, top_k: parseInt(e.target.value) || 0 }))
                        }
                        min={0}
                        max={100}
                        disabled={!parameters.includeTopK}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Limits the number of highest probability tokens to consider.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="maxtokens-include"
                            checked={parameters.includeMaxTokens}
                            onCheckedChange={(checked) => 
                              setParameters(p => ({ ...p, includeMaxTokens: checked }))
                            }
                          />
                          <Label htmlFor="maxtokens-include" className="text-sm font-medium">
                            Max Tokens
                          </Label>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {parameters.max_tokens}
                        </span>
                      </div>
                      <Input
                        type="number"
                        value={parameters.max_tokens}
                        onChange={(e) => 
                          setParameters(p => ({ ...p, max_tokens: parseInt(e.target.value) || 1024 }))
                        }
                        min={1}
                        max={8192}
                        disabled={!parameters.includeMaxTokens}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of tokens to generate.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
