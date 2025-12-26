import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from "@/components/CodeBlock";
import { Lightning, Play, CheckCircle, XCircle, Globe, Brain, Code as CodeIcon, Image, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";

type ModelInfo = {
  id: string;
  name: string;
  family: string;
  context: string;
  features: string[];
  pricing?: { input: string; output: string; };
  capabilities: string[];
  notes?: string;
  icon: typeof Lightning;
};

const MODELS: ModelInfo[] = [
  {
    id: "grok-4-1-fast-reasoning",
    name: "Grok 4.1 Fast (Reasoning)",
    family: "Grok 4.1",
    context: "2M tokens",
    capabilities: ["Reasoning", "Function calling", "Vision", "Audio", "Web search", "Caching"],
    features: ["Always-on reasoning", "2M context", "Prompt caching"],
    pricing: { input: "$2/M tokens", output: "$10/M tokens" },
    notes: "Optimized for high-performance agentic tool calling",
    icon: Brain
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    name: "Grok 4.1 Fast (Non-Reasoning)",
    family: "Grok 4.1",
    context: "2M tokens",
    capabilities: ["Function calling", "Vision", "Audio", "Web search", "Caching"],
    features: ["Fast responses", "2M context", "Lower token usage"],
    pricing: { input: "$2/M tokens", output: "$10/M tokens" },
    notes: "For simple queries and faster responses",
    icon: Lightning
  },
  {
    id: "grok-code-fast-1",
    name: "Grok Code Fast",
    family: "Grok Code",
    context: "256K tokens",
    capabilities: ["Reasoning", "Function calling", "Code generation", "Caching"],
    features: ["Optimized for code", "Enhanced tools", "Lower input cost"],
    pricing: { input: "$0.20/M tokens", output: "$1.50/M tokens" },
    notes: "Optimized reasoning for code generation pipelines",
    icon: CodeIcon
  },
  {
    id: "grok-4-fast-reasoning",
    name: "Grok 4 Fast (Reasoning)",
    family: "Grok 4",
    context: "2M tokens",
    capabilities: ["Reasoning", "Function calling", "Web search"],
    features: ["Always-on reasoning", "2M context"],
    notes: "Previous version; slower than 4.1",
    icon: Brain
  },
  {
    id: "grok-4-fast-non-reasoning",
    name: "Grok 4 Fast (Non-Reasoning)",
    family: "Grok 4",
    context: "2M tokens",
    capabilities: ["Function calling", "Web search"],
    features: ["Fast response", "2M context"],
    notes: "Previous version; slower than 4.1",
    icon: Lightning
  },
  {
    id: "grok-4-0709",
    name: "Grok 4 (0709)",
    family: "Grok 4",
    context: "256K tokens",
    capabilities: ["Reasoning", "Function calling", "Web search"],
    features: ["Highest quality", "Always-on reasoning"],
    pricing: { input: "$5/M tokens", output: "$15/M tokens" },
    notes: "Highest quality, highest cost",
    icon: Sparkle
  },
  {
    id: "grok-2-vision-1212",
    name: "Grok 2 Vision",
    family: "Grok 2",
    context: "32K tokens",
    capabilities: ["Vision", "Limited tools"],
    features: ["Image understanding", "Regional endpoints"],
    notes: "Regional endpoints: us-east-1/eu-west-1",
    icon: Image
  },
  {
    id: "grok-3",
    name: "Grok 3",
    family: "Grok 3",
    context: "131K tokens",
    capabilities: ["Optional reasoning", "Function calling", "Web search"],
    features: ["reasoning_effort param", "Standard tools"],
    notes: "Legacy model; supports reasoning_effort parameter",
    icon: Brain
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    family: "Grok 3",
    context: "131K tokens",
    capabilities: ["Optional reasoning", "Function calling", "Web search"],
    features: ["reasoning_effort param", "Smaller model"],
    notes: "Legacy mini variant",
    icon: Lightning
  },
];

export function XAISDKDemo() {
  const [prompt, setPrompt] = useState("What are the latest developments in quantum computing? Include web search.");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [selectedModel, setSelectedModel] = useState("grok-4-1-fast-reasoning");

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  const handleTest = async () => {
    setLoading(true);
    setResponse("");

    try {
      if (useRealAPI) {
        toast.error("Real API integration requires backend setup with XAI_API_KEY");
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const hasReasoning = currentModel.capabilities.includes("Reasoning");
      const hasWebSearch = currentModel.capabilities.includes("Web search");
      
      if (hasReasoning && hasWebSearch) {
        setResponse(
          "[Reasoning Process]\n" +
          "Let me search for the latest quantum computing developments and synthesize the information...\n\n" +
          "[Web Search Results]\n" +
          "• Recent breakthrough in topological quantum computing at Microsoft\n" +
          "• Google achieves quantum error correction milestone with Willow chip\n" +
          "• IBM's 1,121-qubit Condor processor demonstrates quantum advantage\n\n" +
          "[Analysis]\n" +
          "Based on the latest research, quantum computing has seen remarkable progress in 2024-2025. " +
          "Google's Willow chip achieved a major milestone in quantum error correction, demonstrating " +
          "exponential error reduction as qubits scale. IBM released the Condor processor with over 1,000 qubits, " +
          "while Microsoft advanced topological quantum computing with Majorana zero modes. These developments " +
          "bring us closer to fault-tolerant quantum computers capable of solving complex problems in " +
          "cryptography, drug discovery, and materials science.\n\n" +
          `[Model: ${currentModel.name} with reasoning and web search]`
        );
      } else if (currentModel.id.includes("code")) {
        setResponse(
          "Here's an optimized quantum circuit implementation:\n\n" +
          "```python\n" +
          "from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n\n" +
          "# Create quantum circuit for Bell state\n" +
          "qr = QuantumRegister(2, 'q')\n" +
          "cr = ClassicalRegister(2, 'c')\n" +
          "circuit = QuantumCircuit(qr, cr)\n\n" +
          "# Apply Hadamard and CNOT\n" +
          "circuit.h(qr[0])\n" +
          "circuit.cx(qr[0], qr[1])\n" +
          "circuit.measure(qr, cr)\n" +
          "```\n\n" +
          `[Model: ${currentModel.name} optimized for code generation]`
        );
      } else if (currentModel.id.includes("vision")) {
        setResponse(
          "I can analyze quantum computing diagrams, circuit schematics, and research papers with visual elements. " +
          "For text-only queries, please use a text model. Vision models excel at understanding quantum circuit diagrams, " +
          "Bloch spheres, and experimental setups.\n\n" +
          `[Model: ${currentModel.name} - vision capabilities]`
        );
      } else {
        setResponse(
          "Quantum computing has advanced significantly with breakthroughs in error correction, qubit scaling, " +
          "and algorithm development. Major players like Google, IBM, and Microsoft are pushing towards " +
          "fault-tolerant systems. Key areas of progress include topological qubits, improved coherence times, " +
          "and practical applications in optimization and simulation.\n\n" +
          `[Model: ${currentModel.name}]`
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
npm install @ai-sdk/openai ai

# xAI provides TWO API domains:
# 1. Primary API (Inference): https://api.x.ai/v1
# 2. Management API (Admin): https://management-api.x.ai`;

  const basicUsage = `import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1', // All models use single endpoint
});

// Grok 4.1 Fast with reasoning (recommended)
const completion = await xai.chat.completions.create({
  model: 'grok-4-1-fast-reasoning',
  messages: [
    { 
      role: 'user', 
      content: 'Explain quantum entanglement step by step' 
    }
  ],
  temperature: 0.7,
  max_tokens: 4096,
  // NO stop, presencePenalty, frequencyPenalty for reasoning models
});

console.log(completion.choices[0].message.content);

// Usage tracking with reasoning tokens
console.log('Input tokens:', completion.usage.prompt_tokens);
console.log('Output tokens:', completion.usage.completion_tokens);
console.log('Reasoning tokens:', completion.usage.completion_tokens_details?.reasoning_tokens);`;

  const modelSelectionCode = `// Model-to-Capabilities Matrix

// ✅ Deep reasoning + research (2M context)
const grok41Reasoning = await xai.chat.completions.create({
  model: 'grok-4-1-fast-reasoning',
  messages: [{ role: 'user', content: 'Analyze this complex problem...' }],
  // Reasoning always on; no stop, penalties, or reasoning_effort allowed
});

// ✅ Fast response without reasoning (2M context)
const grok41NonReasoning = await xai.chat.completions.create({
  model: 'grok-4-1-fast-non-reasoning',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  stop: ['\\n\\n'], // ✅ Supports all standard OpenAI params
  presence_penalty: 0.1,
  frequency_penalty: 0.1,
});

// ✅ Code generation with optimized pricing
const grokCode = await xai.chat.completions.create({
  model: 'grok-code-fast-1',
  messages: [{ role: 'user', content: 'Write a binary search in TypeScript' }],
  // $0.20/M input, $1.50/M output (lower input cost!)
});

// ✅ Highest quality (256K context)
const grok4Opus = await xai.chat.completions.create({
  model: 'grok-4-0709',
  messages: [{ role: 'user', content: 'Critical analysis required' }],
  // Highest quality, highest cost ($5/M in, $15/M out)
});

// ✅ Legacy model with optional reasoning
const grok3 = await xai.chat.completions.create({
  model: 'grok-3',
  messages: [{ role: 'user', content: 'Complex math problem' }],
  reasoning_effort: 'high', // Only Grok 3 family supports this
});`;

  const functionCallingCode = `// Tool Integration (Tools are NOT separate endpoints)

const response = await xai.chat.completions.create({
  model: 'grok-4-1-fast-reasoning',
  messages: [
    { role: 'user', content: 'What is the weather in Boston?' }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'web_search',
        description: 'Search the internet for current information',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      }
    }
  ],
  tool_choice: 'auto' // Let model decide
});

// Response contains tool_calls
if (response.choices[0].message.tool_calls) {
  const toolCall = response.choices[0].message.tool_calls[0];
  console.log('Function:', toolCall.function.name);
  console.log('Arguments:', toolCall.function.arguments);
  
  // Execute tool and send result back
  const toolResult = await executeWebSearch(JSON.parse(toolCall.function.arguments));
  
  const finalResponse = await xai.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [
      ...messages,
      response.choices[0].message,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      }
    ]
  });
}

// Tool cost: $5 per 1K invocations (separate from token costs)`;

  const visionExample = `// Vision API (grok-2-vision-1212)

const visionResponse = await xai.chat.completions.create({
  model: 'grok-2-vision-1212',
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: 'https://example.com/quantum-circuit.png',
          // Or base64: 'data:image/png;base64,...'
        }
      },
      {
        type: 'text',
        text: 'Analyze this quantum circuit diagram'
      }
    ]
  }]
});

// Regional endpoints: us-east-1 or eu-west-1
// Limited tool support compared to text models`;

  const streamingExample = `import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configure xAI as custom OpenAI provider
const xai = openai.provider({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const result = await streamText({
  model: xai('grok-4-1-fast-reasoning'),
  messages: [
    { role: 'user', content: 'Write a detailed analysis of AGI timeline' }
  ],
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}`;

  const rateLimitingCode = `// Rate Limiting & Scaling for Heavy Accounts

// Endpoint-Level Limits (per API key)
// grok-4-1-fast-*:    4M tokens/min | 480 rpm
// grok-4-0709:        2M tokens/min | 480 rpm  
// grok-3:            131K tokens/min | 600 rpm
// grok-3-mini:       131K tokens/min | 480 rpm

// Best Practices:

// 1. Use model aliases for automatic upgrades
const response = await xai.chat.completions.create({
  model: 'grok-4-1-fast-reasoning', // Latest patches
  // Or pin: 'grok-4-1-fast-reasoning-2025-11'
  messages: [...]
});

// 2. Cache tool results
const cacheKey = \`\${query}_\${toolName}\`;
if (cache.exists(cacheKey)) {
  return cache.get(cacheKey);
}

// 3. Tool invocation budgets
const toolBudget = {
  web_search: 1000,  // per hour
  code_execution: 500
};

// 4. Always stream for monitoring
const stream = await xai.chat.completions.create({
  model: 'grok-4-1-fast-reasoning',
  messages,
  stream: true, // Monitor tool calls in real-time
});`;

  const pythonExample = `from litellm import completion
import os

os.environ['XAI_API_KEY'] = ""

# LiteLLM with xAI/Grok 4.1
response = completion(
    model="xai/grok-4-1-fast-reasoning",
    messages=[
        {
            "role": "user", 
            "content": "Analyze the Mars colonization feasibility"
        }
    ],
    temperature=0.7,
    max_tokens=4096
)

print(response.choices[0].message.content)

# With reasoning token tracking
print(f"Reasoning tokens: {response.usage.completion_tokens_details.reasoning_tokens}")

# Tool use example
response = completion(
    model="xai/grok-4-1-fast-reasoning",
    messages=[{"role": "user", "content": "Search for latest SpaceX news"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    }],
    tool_choice="auto"
)

# Fallback chain
response = completion(
    model="xai/grok-4-1-fast-reasoning",
    messages=[{"role": "user", "content": "Explain transformers"}],
    fallbacks=["anthropic/claude-3-5-sonnet-20241022", "openai/gpt-4o"]
)`;

  return (
    <div className="space-y-6">
      {/* Architecture Alert */}
      <Alert className="border-accent/50 bg-accent/5">
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>xAI Architecture:</strong> Single unified endpoint (/v1/chat/completions) for all models and capabilities. 
          Model selection via <code className="text-xs bg-background/50 px-1 rounded">model</code> parameter determines behavior, pricing, and features.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Lightning className="text-accent" size={20} weight="bold" />
                </div>
                <div>
                  <CardTitle>xAI Grok Testing</CardTitle>
                  <CardDescription>Test models with comprehensive capabilities</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Selection ({MODELS.length} available)</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grok-4-1-fast-reasoning">
                    <div className="flex items-center gap-2">
                      <Brain size={16} />
                      <span>Grok 4.1 Fast (Reasoning) - 2M ctx</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="grok-4-1-fast-non-reasoning">
                    <div className="flex items-center gap-2">
                      <Lightning size={16} />
                      <span>Grok 4.1 Fast (Non-Reasoning) - 2M ctx</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="grok-code-fast-1">
                    <div className="flex items-center gap-2">
                      <CodeIcon size={16} />
                      <span>Grok Code Fast - 256K ctx</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="grok-4-fast-reasoning">Grok 4 Fast (Reasoning) - 2M ctx</SelectItem>
                  <SelectItem value="grok-4-fast-non-reasoning">Grok 4 Fast (Non-Reasoning) - 2M ctx</SelectItem>
                  <SelectItem value="grok-4-0709">Grok 4 (0709) - Highest Quality</SelectItem>
                  <SelectItem value="grok-2-vision-1212">
                    <div className="flex items-center gap-2">
                      <Image size={16} />
                      <span>Grok 2 Vision - 32K ctx</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="grok-3">Grok 3 - Legacy (131K ctx)</SelectItem>
                  <SelectItem value="grok-3-mini">Grok 3 Mini - Legacy (131K ctx)</SelectItem>
                </SelectContent>
              </Select>
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
                    Test {currentModel.name}
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

            {/* Current Model Info */}
            <div className="pt-2 space-y-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model ID</span>
                <Badge variant="outline" className="font-mono text-xs">{currentModel.id}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Context Window</span>
                <Badge variant="outline">{currentModel.context}</Badge>
              </div>
              {currentModel.pricing && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pricing</span>
                  <Badge variant="outline">{currentModel.pricing.input} / {currentModel.pricing.output}</Badge>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Capabilities</span>
                <div className="flex flex-wrap gap-1">
                  {currentModel.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
              {currentModel.notes && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  {currentModel.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Catalog */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Model Catalog</CardTitle>
            <CardDescription>9 models across 4 families with distinct capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {MODELS.map((model) => {
              const Icon = model.icon;
              return (
                <div
                  key={model.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedModel === model.id 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <Icon size={18} className="text-accent mt-0.5" />
                      <div>
                        <div className="font-mono text-sm font-semibold">{model.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{model.id}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{model.context}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {model.pricing && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      💰 {model.pricing.input} in / {model.pricing.output} out
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Code Examples</CardTitle>
          <CardDescription>OpenAI-compatible API with unified /v1/chat/completions endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="install">Install</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="vision">Vision</TabsTrigger>
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="install" className="mt-4">
              <CodeBlock code={installCode} language="bash" />
            </TabsContent>
            
            <TabsContent value="basic" className="mt-4">
              <CodeBlock code={basicUsage} language="typescript" />
            </TabsContent>
            
            <TabsContent value="models" className="mt-4">
              <CodeBlock code={modelSelectionCode} language="typescript" />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-4">
              <CodeBlock code={functionCallingCode} language="typescript" />
            </TabsContent>
            
            <TabsContent value="vision" className="mt-4">
              <CodeBlock code={visionExample} language="typescript" />
            </TabsContent>
            
            <TabsContent value="stream" className="mt-4">
              <CodeBlock code={streamingExample} language="typescript" />
            </TabsContent>
            
            <TabsContent value="limits" className="mt-4">
              <CodeBlock code={rateLimitingCode} language="typescript" />
            </TabsContent>
            
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={pythonExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Capabilities Matrix */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle>Model-to-Capabilities Matrix</CardTitle>
          <CardDescription>Comprehensive feature comparison across all Grok models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-mono text-xs">Model</th>
                  <th className="text-left py-2 px-2 text-xs">Context</th>
                  <th className="text-left py-2 px-2 text-xs">Reasoning</th>
                  <th className="text-left py-2 px-2 text-xs">Tools</th>
                  <th className="text-left py-2 px-2 text-xs">Special</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((model) => (
                  <tr key={model.id} className="border-b hover:bg-accent/5">
                    <td className="py-2 px-2 font-mono text-xs">{model.id}</td>
                    <td className="py-2 px-2 text-xs">{model.context}</td>
                    <td className="py-2 px-2 text-xs">
                      {model.capabilities.includes("Reasoning") ? "✅" : 
                       model.capabilities.includes("Optional reasoning") ? "⚠️" : "❌"}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {model.capabilities.includes("Function calling") ? "✅ Full" : 
                       model.capabilities.includes("Limited tools") ? "⚠️ Limited" : "❌"}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        {model.capabilities.includes("Vision") && <Badge variant="outline" className="text-xs">👁️ Vision</Badge>}
                        {model.capabilities.includes("Web search") && <Badge variant="outline" className="text-xs">🌐 Web</Badge>}
                        {model.capabilities.includes("Caching") && <Badge variant="outline" className="text-xs">💾 Cache</Badge>}
                        {model.capabilities.includes("Code generation") && <Badge variant="outline" className="text-xs">💻 Code</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
