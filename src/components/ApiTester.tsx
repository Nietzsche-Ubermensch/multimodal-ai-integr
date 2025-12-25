import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Copy, Check, Lightning, ArrowsClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

interface ApiExample {
  provider: string;
  model: string;
  request: string;
  description: string;
}

const apiExamples: ApiExample[] = [
  {
    provider: "deepseek",
    model: "deepseek-chat",
    description: "Math reasoning with DeepSeek",
    request: JSON.stringify({
      provider: "deepseek",
      model: "deepseek-chat",
      messages: [
        { role: "user", content: "Explain the quadratic formula in simple terms" }
      ],
      temperature: 0.7
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "anthropic/claude-3-opus",
    description: "Creative writing with Claude",
    request: JSON.stringify({
      provider: "openrouter",
      model: "anthropic/claude-3-opus",
      messages: [
        { role: "user", content: "Write a haiku about quantum computing" }
      ],
      temperature: 0.9
    }, null, 2)
  },
  {
    provider: "xai",
    model: "grok-1",
    description: "Conversational AI with Grok",
    request: JSON.stringify({
      provider: "xai",
      model: "grok-1",
      messages: [
        { role: "user", content: "What's the latest in AI research?" }
      ],
      temperature: 0.8
    }, null, 2)
  },
  {
    provider: "nvidia",
    model: "llama-3-70b-instruct",
    description: "Code generation with Llama",
    request: JSON.stringify({
      provider: "nvidia",
      model: "llama-3-70b-instruct",
      messages: [
        { role: "user", content: "Write a Python function to calculate fibonacci numbers" }
      ],
      temperature: 0.5
    }, null, 2)
  },
  {
    provider: "deepseek",
    model: "deepseek-coder",
    description: "Code optimization with DeepSeek Coder",
    request: JSON.stringify({
      provider: "deepseek",
      model: "deepseek-coder",
      messages: [
        { role: "user", content: "Optimize this code: for i in range(len(arr)): print(arr[i])" }
      ],
      temperature: 0.3
    }, null, 2)
  },
  {
    provider: "openrouter",
    model: "google/gemini-pro",
    description: "Data analysis with Gemini",
    request: JSON.stringify({
      provider: "openrouter",
      model: "google/gemini-pro",
      messages: [
        { role: "user", content: "Analyze this dataset trend: [10, 15, 12, 18, 25, 30, 28]" }
      ],
      temperature: 0.4
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
      
      const responsesByProvider: Record<string, Record<string, string>> = {
        deepseek: {
          "deepseek-chat": "DeepSeek's advanced reasoning capabilities allow me to break down complex problems systematically. For your question about the quadratic formula, it's essentially a method to solve equations in the form ax² + bx + c = 0. The formula x = (-b ± √(b²-4ac))/2a gives us the two possible solutions (roots) for x. The discriminant (b²-4ac) tells us about the nature of the roots: if positive, we have two real solutions; if zero, one repeated solution; if negative, complex solutions.",
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
        openrouter: {
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
        },
        xai: {
          "grok-1": "AI research is advancing rapidly! Recent breakthroughs include multimodal transformers like GPT-4V, improved reasoning with chain-of-thought prompting, and efficient inference techniques. The field is also seeing innovations in open-source models like Llama 3 and DeepSeek, democratizing access to powerful AI. Notable developments: mixture-of-experts architectures, reinforcement learning from human feedback (RLHF), and constitutional AI for alignment.",
          "grok-2": "The AI landscape in 2024 is characterized by several key trends: (1) Multimodal integration—models handling text, image, audio, and video simultaneously; (2) Efficiency improvements—quantization and distillation making large models accessible; (3) Specialized reasoning models like DeepSeek-Math achieving SOTA on mathematical tasks; (4) Privacy-focused inference through platforms like Venice AI; (5) Open-source momentum with models like Mistral and Qwen competing with proprietary solutions."
        },
        nvidia: {
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
    
    return fib[n]

# Example usage
print(fibonacci(10))  # Output: 55

# For better space complexity O(1):
def fibonacci_optimized(n: int) -> int:
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr`
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
