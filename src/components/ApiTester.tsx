import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Check, Lightning } from "@phosphor-icons/react";
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
  }
];

export function ApiTester() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [request, setRequest] = useState(apiExamples[0].request);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const handleExampleChange = (value: string) => {
    const index = parseInt(value);
    setSelectedExample(index);
    setRequest(apiExamples[index].request);
    setResponse("");
    setLatency(null);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse("");
    
    try {
      const requestData = JSON.parse(request);
      
      const responsesByProvider: Record<string, string> = {
        deepseek: "DeepSeek's advanced reasoning capabilities allow me to break down complex problems systematically. For your question about the quadratic formula, it's essentially a method to solve equations in the form ax² + bx + c = 0. The formula x = (-b ± √(b²-4ac))/2a gives us the two possible solutions (roots) for x.",
        openrouter: "Quantum bits dance light,\nSuperposition's gentle flow—\nFuture whispers code.",
        xai: "AI research is advancing rapidly! Recent breakthroughs include multimodal transformers like GPT-4V, improved reasoning with chain-of-thought prompting, and efficient inference techniques. The field is also seeing innovations in open-source models like Llama 3 and DeepSeek, democratizing access to powerful AI.",
        nvidia: `def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number using dynamic programming."""
    if n <= 1:
        return n
    
    fib = [0] * (n + 1)
    fib[1] = 1
    
    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib[n]

# Example usage
print(fibonacci(10))  # Output: 55`
      };

      const providerResponse = responsesByProvider[requestData.provider as keyof typeof responsesByProvider] || 
        `This is a simulated response for ${requestData.provider}/${requestData.model}. The system would process your prompt and generate an appropriate response.`;

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
              content: providerResponse
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: Math.floor(requestData.messages[0].content.length / 4),
          completion_tokens: Math.floor(providerResponse.length / 4),
          total_tokens: Math.floor((requestData.messages[0].content.length + providerResponse.length) / 4)
        }
      };

      const simulatedLatency = 1200 + Math.random() * 800;
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

        <Card className="flex-1 flex flex-col border-accent/30">
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
            className="flex-1 font-mono text-xs resize-none border-0 rounded-none focus-visible:ring-0"
            placeholder="Enter your API request JSON..."
          />
        </Card>

        <Button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="gap-2"
          size="lg"
        >
          {isLoading ? (
            <Lightning size={20} weight="fill" className="animate-pulse" />
          ) : (
            <Play size={20} weight="fill" />
          )}
          {isLoading ? "Processing..." : "Send Request"}
        </Button>
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
        </div>

        <Card className="flex-1 flex flex-col border-accent/30">
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
            className="flex-1 font-mono text-xs resize-none border-0 rounded-none bg-background/50 focus-visible:ring-0"
            placeholder="Response will appear here..."
          />
        </Card>
      </div>
    </div>
  );
}
