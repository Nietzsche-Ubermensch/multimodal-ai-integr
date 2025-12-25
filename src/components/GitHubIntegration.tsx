import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  GithubLogo, 
  GitBranch, 
  Star, 
  GitFork,
  ArrowSquareOut,
  Code,
  FileCode,
  BookOpen,
  Play,
  Sparkle,
  ArrowsClockwise,
  Copy,
  Check
} from "@phosphor-icons/react";
import { testOpenRouterSDK } from "@/lib/openrouter-sdk";
import { useKV } from "@github/spark/hooks";
import { toast } from "sonner";

interface Repository {
  name: string;
  owner: string;
  description: string;
  stars: string;
  category: string;
  url: string;
  highlights: string[];
  quickStart: string;
}

const repositories: Repository[] = [
  {
    name: "anthropic-sdk-typescript",
    owner: "anthropics",
    description: "Official Anthropic TypeScript SDK for Claude with streaming, vision, and tool use capabilities",
    stars: "1.6k",
    category: "⭐ Featured",
    url: "https://github.com/anthropics/anthropic-sdk-typescript",
    highlights: [
      "Official Anthropic SDK with full type safety",
      "Claude 3.5 Sonnet, Haiku, and Opus support",
      "Vision API for image understanding",
      "Tool use and function calling support"
    ],
    quickStart: `npm install @anthropic-ai/sdk

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Explain AI' }],
});`
  },
  {
    name: "typescript-sdk",
    owner: "OpenRouterTeam",
    description: "Official OpenRouter TypeScript SDK with Vercel AI integration - stream responses from 100+ LLMs",
    stars: "2.8k",
    category: "⭐ Featured",
    url: "https://github.com/OpenRouterTeam/typescript-sdk",
    highlights: [
      "Official TypeScript SDK with full type safety",
      "Vercel AI SDK integration for streaming",
      "Drop-in replacement for OpenAI SDK",
      "Support for all OpenRouter models (GPT-4, Claude, DeepSeek, Grok, etc.)"
    ],
    quickStart: `npm install @openrouter/ai-sdk-provider ai openai

// Next.js App Router example
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

const { textStream } = await streamText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages: [{ role: 'user', content: 'Hello!' }]
});`
  },
  {
    name: "DeepSeek-V3",
    owner: "deepseek-ai",
    description: "DeepSeek-V3 671B MoE model - powerful open-source reasoning and chat model",
    stars: "5.8k",
    category: "⭐ Featured",
    url: "https://github.com/deepseek-ai/DeepSeek-V3",
    highlights: [
      "671B total parameters (37B active per token)",
      "Mixture-of-Experts architecture for efficiency",
      "Competitive with GPT-4 on many benchmarks",
      "OpenAI-compatible API endpoint"
    ],
    quickStart: `npm install openai

import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const completion = await deepseek.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Solve this...' }],
});`
  },
  {
    name: "litellm",
    owner: "BerriAI",
    description: "Call 100+ LLM APIs in OpenAI format. Use Bedrock, Azure, OpenAI, Cohere, Anthropic, Ollama, Sagemaker, HuggingFace, Replicate, etc.",
    stars: "15.2k",
    category: "Orchestration",
    url: "https://github.com/BerriAI/litellm",
    highlights: [
      "Unified completion() interface for 100+ models",
      "Automatic fallback, retries, and load balancing",
      "Built-in cost tracking and budget controls",
      "Production-ready proxy server with caching"
    ],
    quickStart: `pip install litellm
export OPENROUTER_API_KEY="sk-or-..."

# Python usage
from litellm import completion
response = completion(
    model="deepseek/deepseek-chat",
    messages=[{"role": "user", "content": "Hello!"}]
)`
  },
  {
    name: "ai-sdk-provider",
    owner: "OpenRouterTeam",
    description: "OpenRouter provider for the Vercel AI SDK - enables streaming with 100+ models",
    stars: "1.8k",
    category: "Integration",
    url: "https://github.com/OpenRouterTeam/ai-sdk-provider",
    highlights: [
      "First-class Vercel AI SDK integration",
      "Streaming support with Server-Sent Events (SSE)",
      "Type-safe model configurations",
      "Automatic OpenAI compatibility layer"
    ],
    quickStart: `npm install @openrouter/ai-sdk-provider ai

// TypeScript/Next.js usage
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

const { text } = await generateText({
  model: openrouter('deepseek/deepseek-chat'),
  prompt: 'Explain quantum computing'
});`
  },
  {
    name: "DeepSeek-Math-V2",
    owner: "deepseek-ai",
    description: "Mathematical reasoning model achieving state-of-the-art performance on MATH and competition-level problems",
    stars: "4.2k",
    category: "Models",
    url: "https://github.com/deepseek-ai/DeepSeek-Math",
    highlights: [
      "SOTA on MATH benchmark (90.2% accuracy)",
      "Specialized for symbolic math and proofs",
      "Available in 7B and 67B parameter sizes",
      "HuggingFace transformers compatible"
    ],
    quickStart: `from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/deepseek-math-7b-instruct",
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-math-7b-instruct")

inputs = tokenizer("Prove Fermat's Last Theorem for n=3", return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=2048)`
  },
  {
    name: "xai-cookbook",
    owner: "xai-org",
    description: "Example code and guides for using Grok models via the xAI API with web search capabilities",
    stars: "892",
    category: "Documentation",
    url: "https://github.com/xai-org/xai-cookbook",
    highlights: [
      "Advanced prompting techniques for Grok",
      "Web search integration examples",
      "Multimodal (vision) usage patterns",
      "Real-time data access demonstrations"
    ],
    quickStart: `npm install openai

import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const completion = await xai.chat.completions.create({
  model: 'grok-beta',
  messages: [{ role: 'user', content: 'Latest tech news?' }],
});`
  },
  {
    name: "api-docs",
    owner: "veniceai",
    description: "Privacy-first AI inference platform with enterprise-grade security",
    stars: "1.1k",
    category: "Privacy",
    url: "https://github.com/veniceai/api-docs",
    highlights: [
      "Zero data retention policy",
      "On-premise deployment options",
      "GDPR and SOC 2 compliant",
      "End-to-end encryption"
    ],
    quickStart: `curl https://api.venice.ai/v1/chat/completions \\
  -H "Authorization: Bearer venice-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.3-70b",
    "messages": [{"role": "user", "content": "Hello"}],
    "privacy_mode": "strict"
  }'`
  },
  {
    name: "3FS",
    owner: "deepseek-ai",
    description: "High-performance distributed file system designed for AI training at exascale",
    stars: "678",
    category: "Infrastructure",
    url: "https://github.com/deepseek-ai/3FS",
    highlights: [
      "10x faster than traditional NFS for AI workloads",
      "Designed for trillion-parameter model training",
      "Automatic sharding and replication",
      "Kubernetes-native deployment"
    ],
    quickStart: `# Deploy 3FS on Kubernetes
kubectl apply -f https://raw.githubusercontent.com/deepseek-ai/3FS/main/deploy/k8s-deployment.yaml

# Mount in training job
volumes:
  - name: training-data
    persistentVolumeClaim:
      claimName: 3fs-pvc`
  },
  {
    name: "dataset-viewer",
    owner: "huggingface",
    description: "Fast dataset inspection and preview tool for HuggingFace datasets",
    stars: "5.3k",
    category: "Tools",
    url: "https://github.com/huggingface/dataset-viewer",
    highlights: [
      "Web-based dataset exploration",
      "Automatic schema detection",
      "Sample data preview without downloading",
      "Statistics and distribution analysis"
    ],
    quickStart: `from datasets import load_dataset

# Stream dataset without downloading
dataset = load_dataset(
    "deepseek-ai/DeepSeek-Math-Corpus",
    split="train",
    streaming=True
)

for sample in dataset.take(5):
    print(sample)`
  }
];

