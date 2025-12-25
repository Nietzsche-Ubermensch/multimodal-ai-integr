import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Code, Terminal, Info } from "@phosphor-icons/react";
import { toast } from "sonner";

interface EndpointDoc {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  curlExample: string;
  pythonExample?: string;
  responseExample: string;
  errorExample?: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: "POST",
    path: "/api/chat",
    description: "Send a chat completion request to any supported AI provider",
    parameters: [
      { name: "provider", type: "string", required: true, description: "AI provider: deepseek, openrouter, xai, nvidia" },
      { name: "model", type: "string", required: true, description: "Model identifier specific to the provider" },
      { name: "messages", type: "array", required: true, description: "Array of message objects with role and content" },
      { name: "temperature", type: "number", required: false, description: "Sampling temperature (0-1). Default: 0.7" },
      { name: "max_tokens", type: "number", required: false, description: "Maximum tokens to generate" }
    ],
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
    pythonExample: `import requests

url = "https://api.example.com/api/chat"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "messages": [
        {"role": "user", "content": "Explain machine learning"}
    ],
    "temperature": 0.7
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
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
}`,
    errorExample: `{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}`
  },
  {
    method: "GET",
    path: "/api/config",
    description: "Retrieve available providers and their active status",
    parameters: [],
    curlExample: `curl -X GET https://api.example.com/api/config \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    pythonExample: `import requests

url = "https://api.example.com/api/config"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
config = response.json()
print(f"Available providers: {list(config['providers'].keys())}")`,
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
    parameters: [],
    curlExample: `curl -X GET https://api.example.com/api/health`,
    pythonExample: `import requests

response = requests.get("https://api.example.com/api/health")
health = response.json()

if health["status"] == "healthy":
    print("✓ Service operational")
    for provider, metrics in health["providers"].items():
        print(f"  {provider}: {metrics['latency_ms']}ms")`,
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
  const [copiedType, setCopiedType] = useState<"curl" | "python" | "response" | "error" | null>(null);

  const copyToClipboard = async (text: string, index: number, type: "curl" | "python" | "response" | "error") => {
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
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {endpoints.map((endpoint, index) => (
        <Card key={index} className="border-l-4 border-accent">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <code className="text-lg font-mono text-accent">{endpoint.path}</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>
                
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Info size={16} className="text-accent" />
                        <span className="text-sm font-semibold">Parameters</span>
                      </div>
                      {endpoint.parameters.map((param, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <code className="text-accent font-mono bg-accent/10 px-2 py-0.5 rounded">
                            {param.name}
                          </code>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  required
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curl" className="gap-2">
                  <Terminal size={16} />
                  cURL
                </TabsTrigger>
                {endpoint.pythonExample && (
                  <TabsTrigger value="python" className="gap-2">
                    <Code size={16} />
                    Python
                  </TabsTrigger>
                )}
                <TabsTrigger value="response" className="gap-2">
                  <Check size={16} />
                  Success
                </TabsTrigger>
                {endpoint.errorExample && (
                  <TabsTrigger value="error" className="gap-2">
                    <Info size={16} />
                    Error
                  </TabsTrigger>
                )}
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

              {endpoint.pythonExample && (
                <TabsContent value="python" className="mt-4">
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono">
                      <code>{endpoint.pythonExample}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.pythonExample!, index, "python")}
                      className="absolute top-2 right-2 gap-2"
                    >
                      {copiedIndex === index && copiedType === "python" ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}

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

              {endpoint.errorExample && (
                <TabsContent value="error" className="mt-4">
                  <div className="relative">
                    <pre className="bg-background border border-destructive/50 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                      <code>{endpoint.errorExample}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(endpoint.errorExample!, index, "error")}
                      className="absolute top-2 right-2 gap-2"
                    >
                      {copiedIndex === index && copiedType === "error" ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </Card>
      ))}
    </div>
  );
}
