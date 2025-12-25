import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  GithubLogo, 
  GitBranch, 
  Star, 
  GitFork,
  ArrowSquareOut,
  Code,
  FileCode,
  BookOpen
} from "@phosphor-icons/react";

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
    description: "Example code and guides for using Grok models via the xAI API",
    stars: "892",
    category: "Documentation",
    url: "https://github.com/xai-org/xai-cookbook",
    highlights: [
      "Advanced prompting techniques for Grok",
      "Web search integration examples",
      "Multimodal (vision) usage patterns",
      "Rate limiting and optimization strategies"
    ],
    quickStart: `import anthropic

client = anthropic.Anthropic(
    base_url="https://api.x.ai/v1",
    api_key="xai-..."
)

response = client.messages.create(
    model="grok-4-fast",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Analyze this image"}]
)`
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

  return (
    <div className="space-y-6">
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
