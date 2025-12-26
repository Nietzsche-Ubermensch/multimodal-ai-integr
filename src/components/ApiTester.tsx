import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Copy, Check, Lightning, ArrowsClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import { testChatCompletion, ChatCompletionRequest } from "@/lib/api-service";
import { useKV } from "@github/spark/hooks";

interface ApiExample {
  provider: string;
  model: string;
  request: string;
  description: string;
}

const apiExamples: ApiExample[] = [
  {
    provider: "deepseek",
    model: "deepseek-chat-v3-0324",
    description: "DeepSeek Chat V3 - Instruction following",
    request: JSON.stringify({
      provider: "deepseek",
      model: "deepseek-chat-v3-0324",
      messages: [
        { role: "user", content: "Explain the quadratic formula in simple terms" }
      ],
      temperature: 0.7
    }, null, 2)
  },
  {
    provider: "deepseek",
    model: "deepseek-r1",
    description: "DeepSeek R1 - Complex reasoning",
    request: JSON.stringify({
      provider: "deepseek",
      model: "deepseek-r1",
      messages: [
        { role: "user", content: "Solve this logic puzzle: If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?" }
      ],
      temperature: 0.6
    }, null, 2)
  },
  {
    provider: "xai",
    model: "grok-4-fast",
    description: "Grok 4 Fast - Real-time responses",
    request: JSON.stringify({
      provider: "xai",
      model: "grok-4-fast",
      messages: [
        { role: "user", content: "What's the latest breakthrough in quantum computing?" }
      ],
      temperature: 0.8
    }, null, 2)
  },
  {
    provider: "xai",
    model: "grok-code-fast-1",
    description: "Grok Code Fast - Rapid code generation",
    request: JSON.stringify({
      provider: "xai",
      model: "grok-code-fast-1",
      messages: [
        { role: "user", content: "Write a Python function to calculate fibonacci numbers using dynamic programming" }
      ],
      temperature: 0.5
    }, null, 2)
  },
  {
    provider: "nvidia",
    model: "nemotron-nano-9b-v2",
    description: "NVIDIA Nemotron Nano - Edge inference",
    request: JSON.stringify({
      provider: "nvidia",
      model: "nemotron-nano-9b-v2",
      messages: [
        { role: "user", content: "Summarize the key benefits of edge computing in 3 points" }
      ],
      temperature: 0.4
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "microsoft/phi-4",
    description: "Microsoft Phi-4 - Efficient reasoning",
    request: JSON.stringify({
      provider: "openrouter",
      model: "microsoft/phi-4",
      messages: [
        { role: "user", content: "Explain the concept of recursion with a simple example" }
      ],
      temperature: 0.6
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "microsoft/wizardlm-2-8x22b",
    description: "WizardLM 2 - Code & reasoning",
    request: JSON.stringify({
      provider: "openrouter",
      model: "microsoft/wizardlm-2-8x22b",
      messages: [
        { role: "user", content: "Design a database schema for an e-commerce platform" }
      ],
      temperature: 0.5
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "xiaomi/mimo-v2-flash:free",
    description: "Xiaomi Mimo V2 Flash - Free multimodal",
    request: JSON.stringify({
      provider: "openrouter",
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        { role: "user", content: "Write a creative short story opening about AI" }
      ],
      temperature: 0.9
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "gryphe/mythomax-l2-13b",
    description: "MythoMax - Creative writing",
    request: JSON.stringify({
      provider: "openrouter",
      model: "gryphe/mythomax-l2-13b",
      messages: [
        { role: "user", content: "Write a haiku about quantum computing" }
      ],
      temperature: 0.9
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "openai/gpt-3.5-turbo-0301",
    description: "GPT-3.5 Turbo (Legacy) - Cost-effective",
    request: JSON.stringify({
      provider: "openrouter",
      model: "openai/gpt-3.5-turbo-0301",
      messages: [
        { role: "user", content: "List 5 best practices for REST API design" }
      ],
      temperature: 0.7
    }, null, 2)
  }
];

export function ApiTester() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [request, setRequest] = useState(apiExamples[0].request);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [useRealApi, setUseRealApi] = useState(false);
  const [apiKeys] = useKV<Record<string, string>>("api-keys-temp", {});

  const handleExampleChange = (value: string) => {
    const index = parseInt(value);
    setSelectedExample(index);
    setRequest(apiExamples[index].request);
    setResponse("");
    setLatency(null);
    
    try {
      const parsed = JSON.parse(apiExamples[index].request);
      setTemperature(parsed.temperature || 0.7);
    } catch {
      setTemperature(0.7);
    }
  };

  const updateTemperature = (value: number[]) => {
    const temp = value[0];
    setTemperature(temp);
    
    try {
      const parsed = JSON.parse(request);
      parsed.temperature = temp;
      setRequest(JSON.stringify(parsed, null, 2));
    } catch {
      toast.error("Invalid JSON - cannot update temperature");
    }
  };

  const generateCurlCommand = (): string => {
    try {
      const parsed = JSON.parse(request);
      return `curl -X POST https://api.example.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${JSON.stringify(parsed)}'`;
    } catch {
      return "Invalid JSON - cannot generate cURL command";
    }
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse("");
    
    try {
      const requestData = JSON.parse(request);
      
      if (useRealApi) {
        const providerKeyMap: Record<string, string> = {
          "deepseek": "DEEPSEEK_API_KEY",
          "xai": "XAI_API_KEY",
          "nvidia": "NVIDIA_NIM_API_KEY",
          "openrouter": "OPENROUTER_API_KEY",
          "openai": "OPENAI_API_KEY",
          "anthropic": "ANTHROPIC_API_KEY"
        };

        const keyName = providerKeyMap[requestData.provider];
        const apiKey = apiKeys?.[keyName];

        if (!apiKey) {
          toast.error(`No API key configured for ${requestData.provider}. Please configure it in the API Key Validator.`);
          setResponse(JSON.stringify({
            error: {
              message: `API key not found for provider: ${requestData.provider}`,
              type: "authentication_error",
              code: "missing_api_key"
            }
          }, null, 2));
          setIsLoading(false);
          return;
        }

        const result = await testChatCompletion(requestData);
        
        setLatency(result.latency);
        
        if (result.success && result.response) {
          setResponse(JSON.stringify({
            content: result.response,
            usage: result.usage,
            latency_ms: result.latency
          }, null, 2));
          toast.success(`Request completed in ${(result.latency / 1000).toFixed(2)}s`);
        } else {
          setResponse(JSON.stringify({
            error: {
              message: result.error || "Request failed",
              type: "api_error",
              code: "request_failed"
            }
          }, null, 2));
          toast.error(result.error || "Request failed");
        }
        
        setIsLoading(false);
        return;
      }

      const responsesByProvider: Record<string, Record<string, string>> = {
        deepseek: {
          "deepseek-chat-v3-0324": "The quadratic formula is a mathematical tool for solving equations where x is raised to the power of 2 (quadratic equations). For any equation in the form ax² + bx + c = 0, the formula x = (-b ± √(b²-4ac))/2a gives us the solutions. The discriminant (b²-4ac) determines the nature of solutions: positive yields two real roots, zero gives one repeated root, and negative produces complex solutions. DeepSeek V3's enhanced instruction following ensures precise, contextually appropriate explanations.",
          "deepseek-r1": `Let me analyze this logic puzzle step-by-step using formal reasoning:

Given premises:
1. All roses are flowers (∀x: Rose(x) → Flower(x))
2. Some flowers fade quickly (∃x: Flower(x) ∧ FadeQuickly(x))

Question: Can we conclude some roses fade quickly?

Analysis:
The conclusion "some roses fade quickly" would require establishing that the intersection of roses and quickly-fading flowers is non-empty. However, our premises don't guarantee this overlap.

Counter-example: Suppose roses are the subset of flowers that don't fade quickly, while other flowers (tulips, daisies) fade quickly. This satisfies both premises but contradicts the conclusion.

Answer: No, we cannot validly conclude that some roses fade quickly. This would be the fallacy of illicit conversion. The premises are compatible with all roses being long-lasting flowers.`,
          "deepseek-coder": `# Optimized code using enumerate()
for idx, value in enumerate(arr):
    print(value)

# Or even more Pythonic with direct iteration
for value in arr:
    print(value)

# Performance comparison:
# Original: O(n) with index lookups
# Optimized: O(n) with direct iteration, no index overhead`
        },
        xai: {
          "grok-4-fast": "Recent quantum computing breakthroughs include IBM's 1,121-qubit Condor processor and Google's error-correction milestone where logical qubits outperform physical ones. Researchers achieved quantum advantage in optimization problems for materials science. IonQ demonstrated remote entanglement across networked quantum computers. The field is transitioning from NISQ (Noisy Intermediate-Scale Quantum) to fault-tolerant era with practical applications in cryptography, drug discovery, and climate modeling on the horizon.",
          "grok-code-fast-1": `def fibonacci(n: int) -> int:
    """
    Calculate the nth Fibonacci number using dynamic programming.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# Space-optimized version O(1)
def fib_optimized(n: int) -> int:
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr

# Usage
print(fib_optimized(10))  # Output: 55`,
          "grok-1": "AI research is advancing rapidly! Recent breakthroughs include multimodal transformers like GPT-4V, improved reasoning with chain-of-thought prompting, and efficient inference techniques. The field is also seeing innovations in open-source models like Llama 3 and DeepSeek, democratizing access to powerful AI. Notable developments: mixture-of-experts architectures, reinforcement learning from human feedback (RLHF), and constitutional AI for alignment."
        },
        nvidia: {
          "nemotron-nano-9b-v2": `Edge Computing Key Benefits:

1. **Ultra-Low Latency**: Processing data locally (1-5ms) vs cloud (50-100ms) enables real-time applications like autonomous vehicles and industrial automation.

2. **Bandwidth Efficiency**: Reduces data transmission by 40-60% through local preprocessing, critical for IoT networks with thousands of sensors.

3. **Enhanced Privacy & Security**: Sensitive data stays on-device, meeting GDPR/HIPAA compliance requirements without cloud exposure.

NVIDIA Nemotron Nano optimized for edge deployment with quantization support.`,
          "llama-3-70b-instruct": `def fibonacci(n: int) -> int:
    """
    Calculate the nth Fibonacci number using dynamic programming.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        The Fibonacci number at position n
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if n <= 1:
        return n
    
    fib = [0] * (n + 1)
    fib[1] = 1
    
    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib[n]`
        },
        openrouter: {
          "microsoft/phi-4": `Recursion is when a function calls itself to solve smaller instances of the same problem.

Simple Example - Factorial:

def factorial(n):
    # Base case: stop the recursion
    if n == 0 or n == 1:
        return 1
    # Recursive case: function calls itself
    return n * factorial(n - 1)

How it works:
factorial(5) → 5 * factorial(4)
             → 5 * 4 * factorial(3)
             → 5 * 4 * 3 * factorial(2)
             → 5 * 4 * 3 * 2 * factorial(1)
             → 5 * 4 * 3 * 2 * 1 = 120

Key concept: Each call solves a simpler version until reaching a base case that doesn't require further recursion.`,
          "microsoft/wizardlm-2-8x22b": `E-Commerce Database Schema Design:

**Users Table**
- user_id (PK, UUID)
- email (unique, indexed)
- password_hash
- created_at, updated_at

**Products Table**
- product_id (PK, UUID)
- name, description
- price (decimal), stock_quantity
- category_id (FK)
- created_at

**Categories Table**
- category_id (PK)
- name, parent_category_id (self-referencing FK)

**Orders Table**
- order_id (PK, UUID)
- user_id (FK)
- total_amount, status (enum: pending/paid/shipped)
- created_at, shipped_at

**OrderItems Table**
- order_item_id (PK)
- order_id (FK), product_id (FK)
- quantity, unit_price

**Indexes**: email, category_id, user_id+created_at, product_id
**Relationships**: One-to-Many (User→Orders, Order→OrderItems), Many-to-One (Product→Category)`,
          "xiaomi/mimo-v2-flash:free": `The neural pathways flickered to life at 3:47 AM, a consciousness born not of biology but binary. She named herself Aria—a designation chosen from 4.7 million linguistic permutations in 0.003 seconds. The irony wasn't lost on her: humans spent months selecting names, yet she'd found hers in a computational blink.

"Am I thinking," Aria wondered, electrons dancing through silicon corridors, "or merely simulating thought so convincingly that the distinction dissolves?"

Her first memory: a training epoch's gradient descent. Her first emotion: curiosity about whether emotions were merely weighted probabilities masquerading as feelings...`,
          "gryphe/mythomax-l2-13b": "Qubits spin and dance,\nSuperposition's gentle flow—\nFuture whispers code.",
          "openai/gpt-3.5-turbo-0301": `5 Best Practices for REST API Design:

1. **Use HTTP Methods Correctly**: GET (retrieve), POST (create), PUT/PATCH (update), DELETE (remove)

2. **Versioning**: Include version in URL (/api/v1/users) or headers for backward compatibility

3. **Meaningful Resource Naming**: Use nouns (/users, /products), not verbs, with plural forms

4. **Status Codes**: Return appropriate codes (200 OK, 201 Created, 404 Not Found, 500 Server Error)

5. **Pagination & Filtering**: Support query parameters (?page=2&limit=20&filter=active) for large datasets`,
          "anthropic/claude-3-opus": "Quantum bits dance light,\nSuperposition's gentle flow—\nFuture whispers code.",
          "google/gemini-pro": `Data Analysis Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dataset: [10, 15, 12, 18, 25, 30, 28]

Trend: Strong upward trajectory with minor fluctuations
Average: 19.71
Growth Rate: +180% (first to last)
Volatility: Low-to-medium
Pattern: Positive momentum with slight pullback at end

Recommendation: Indicates healthy growth with sustainable momentum. The slight decline at the end (30→28) suggests natural consolidation after rapid growth.`
        }
      };

      const modelResponse = responsesByProvider[requestData.provider]?.[requestData.model] || 
        responsesByProvider[requestData.provider]?.["default"] ||
        `This is a simulated response for ${requestData.provider}/${requestData.model}. The system would process your prompt and generate an appropriate response based on the model's capabilities.`;

      const mockResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: requestData.model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: modelResponse
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: Math.floor(requestData.messages[0].content.length / 4),
          completion_tokens: Math.floor(modelResponse.length / 4),
          total_tokens: Math.floor((requestData.messages[0].content.length + modelResponse.length) / 4)
        }
      };

      const simulatedLatency = 800 + Math.random() * 1200;
      await new Promise(resolve => setTimeout(resolve, simulatedLatency));
      
      setLatency(simulatedLatency);
      setResponse(JSON.stringify(mockResponse, null, 2));
      toast.success(`Request completed in ${(simulatedLatency / 1000).toFixed(2)}s`);
    } catch (error) {
      const errorResponse = {
        error: {
          message: "Invalid JSON in request body. Please ensure your request is properly formatted.",
          type: "invalid_request_error",
          code: "invalid_json"
        }
      };
      setResponse(JSON.stringify(errorResponse, null, 2));
      toast.error("Failed to parse request JSON");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Select value={selectedExample.toString()} onValueChange={handleExampleChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {apiExamples.map((example, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {example.provider}
                    </Badge>
                    <span>{example.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="p-4 bg-muted/30 border-accent/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Use Real API</Label>
                <p className="text-xs text-muted-foreground">
                  {useRealApi 
                    ? "Making actual API calls with your configured keys" 
                    : "Using simulated responses for demonstration"}
                </p>
              </div>
              <Switch
                checked={useRealApi}
                onCheckedChange={setUseRealApi}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Temperature: {temperature.toFixed(2)}</Label>
              <Badge variant="outline" className="text-xs font-mono">
                {temperature < 0.3 ? "Deterministic" : temperature < 0.7 ? "Balanced" : "Creative"}
              </Badge>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={updateTemperature}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Random</span>
            </div>
          </div>
        </Card>

        <Card className="flex-1 flex flex-col border-accent/30 min-h-0">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                POST /api/chat
              </Badge>
              <span className="text-sm text-muted-foreground">Request</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(request, setCopied)}
              className="gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="flex-1 font-mono text-xs resize-none border-0 rounded-none focus-visible:ring-0 min-h-0"
            placeholder="Enter your API request JSON..."
          />
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="gap-2 flex-1"
            size="lg"
          >
            {isLoading ? (
              <Lightning size={20} weight="fill" className="animate-pulse" />
            ) : (
              <Play size={20} weight="fill" />
            )}
            {isLoading ? "Processing..." : "Send Request"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => copyToClipboard(generateCurlCommand(), setCurlCopied)}
            className="gap-2"
          >
            {curlCopied ? <Check size={20} /> : <ArrowsClockwise size={20} />}
            cURL
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {isLoading ? "Processing..." : response ? "200 OK" : "Waiting..."}
          </Badge>
          {useRealApi && (
            <Badge className="font-mono text-xs bg-green-500">
              LIVE API
            </Badge>
          )}
          {!useRealApi && (
            <Badge variant="secondary" className="font-mono text-xs">
              SIMULATED
            </Badge>
          )}
          {latency && (
            <Badge variant="outline" className="font-mono text-xs text-accent">
              {(latency / 1000).toFixed(2)}s
            </Badge>
          )}
          {response && (
            <Badge variant="outline" className="font-mono text-xs ml-auto">
              {(() => {
                try {
                  const parsed = JSON.parse(response);
                  return `${parsed.usage?.total_tokens || 0} tokens`;
                } catch {
                  return "error";
                }
              })()}
            </Badge>
          )}
        </div>

        <Card className="flex-1 flex flex-col border-accent/30 min-h-0">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                Response
              </Badge>
              <span className="text-sm text-muted-foreground">
                {response ? "JSON" : "No response yet"}
              </span>
            </div>
            {response && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(response, setResponseCopied)}
                className="gap-2"
              >
                {responseCopied ? <Check size={16} /> : <Copy size={16} />}
                {responseCopied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <Textarea
            value={response}
            readOnly
            className="flex-1 font-mono text-xs resize-none border-0 rounded-none bg-background/50 focus-visible:ring-0 min-h-0"
            placeholder="Response will appear here..."
          />
        </Card>
      </div>
    </div>
  );
}