export function GitHubIntegration() {
  const categories = Array.from(new Set(repositories.map(r => r.category)));
  const [testingSDK, setTestingSDK] = useState(false);
  const [sdkTestResult, setSDKTestResult] = useState<string | null>(null);
  const [apiKey, setApiKey] = useKV<string>("openrouter-sdk-test-key", "");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [showSDKTest, setShowSDKTest] = useState(false);

  const handleTestSDK = async () => {
    if (!apiKey || !apiKey.startsWith("sk-or-")) {
      toast.error("Please enter a valid OpenRouter API key (starts with sk-or-)");
      return;
    }

    setTestingSDK(true);
    setSDKTestResult(null);

    try {
      const result = await testOpenRouterSDK(apiKey);
      
      if (result.success) {
        setSDKTestResult(`✓ SDK Test Successful!\n\nResponse: ${result.response}\nLatency: ${result.latency}ms`);
        toast.success("OpenRouter TypeScript SDK working correctly!");
      } else {
        setSDKTestResult(`✗ SDK Test Failed\n\nError: ${result.error}\nLatency: ${result.latency}ms`);
        toast.error("SDK test failed - check your API key");
      }
    } catch (error) {
      setSDKTestResult(`✗ SDK Test Error\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Failed to test SDK");
    } finally {
      setTestingSDK(false);
    }
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-accent bg-accent/10">
        <Sparkle className="h-5 w-5 text-accent" />
        <AlertDescription className="ml-2 flex items-center justify-between">
          <span>
            <strong>Featured:</strong> Test the OpenRouter TypeScript SDK live with your API key!
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowSDKTest(!showSDKTest)}
            className="gap-2 ml-4"
          >
            <Play size={14} weight="fill" />
            {showSDKTest ? "Hide" : "Show"} SDK Test
          </Button>
        </AlertDescription>
      </Alert>

      {showSDKTest && (
        <Card className="p-6 border-accent bg-accent/5">
          <div className="flex items-center gap-3 mb-4">
            <Sparkle size={24} weight="fill" className="text-accent" />
            <h3 className="text-xl font-bold">OpenRouter TypeScript SDK - Live Test</h3>
          </div>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Test the official OpenRouter TypeScript SDK with a real API call. Your API key is stored locally in your browser and never sent to our servers.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">OpenRouter API Key</label>
              <Input
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">openrouter.ai/keys</a>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTestSDK}
                disabled={!apiKey || testingSDK}
                className="gap-2"
              >
                {testingSDK ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin" />
                    Testing SDK...
                  </>
                ) : (
                  <>
                    <Play size={16} weight="fill" />
                    Test SDK Integration
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleCopyCommand("npm install @openrouter/ai-sdk-provider ai openai", "install")}
                className="gap-2"
              >
                {copiedCmd === "install" ? <Check size={16} /> : <Copy size={16} />}
                Copy Install Command
              </Button>
            </div>

            {sdkTestResult && (
              <Card className="p-4 bg-muted border-accent">
                <pre className="text-sm whitespace-pre-wrap font-mono">{sdkTestResult}</pre>
              </Card>
            )}
          </div>
        </Card>
      )}

      {categories.map(category => (
        <div key={category}>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-sm font-mono px-4 py-1">
              {category}
            </Badge>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {repositories
              .filter(repo => repo.category === category)
              .map(repo => (
                <Card key={repo.name} className="p-6 bg-card/50 border-l-4 border-accent hover:bg-card/70 transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <GithubLogo size={32} weight="fill" className="text-accent" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
                              {repo.owner}/{repo.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => window.open(repo.url, '_blank')}
                            >
                              <ArrowSquareOut size={16} />
                              View on GitHub
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {repo.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star size={16} weight="fill" className="text-accent" />
                          <span className="font-mono text-sm">{repo.stars}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={16} className="text-accent" />
                          <span className="text-sm font-semibold">Key Features</span>
                        </div>
                        <ul className="space-y-1">
                          {repo.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-accent mt-1">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Code size={16} className="text-accent" />
                          <span className="text-sm font-semibold">Quick Start</span>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-auto max-h-40">
                          <pre className="text-foreground/80 whitespace-pre-wrap">
                            {repo.quickStart}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
