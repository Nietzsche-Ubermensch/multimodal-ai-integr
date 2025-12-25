import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { Lightning, Play, Copy, CheckCircle, XCircle, Globe } from "@phosphor-icons/react";
import { toast } from "sonner";

export function XAISDKDemo() {
  const [prompt, setPrompt] = useState("What are the latest developments in quantum computing? Include web search.");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [selectedModel, setSelectedModel] = useState("grok-beta");

  const handleTest = async () => {
    setLoading(true);
    setResponse("");

    try {
      if (useRealAPI) {
        toast.error("Real API integration requires backend setup with API keys");
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1800));
      
      if (selectedModel === "grok-beta") {
        setResponse(
          "[Web Search Results]\n" +
          "• Recent breakthrough in topological quantum computing at Microsoft\n" +
          "• Google achieves quantum error correction milestone with Willow chip\n" +
          "• IBM's 1,121-qubit Condor processor demonstrates quantum advantage\n\n" +
          "Based on the latest research, quantum computing has seen remarkable progress in 2024-2025. " +
          "Google's Willow chip achieved a major milestone in quantum error correction, demonstrating " +
          "exponential error reduction as qubits scale. IBM released the Condor processor with over 1,000 qubits, " +
          "while Microsoft advanced topological quantum computing with Majorana zero modes. These developments " +
          "bring us closer to fault-tolerant quantum computers capable of solving complex problems in " +
          "cryptography, drug discovery, and materials science."
        );
      } else {
        setResponse(
          "Quantum computing has advanced significantly with breakthroughs in error correction, qubit scaling, " +
          "and algorithm development. Major players like Google, IBM, and Microsoft are pushing towards " +
          "fault-tolerant systems. Key areas of progress include topological qubits, improved coherence times, " +
          "and practical applications in optimization and simulation."
        );
      }
      
      toast.success("Response generated successfully");
    } catch (error) {
      toast.error("Failed to generate response");
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const installCode = `# Install OpenAI SDK (xAI uses OpenAI-compatible API)
npm install openai

# Or use with AI SDK
npm install @ai-sdk/openai ai`;

  const basicUsage = `import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const completion = await xai.chat.completions.create({
  model: 'grok-beta',
  messages: [
    { 
      role: 'user', 
      content: 'Explain the latest SpaceX Starship launch' 
    }
  ],
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);`;

  const webSearchExample = `// Grok with real-time web search
const completion = await xai.chat.completions.create({
  model: 'grok-beta',
  messages: [
    { 
      role: 'system', 
      content: 'You have access to real-time web search. Use it for current events.' 
    },
    { 
      role: 'user', 
      content: 'What are today\\'s top tech news stories?' 
    }
  ],
  temperature: 0.7,
});

// Grok automatically searches the web and cites sources
console.log(completion.choices[0].message.content);`;

  const streamingExample = `import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configure xAI as custom OpenAI provider
const xai = openai.provider({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const result = await streamText({
  model: xai('grok-beta'),
  messages: [
    { role: 'user', content: 'Write a detailed analysis of AGI timeline' }
  ],
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}`;

  const pythonExample = `from litellm import completion

# LiteLLM with xAI/Grok
response = completion(
    model="xai/grok-beta",
    messages=[
        {
            "role": "system", 
            "content": "You are Grok, a witty AI with web search capabilities"
        },
        {
            "role": "user", 
            "content": "What's the current status of Mars colonization efforts?"
        }
    ],
    temperature=0.8,
    max_tokens=2048
)

print(response.choices[0].message.content)

# With fallback to other providers
response = completion(
    model="xai/grok-beta",
    messages=[{"role": "user", "content": "Explain transformer architecture"}],
    fallbacks=["anthropic/claude-3-5-sonnet-20241022", "openai/gpt-4o"]
)`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Lightning className="text-accent" size={20} weight="bold" />
                </div>
                <div>
                  <CardTitle>xAI Grok API</CardTitle>
                  <CardDescription>Test Grok with web search integration</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Selection</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedModel === "grok-beta" ? "default" : "outline"}
                  onClick={() => setSelectedModel("grok-beta")}
                  className="justify-start"
                >
                  <Globe size={16} className="mr-2" />
                  Grok Beta
                </Button>
                <Button
                  variant={selectedModel === "grok-vision-beta" ? "default" : "outline"}
                  onClick={() => setSelectedModel("grok-vision-beta")}
                  className="justify-start"
                >
                  <Lightning size={16} className="mr-2" />
                  Vision
                </Button>
              </div>
            </div>

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
                    Test Grok
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
                <Badge variant="outline">{selectedModel}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Special Feature</span>
                <Badge variant="outline">Real-time Web Search</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Context Window</span>
                <Badge variant="outline">131K tokens</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Available Models</CardTitle>
            <CardDescription>Grok family with web search capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { 
                name: "Grok Beta", 
                id: "grok-beta", 
                context: "131K", 
                features: ["Web Search", "Real-time data", "Witty personality"],
                updated: "2024-11"
              },
              { 
                name: "Grok Vision Beta", 
                id: "grok-vision-beta", 
                context: "8K", 
                features: ["Image understanding", "OCR", "Visual reasoning"],
                updated: "2024-11"
              },
              { 
                name: "Grok 2", 
                id: "grok-2-1212", 
                context: "131K", 
                features: ["Latest model", "Enhanced reasoning"],
                updated: "2024-12"
              },
            ].map((model) => (
              <div
                key={model.id}
                className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm font-semibold">{model.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{model.id}</div>
                    <div className="text-xs text-muted-foreground mt-1">Updated: {model.updated}</div>
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
          <CardDescription>OpenAI-compatible API with web search integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="install">Installation</TabsTrigger>
              <TabsTrigger value="basic">Basic Usage</TabsTrigger>
              <TabsTrigger value="websearch">Web Search</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="install" className="mt-4">
              <CodeBlock code={installCode} language="bash" />
            </TabsContent>
            
            <TabsContent value="basic" className="mt-4">
              <CodeBlock code={basicUsage} language="typescript" />
            </TabsContent>
            
            <TabsContent value="websearch" className="mt-4">
              <CodeBlock code={webSearchExample} language="typescript" />
            </TabsContent>
            
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={pythonExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
