import { SlideData } from "@/types/slides";

export const slides: SlideData[] = [
  {
    id: "cover",
    title: "Multimodal AI Integration Platform",
    subtitle: "Architecting Next-Gen AI Solutions with DeepSeek, OpenRouter & Python",
    bullets: [
      "Technical Deep Dive",
      "Implementation Strategies",
      "Scalable Architecture"
    ]
  },
  {
    id: "toc",
    title: "Agenda",
    bullets: [
      "Platform Overview: DeepSeek & OpenRouter",
      "Model Endpoints Catalog (13+ Models)",
      "Embedding Models & Configuration",
      "API Key Validation (Interactive)",
      "Live API Testing (Interactive)",
      "Embedding Generation (Interactive)",
      "API Reference Documentation (Interactive)",
      "Environment Variable Setup (Interactive)",
      "Python Integration Patterns (LiteLLM)",
      "Best Practices: Security & Scale",
      "GitHub Repository Integration (Interactive)",
      "Deployment Guides (Interactive)",
      "Resources & Repositories"
    ]
  },
  {
    id: "platform-overview",
    title: "Platform Overview",
    subtitle: "DeepSeek & OpenRouter Capabilities",
    bullets: [
      "DeepSeek: Advanced reasoning with Mixture-of-Experts (MoE) architecture—650B parameters, 37B active",
      "OpenRouter: Unified API gateway providing standardized access to 100+ AI models from multiple providers",
      "Multimodal Processing: Text, code, vision (image understanding), and embeddings across both platforms",
      "Critical Role: Enables model flexibility, cost optimization, and failover resilience in production AI systems"
    ]
  },
  {
    id: "deepseek",
    title: "DeepSeek Platform",
    subtitle: "Advanced Open-Source Intelligence",
    bullets: [
      "DeepSeek-R1: 671B parameter MoE model with reinforcement learning for complex reasoning",
      "DeepSeek-V3: 685B total parameters (37B active) optimized for efficiency and speed",
      "DeepSeek-Math-V2: State-of-the-art mathematical reasoning and symbolic computation",
      "3FS File System: Distributed storage infrastructure for high-performance AI training at scale",
      "Open weights on HuggingFace—full model transparency and self-hosting capabilities"
    ],
    code: `# Example: Loading DeepSeek Math Model
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-math-7b-instruct")
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/deepseek-math-7b-instruct")

input_text = "Prove that the sum of primes is infinite."
inputs = tokenizer(input_text, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=512)`
  },
  {
    id: "openrouter",
    title: "OpenRouter Platform",
    subtitle: "Unified API Gateway for LLMs",
    bullets: [
      "OpenAI-Compatible API: Drop-in replacement for OpenAI SDK with baseURL override",
      "100+ Models: GPT-4, Claude 3.5, Llama 3.3, Gemini 2.0, DeepSeek, Grok, and more",
      "Intelligent Routing: Automatic model selection, fallback handling, and load balancing",
      "Transparent Pricing: Pay-per-token with real-time cost tracking and budget controls",
      "ai-sdk-provider: First-class integration with Vercel AI SDK for streaming responses"
    ],
    code: `// OpenRouter Configuration
const openRouterConfig = {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://your-site.com",
    "X-Title": "Multimodal Platform"
  }
};`
  },
  {
    id: "model-endpoints-1",
    title: "Model Endpoints Catalog (Part 1)",
    subtitle: "xAI, Xiaomi, NVIDIA Models",
    bullets: [
      "x-ai/grok-code-fast-1: Optimized for rapid code generation and technical documentation (128k context)",
      "xiaomi/mimo-v2-flash:free: Free-tier multimodal model supporting text + image inputs (8k context)",
      "nvidia/nemotron-nano-9b-v2: Compact 9B parameter model for edge deployment and low-latency inference",
      "x-ai/grok-4-fast: High-speed variant of Grok-4 for real-time conversational AI (64k context)",
      "x-ai/grok-4: Full Grok-4 model with enhanced reasoning and web search capabilities (128k context)"
    ]
  },
  {
    id: "model-endpoints-2",
    title: "Model Endpoints Catalog (Part 2)",
    subtitle: "DeepSeek & Community Models",
    bullets: [
      "deepseek/deepseek-chat-v3-0324: Latest production chat model with improved instruction following (64k context)",
      "tngtech/deepseek-r1t2-chimera: Experimental reasoning model combining R1 and V2 architectures",
      "deepseek/deepseek-r1: Reinforcement learning-trained model for complex multi-step reasoning (128k context)",
      "gryphe/mythomax-l2-13b: Community fine-tune optimized for creative writing and storytelling (4k context)"
    ]
  },
  {
    id: "model-endpoints-3",
    title: "Model Endpoints Catalog (Part 3)",
    subtitle: "Microsoft, OpenAI, Google Models",
    bullets: [
      "microsoft/phi-4: 14B parameter model with efficient inference and strong benchmark performance (16k context)",
      "microsoft/wizardlm-2-8x22b: 8x22B MoE model trained on code, math, and reasoning tasks (32k context)",
      "openai/gpt-3.5-turbo-0301: Legacy GPT-3.5 snapshot for reproducibility and cost-sensitive applications (4k context)",
      "google/gemini-embedding-001: Specialized embedding model for semantic search and RAG applications (768 dimensions)"
    ]
  },
  {
    id: "embeddings",
    title: "Embedding Models Configuration",
    subtitle: "Vector Representations for Text & Images",
    bullets: [
      "google/gemini-embedding-001: 768-dimensional embeddings optimized for semantic similarity (text-only)",
      "openai/text-embedding-3-large: 3072-dimensional embeddings with best-in-class retrieval performance",
      "openai/text-embedding-3-small: 1536-dimensional efficient embeddings for cost-sensitive applications",
      "Operational Mechanics: Transform text/images into dense vector representations for semantic search, RAG, and clustering",
      "Optimization: Use dimensionality reduction (PCA/UMAP) for faster similarity search with minimal accuracy loss"
    ],
    code: `# Embedding Generation with OpenRouter
import requests

def get_embeddings(text: str, model: str = "google/gemini-embedding-001"):
    response = requests.post(
        "https://openrouter.ai/api/v1/embeddings",
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json"
        },
        json={"model": model, "input": text}
    )
    return response.json()["data"][0]["embedding"]

# Usage for semantic search
query_embedding = get_embeddings("What is quantum computing?")
# Compare with document embeddings using cosine similarity`
  },
  {
    id: "api-key-validator",
    title: "API Key Validation",
    subtitle: "Real-Time Key Testing & Verification",
    interactive: true,
    bullets: [
      "Validate API keys for all 6 providers with live endpoint testing",
      "Automatic format validation and pattern matching",
      "Real latency metrics and model availability checks",
      "Secure local storage - keys never leave your browser"
    ]
  },
  {
    id: "endpoints",
    title: "Live API Testing",
    subtitle: "Interactive Request/Response Examples",
    interactive: true,
    bullets: [
      "Try live API requests with different providers",
      "POST /api/chat - Secure server-side proxy for OpenAI-compatible inference",
      "Toggle between simulated and real API calls",
      "Supports: DeepSeek, OpenRouter, xAI, NVIDIA NIM"
    ]
  },
  {
    id: "embedding-tester",
    title: "Embedding Generation",
    subtitle: "Interactive Vector Testing",
    interactive: true,
    bullets: [
      "Generate embeddings with real API calls or simulations",
      "Test multiple embedding models (Gemini, OpenAI)",
      "View vector statistics: magnitude, mean, standard deviation",
      "Export embeddings for semantic search and RAG applications"
    ]
  },
  {
    id: "api-reference",
    title: "API Reference",
    subtitle: "Complete Endpoint Documentation",
    interactive: true,
    bullets: [
      "Copy-ready cURL examples for each endpoint",
      "Standard OpenAI-compatible response formats",
      "Authentication and error handling patterns",
      "Health monitoring and configuration endpoints"
    ]
  },
  {
    id: "env-setup",
    title: "Environment Variable Setup",
    subtitle: "Secure Configuration for All AI Providers",
    interactive: true,
    bullets: [
      "Essential API Keys: OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, NVIDIA_NIM_API_KEY, OPENAI_API_KEY",
      "Platform-Specific: Configure based on deployment environment (Vercel, Replit, Docker, AWS)",
      "Security Best Practices: Use secrets managers, never commit .env to version control, rotate keys regularly",
      "Validation: Test all keys with /api/config endpoint before production deployment"
    ]
  },
  {
    id: "python-integration",
    title: "Python Integration with LiteLLM",
    subtitle: "Unified Interface Across All Providers",
    bullets: [
      "Environment Setup: Store API keys in environment variables (OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, NVIDIA_NIM_API_KEY)",
      "LiteLLM Benefits: Single completion() interface for 100+ models, automatic retry logic, cost tracking, and fallback handling",
      "Provider Routing: Use prefixes (deepseek/, openrouter/, xai/) to specify providers explicitly",
      "Security: Never hardcode credentials—use secrets management (AWS Secrets Manager, Replit Secrets, dotenv)"
    ],
    code: `import os
from litellm import completion

# Keys loaded from environment
# Set via: export OPENROUTER_API_KEY="sk-or-..."

def run_multimodal_inference(provider: str, prompt: str, temperature: float = 0.7):
    """
    Universal inference function supporting multiple providers.
    """
    model_map = {
        "deepseek": "deepseek/deepseek-chat",
        "deepseek-r1": "deepseek/deepseek-r1",
        "openrouter": "openrouter/anthropic/claude-3-opus",
        "xai": "xai/grok-4-fast",
        "nvidia": "nvidia/nemotron-nano-9b-v2"
    }
    
    response = completion(
        model=model_map[provider],
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature
    )
    
    return response.choices[0].message.content

# Example with error handling and retries
from litellm import RetryPolicy

response = completion(
    model="deepseek/deepseek-r1",
    messages=[{"role": "user", "content": "Solve: x^2 + 5x + 6 = 0"}],
    retry_policy=RetryPolicy(max_retries=3, exponential_backoff=True)
)`
  },
  {
    id: "best-practices",
    title: "Integration Best Practices",
    subtitle: "Production-Grade Multimodal AI Systems",
    bullets: [
      "Security: API proxy pattern—expose /api/chat endpoint, never send keys to frontend (CRITICAL)",
      "Performance: Implement Redis/KV caching for repeated queries (80%+ cache hit rate reduces costs)",
      "Scalability: Async processing with Celery/BullMQ for long-running inference (>30s responses)",
      "Monitoring: Track latency, token usage, error rates per model/provider with DataDog or Prometheus",
      "Cost Optimization: Route requests to free-tier models (xiaomi/mimo-v2-flash:free) when appropriate",
      "Failover Strategy: Primary → Secondary → Tertiary model fallback chain for 99.9% uptime"
    ]
  },
  {
    id: "github-integration",
    title: "GitHub Repository Integration",
    subtitle: "Production-Ready Code Examples & Templates",
    interactive: true,
    bullets: [
      "7 essential repositories with live examples",
      "Copy-ready quick start code for each integration",
      "Star counts and community activity metrics",
      "Organized by category: Orchestration, Integration, Models, Tools"
    ]
  },
  {
    id: "deployment-guides",
    title: "Deployment Guides",
    subtitle: "Deploy to Production in Minutes",
    interactive: true,
    bullets: [
      "Vercel: Serverless deployment with automatic scaling",
      "Replit: Instant development environment with secrets management",
      "Docker: Containerized deployment with Redis caching",
      "AWS Lambda: Serverless architecture with minimal cold starts"
    ]
  },
  {
    id: "resources",
    title: "Resources & Links",
    subtitle: "Core Infrastructure Repositories",
    bullets: [
      "OpenRouterTeam/typescript-sdk - Official TypeScript SDK with Vercel AI integration (Featured)",
      "BerriAI/litellm - Python LLM abstraction for 100+ models",
      "veniceai/api-docs - Privacy-focused inference API",
      "xai-org/xai-cookbook - Advanced Grok usage patterns",
      "OpenRouterTeam/ai-sdk-provider - Legacy AI SDK provider (use typescript-sdk)",
      "huggingface/dataset-viewer - Dataset inspection tools",
      "deepseek-ai/DeepSeek-Math-V2 - Math reasoning models",
      "deepseek-ai/3FS - High-performance storage for AI training"
    ]
  },
  {
    id: "summary",
    title: "Summary",
    subtitle: "The Future is Multimodal",
    bullets: [
      "Leverage OpenRouter for model flexibility",
      "Utilize DeepSeek for specialized reasoning tasks",
      "Orchestrate with LiteLLM for stability",
      "Build with privacy and performance first"
    ],
    content: "Thank You"
  }
];
