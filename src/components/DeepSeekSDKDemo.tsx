import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { Brain, Play, Copy, CheckCircle, XCircle, ChartBar } from "@phosphor-icons/react";
import { toast } from "sonner";

export function DeepSeekSDKDemo() {
  const [prompt, setPrompt] = useState("Solve: ∫(x² + 2x + 1)dx from 0 to 2");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");

  const handleTest = async () => {
    setLoading(true);
    setResponse("");

    try {
      if (useRealAPI) {
        toast.error("Real API integration requires backend setup with API keys");
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedModel === "deepseek-reasoner") {
        setResponse(
          "<think>\nTo solve this integral, I need to find the antiderivative of (x² + 2x + 1).\n" +
          "I notice that x² + 2x + 1 = (x + 1)²\n" +
          "The antiderivative is: (x + 1)³/3\n" +
          "Now I'll evaluate from 0 to 2...\n</think>\n\n" +
          "The integral ∫(x² + 2x + 1)dx from 0 to 2 equals:\n\n" +
          "[(x + 1)³/3] evaluated from 0 to 2\n" +
          "= [(2 + 1)³/3] - [(0 + 1)³/3]\n" +
          "= [27/3] - [1/3]\n" +
          "= 9 - 1/3\n" +
          "= 26/3 ≈ 8.667"
        );
      } else {
        setResponse(
          "To solve the integral ∫(x² + 2x + 1)dx from 0 to 2:\n\n" +
          "1. Find the antiderivative: (x³/3) + x² + x\n" +
          "2. Evaluate at x = 2: (8/3) + 4 + 2 = 8/3 + 6 = 26/3\n" +
          "3. Evaluate at x = 0: 0\n" +
          "4. Result: 26/3 - 0 = 26/3 ≈ 8.667"
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

  const installCode = `# Install OpenAI SDK (DeepSeek uses OpenAI-compatible API)
npm install openai

# Or use with LiteLLM for multi-provider support
pip install litellm`;

  const basicUsage = `import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const completion = await deepseek.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Explain the Riemann hypothesis' }
  ],
  max_tokens: 2048,
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);`;

  const reasonerExample = `// DeepSeek R1 with Chain-of-Thought Reasoning
const completion = await deepseek.chat.completions.create({
  model: 'deepseek-reasoner',
  messages: [
    { 
      role: 'user', 
      content: 'A train leaves NYC at 3pm traveling 60mph. Another leaves Boston at 4pm traveling 80mph. When do they meet?' 
    }
  ],
  temperature: 1.0, // Required for reasoning models
});

// Response includes <think> tags with reasoning steps
console.log(completion.choices[0].message.content);`;

  const pythonExample = `from litellm import completion

# Automatic API key loading from environment
response = completion(
    model="deepseek/deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a math tutor"},
        {"role": "user", "content": "Prove the fundamental theorem of calculus"}
    ],
    temperature=0.7,
    max_tokens=2048
)

print(response.choices[0].message.content)

# With retry logic and fallback
from litellm import RetryPolicy

response = completion(
    model="deepseek/deepseek-reasoner",
    messages=[{"role": "user", "content": "Complex reasoning task..."}],
    retry_policy=RetryPolicy(max_retries=3, exponential_backoff=True),
    fallbacks=["deepseek/deepseek-chat", "openai/gpt-4"]
)`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <ChartBar className="text-accent" size={20} weight="bold" />
                </div>
                <div>
                  <CardTitle>DeepSeek API</CardTitle>
                  <CardDescription>Test reasoning and chat models</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Selection</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedModel === "deepseek-chat" ? "default" : "outline"}
                  onClick={() => setSelectedModel("deepseek-chat")}
                  className="justify-start"
                >
                  <Brain size={16} className="mr-2" />
                  Chat
                </Button>
                <Button
                  variant={selectedModel === "deepseek-reasoner" ? "default" : "outline"}
                  onClick={() => setSelectedModel("deepseek-reasoner")}
                  className="justify-start"
                >
                  <ChartBar size={16} className="mr-2" />
                  Reasoner
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
                    Test DeepSeek
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
                <span className="text-muted-foreground">Parameters</span>
                <Badge variant="outline">671B total (37B active)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Context Window</span>
                <Badge variant="outline">64K tokens</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Available Models</CardTitle>
            <CardDescription>DeepSeek model family with MoE architecture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { 
                name: "DeepSeek-Chat", 
                id: "deepseek-chat", 
                context: "64K", 
                features: ["Fast", "General purpose", "Code"],
                params: "671B (37B active)"
              },
              { 
                name: "DeepSeek-Reasoner", 
                id: "deepseek-reasoner", 
                context: "64K", 
                features: ["CoT reasoning", "Math", "Logic"],
                params: "671B"
              },
              { 
                name: "DeepSeek-Coder", 
                id: "deepseek-coder", 
                context: "16K", 
                features: ["Code generation", "Debugging"],
                params: "33B"
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
                    <div className="text-xs text-muted-foreground mt-1">{model.params}</div>
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
          <CardDescription>OpenAI-compatible API with reasoning capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="install">Installation</TabsTrigger>
              <TabsTrigger value="basic">TypeScript</TabsTrigger>
              <TabsTrigger value="reasoner">Reasoning</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="install" className="mt-4">
              <CodeBlock code={installCode} language="bash" />
            </TabsContent>
            
            <TabsContent value="basic" className="mt-4">
              <CodeBlock code={basicUsage} language="typescript" />
            </TabsContent>
            
            <TabsContent value="reasoner" className="mt-4">
              <CodeBlock code={reasonerExample} language="typescript" />
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
