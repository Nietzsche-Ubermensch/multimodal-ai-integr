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
    curlExample: `curl -X POST https://openrouter.ai/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -d '{
    "model": "deepseek/deepseek-chat-v3-0324",
    "messages": [
      {
        "role": "user",
        "content": "Explain machine learning"
      }
    ],
    "temperature": 0.7
  }'`,
    pythonExample: `import os
from litellm import completion

response = completion(
    model="deepseek/deepseek-chat-v3-0324",
    messages=[
        {"role": "user", "content": "Explain machine learning"}
    ],
    temperature=0.7,
    api_key=os.environ["OPENROUTER_API_KEY"]
)

print(response.choices[0].message.content)`,
    responseExample: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "deepseek-chat-v3-0324",
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
    method: "POST",
    path: "/api/embeddings",
    description: "Generate vector embeddings for text using specialized embedding models",
    parameters: [
      { name: "model", type: "string", required: true, description: "Embedding model: google/gemini-embedding-001, openai/text-embedding-3-large" },
      { name: "input", type: "string | array", required: true, description: "Text string or array of strings to embed" },
      { name: "dimensions", type: "number", required: false, description: "Output dimensions (model-specific, e.g., 768 for Gemini)" }
    ],
    curlExample: `curl -X POST https://openrouter.ai/api/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -d '{
    "model": "google/gemini-embedding-001",
    "input": "What is quantum computing?"
  }'`,
    pythonExample: `import os
import requests
import numpy as np

def get_embeddings(texts: list[str], model: str = "google/gemini-embedding-001"):
    response = requests.post(
        "https://openrouter.ai/api/v1/embeddings",
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json"
        },
        json={"model": model, "input": texts}
    )
    return [item["embedding"] for item in response.json()["data"]]

# Generate embeddings
embeddings = get_embeddings(["What is AI?", "Machine learning basics"])

# Calculate cosine similarity for semantic search
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

similarity = cosine_similarity(embeddings[0], embeddings[1])
print(f"Similarity: {similarity:.4f}")`,
    responseExample: `{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.006929283495992422,
        -0.005336422007530928,
        0.014355673082172871,
        ...  // 768 dimensions total for Gemini
      ]
    }
  ],
  "model": "google/gemini-embedding-001",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}`,
    errorExample: `{
  "error": {
    "message": "Model not found or not available",
    "type": "invalid_request_error",
    "code": "model_not_found"
  }
}`
  },
  {
    method: "GET",
    path: "/api/models",
    description: "List all available models across providers with capabilities and pricing",
    parameters: [],
    curlExample: `curl -X GET https://openrouter.ai/api/v1/models \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY"`,
    pythonExample: `import requests
import os

response = requests.get(
    "https://openrouter.ai/api/v1/models",
    headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"}
)

models = response.json()["data"]

# Filter for specific capabilities
reasoning_models = [
    m for m in models 
    if "deepseek" in m["id"] or "grok" in m["id"]
]

for model in reasoning_models[:5]:
    print(f"{model['id']}: {model['context_length']} tokens")`,
    responseExample: `{
  "data": [
    {
      "id": "deepseek/deepseek-chat-v3-0324",
      "name": "DeepSeek Chat V3",
      "created": 1710979200,
      "context_length": 65536,
      "pricing": {
        "prompt": "0.00000027",
        "completion": "0.0000011"
      },
      "top_provider": {
        "max_completion_tokens": 4096
      }
    },
    {
      "id": "x-ai/grok-4-fast",
      "name": "Grok 4 Fast",
      "context_length": 65536,
      "pricing": {
        "prompt": "0.000005",
        "completion": "0.000015"
      }
    }
  ]
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
      "models": ["deepseek-chat-v3-0324", "deepseek-r1", "deepseek-coder"]
    },
    "openrouter": {
      "available": true,
      "models": ["microsoft/phi-4", "microsoft/wizardlm-2-8x22b"]
    },
    "xai": {
      "available": true,
      "models": ["grok-4-fast", "grok-code-fast-1"]
    },
    "nvidia": {
      "available": true,
      "models": ["nemotron-nano-9b-v2"]
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
              <TabsList className={`grid w-full ${endpoint.pythonExample && endpoint.errorExample ? 'grid-cols-4' : endpoint.pythonExample || endpoint.errorExample ? 'grid-cols-3' : 'grid-cols-2'}`}>
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
