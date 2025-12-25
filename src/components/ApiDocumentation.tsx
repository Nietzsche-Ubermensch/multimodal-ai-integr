import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Terminal } from "@phosphor-icons/react";
import { toast } from "sonner";

interface EndpointDoc {
  method: string;
  path: string;
  description: string;
  curlExample: string;
  responseExample: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: "POST",
    path: "/api/chat",
    description: "Send a chat completion request to any supported AI provider",
    curlExample: `curl -X POST https://api.example.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "provider": "deepseek",
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "user",
        "content": "Explain machine learning"
      }
    ],
    "temperature": 0.7
  }'`,
    responseExample: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Machine learning is a subset of AI..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 75,
    "total_tokens": 90
  }
}`
  },
  {
    method: "GET",
    path: "/api/config",
    description: "Retrieve available providers and their active status",
    curlExample: `curl -X GET https://api.example.com/api/config \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    responseExample: `{
  "providers": {
    "deepseek": {
      "available": true,
      "models": ["deepseek-chat", "deepseek-coder"]
    },
    "openrouter": {
      "available": true,
      "models": ["anthropic/claude-3-opus", "google/gemini-pro"]
    },
    "xai": {
      "available": true,
      "models": ["grok-1", "grok-2"]
    },
    "nvidia": {
      "available": true,
      "models": ["llama-3-70b-instruct"]
    }
  },
  "timestamp": 1677652288
}`
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Check API service health and latency metrics",
    curlExample: `curl -X GET https://api.example.com/api/health`,
    responseExample: `{
  "status": "healthy",
  "uptime": 3600,
  "providers": {
    "deepseek": {
      "status": "operational",
      "latency_ms": 150
    },
    "openrouter": {
      "status": "operational",
      "latency_ms": 200
    },
    "xai": {
      "status": "operational",
      "latency_ms": 180
    },
    "nvidia": {
      "status": "operational",
      "latency_ms": 120
    }
  },
  "timestamp": 1677652288
}`
  }
];

export function ApiDocumentation() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<"curl" | "response" | null>(null);

  const copyToClipboard = async (text: string, index: number, type: "curl" | "response") => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedType(type);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedType(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {endpoints.map((endpoint, index) => (
        <Card key={index} className="border-l-4 border-accent">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <code className="text-lg font-mono text-accent">{endpoint.path}</code>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
            </div>

            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curl" className="gap-2">
                  <Terminal size={16} />
                  cURL Example
                </TabsTrigger>
                <TabsTrigger value="response" className="gap-2">
                  <Code size={16} />
                  Response
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="mt-4">
                <div className="relative">
                  <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono">
                    <code>{endpoint.curlExample}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.curlExample, index, "curl")}
                    className="absolute top-2 right-2 gap-2"
                  >
                    {copiedIndex === index && copiedType === "curl" ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                <div className="relative">
                  <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono">
                    <code>{endpoint.responseExample}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.responseExample, index, "response")}
                    className="absolute top-2 right-2 gap-2"
                  >
                    {copiedIndex === index && copiedType === "response" ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      ))}
    </div>
  );
}
