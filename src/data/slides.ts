import { SlideData } from "@/types/slides";

export const slides: SlideData[] = [
  {
    id: "cover",
    title: "Multimodal AI SDK Integration",
    subtitle: "Complete Guide to Anthropic, DeepSeek, xAI & OpenRouter",
    bullets: [
      "Interactive SDK Demos",
      "Production Deployment",
      "Scalable Architecture"
    ]
  },
  {
    id: "toc",
    title: "Agenda",
    bullets: [
      "Platform Overview: DeepSeek & OpenRouter",
      "AI Provider SDKs: Anthropic, DeepSeek, xAI (Interactive)",
      "OpenRouter TypeScript SDK Integration (Interactive)",
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
    id: "anthropic-sdk",
    title: "Anthropic Claude SDK",
    subtitle: "Interactive Demo with Claude 3.5 Models",
    interactive: true,
    bullets: [
      "Official SDK: @anthropic-ai/sdk with full TypeScript support and streaming",
      "Claude 3.5 Sonnet: 200K context, vision capabilities, best-in-class coding and analysis",
      "Claude 3.5 Haiku: Fast and cost-effective for high-throughput applications",
      "Vision API: Analyze images with detailed descriptions, OCR, and visual reasoning"
    ]
  },
  {
    id: "deepseek-sdk",
    title: "DeepSeek API Integration",
    subtitle: "Mixture-of-Experts with Advanced Reasoning",
    interactive: true,
    bullets: [
      "DeepSeek-Chat: 671B parameters (37B active) - Fast general-purpose model with code expertise",
      "DeepSeek-Reasoner (R1): Chain-of-thought reasoning with <think> tags for complex problems",
      "OpenAI-Compatible: Drop-in replacement using OpenAI SDK with custom baseURL",
      "Cost-Effective: Significantly cheaper than GPT-4 while maintaining competitive performance"
    ]
  },
  {
    id: "xai-sdk",
    title: "xAI Grok API",
    subtitle: "Real-Time Web Search Integration",
    interactive: true,
    bullets: [
      "Grok Beta: 131K context with built-in real-time web search capabilities",
      "Grok Vision: Multimodal understanding for image analysis and visual reasoning",
      "Unique Features: Access to X/Twitter data, current events, witty personality",
      "OpenAI-Compatible: Use standard OpenAI SDK with api.x.ai baseURL"
    ]
  },
  {
    id: "openrouter-sdk",
    title: "OpenRouter TypeScript SDK Integration",
    subtitle: "Clone, Install & Deploy the Official SDK",
    interactive: true,
    bullets: [
      "Repository: github.com/OpenRouterTeam/typescript-sdk - Official TypeScript SDK with full type safety",
      "Installation: npm install @openrouter/ai-sdk-provider ai - Seamless Vercel AI SDK integration",
      "Features: Streaming responses, multi-model routing, error handling, automatic retries",
      "Interactive Demo: Test the SDK with real API calls or simulated responses"
    ]
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
      "Essential API Keys: ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, OPENROUTER_API_KEY, NVIDIA_NIM_API_KEY, OPENAI_API_KEY",
      "Platform-Specific: Configure based on deployment environment (Vercel, Replit, Docker, AWS)",
      "Security Best Practices: Use secrets managers, never commit .env to version control, rotate keys regularly",
      "Validation: Test all keys with the API Key Validator before production deployment"
    ]
  },
  {
    id: "python-integration",
    title: "Python Integration with LiteLLM",
    subtitle: "Unified Interface Across All Providers",
    bullets: [
      "Environment Setup: OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, NVIDIA_NIM_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY",
      "LiteLLM Benefits: Single completion() interface for 100+ models, automatic retry logic, cost tracking, and fallback handling",
      "Provider Routing: Use prefixes (anthropic/, deepseek/, xai/, openrouter/) to specify providers explicitly",
      "Security: Never hardcode credentials—use secrets management (AWS Secrets Manager, Replit Secrets, dotenv)"
    ],
    code: `import os
from litellm import completion, RetryPolicy

# Keys loaded from environment
# export ANTHROPIC_API_KEY="sk-ant-..."
# export DEEPSEEK_API_KEY="sk-..."
# export XAI_API_KEY="xai-..."

def run_multimodal_inference(provider: str, prompt: str, temperature: float = 0.7):
    """
    Universal inference function supporting all major AI providers.
    """
    model_map = {
        # Anthropic Claude models
        "claude-sonnet": "anthropic/claude-3-5-sonnet-20241022",
        "claude-haiku": "anthropic/claude-3-5-haiku-20241022",
        "claude-opus": "anthropic/claude-3-opus-20240229",
        
        # DeepSeek models
        "deepseek-chat": "deepseek/deepseek-chat",
        "deepseek-reasoner": "deepseek/deepseek-reasoner",
        "deepseek-coder": "deepseek/deepseek-coder",
        
        # xAI Grok models
        "grok": "xai/grok-beta",
        "grok-vision": "xai/grok-vision-beta",
        
        # OpenRouter (multi-provider gateway)
        "openrouter": "openrouter/anthropic/claude-3-opus",
        
        # NVIDIA and others
        "nvidia": "nvidia/nemotron-nano-9b-v2"
    }
    
    response = completion(
        model=model_map[provider],
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=2048
    )
    
    return response.choices[0].message.content

# Example with error handling and multi-provider fallback
def robust_inference(prompt: str):
    """
    Try multiple providers with automatic fallback.
    """
    providers = [
        "claude-sonnet",      # Try Anthropic first (best quality)
        "deepseek-chat",      # Fallback to DeepSeek (cost-effective)
        "grok",               # Fallback to xAI (web search capable)
        "openrouter"          # Final fallback through OpenRouter
    ]
    
    for provider in providers:
        try:
            response = completion(
                model=model_map[provider],
                messages=[{"role": "user", "content": prompt}],
                retry_policy=RetryPolicy(max_retries=2, exponential_backoff=True),
                timeout=30
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Provider {provider} failed: {e}")
            continue
    
    raise Exception("All providers failed")

# Advanced: Provider-specific features
def use_provider_features():
    # Anthropic Claude with vision
    vision_response = completion(
        model="anthropic/claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}},
                {"type": "text", "text": "Describe this image"}
            ]
        }]
    )
    
    # DeepSeek Reasoner with chain-of-thought
    reasoning_response = completion(
        model="deepseek/deepseek-reasoner",
        messages=[{"role": "user", "content": "Solve this complex math problem..."}],
        temperature=1.0  # Required for reasoning models
    )
    
    # xAI Grok with web search (automatic)
    web_response = completion(
        model="xai/grok-beta",
        messages=[{"role": "user", "content": "What are today's tech news?"}]
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
      "anthropics/anthropic-sdk-typescript - Official Anthropic Claude SDK with streaming and vision",
      "OpenRouterTeam/typescript-sdk - Official OpenRouter TypeScript SDK with Vercel AI integration",
      "deepseek-ai/DeepSeek-V3 - DeepSeek-V3 671B MoE model with research papers",
      "xai-org/grok-1 - Open-source Grok-1 314B parameter model",
      "BerriAI/litellm - Python LLM abstraction for 100+ models with unified interface",
      "vercel/ai - AI SDK for building AI-powered applications with streaming",
      "huggingface/transformers - State-of-the-art ML models for PyTorch and TensorFlow",
      "deepseek-ai/DeepSeek-Math-V2 - Math reasoning models and benchmarks"
    ]
  },
  {
    id: "pricing-billing",
    title: "Pricing & Billing Models",
    subtitle: "Understanding AI Inference Costs",
    bullets: [
      "Pay-per-token: Most common model charging for input/output tokens separately (e.g., GPT-4: $30/1M input, $60/1M output)",
      "Subscription tiers: Fixed monthly rate with token quotas (OpenRouter Pro, Claude Pro at $20-200/month)",
      "Cost factors: Model size/complexity (GPT-4 > GPT-3.5), context length (longer = more expensive), real-time vs batch processing",
      "Hidden fees: Rate limits causing request throttling, vision API surcharges (images cost 85-1000+ tokens), fine-tuning storage fees",
      "Cost optimization: Use smaller models for simple tasks, implement aggressive caching (80%+ savings), batch requests when possible"
    ],
    code: `# Cost calculation example
def calculate_cost(input_tokens, output_tokens, model="gpt-4"):
    pricing = {
        "gpt-4": {"input": 0.03, "output": 0.06},          # per 1K tokens
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "deepseek-chat": {"input": 0.00014, "output": 0.00028}  # 200x cheaper!
    }
    
    rates = pricing[model]
    cost = (input_tokens / 1000 * rates["input"] + 
            output_tokens / 1000 * rates["output"])
    
    return cost

# Example: 100K token conversation
print(f"GPT-4: \${calculate_cost(50000, 50000, 'gpt-4')}")  # $4.50
print(f"DeepSeek: \${calculate_cost(50000, 50000, 'deepseek-chat')}")  # $0.021`
  },
  {
    id: "hub-integration",
    title: "AI Hub Integration",
    subtitle: "Seamless Model Discovery & Deployment",
    bullets: [
      "HuggingFace Hub: 500K+ models—use transformers.js for browser-based inference without backend",
      "Integration steps: (1) Browse hub.huggingface.co → (2) Select model → (3) Install transformers → (4) Load with AutoModel.from_pretrained() → (5) Run inference locally",
      "OpenRouter Hub: Access 100+ models through single API—no need to manage multiple provider accounts",
      "Tools: transformers.js (browser ML), LangChain (orchestration), LiteLLM (unified routing), Hugging Face Inference Endpoints (serverless deployment)"
    ],
    code: `# HuggingFace Hub Integration
from transformers import AutoTokenizer, AutoModelForCausalLM

# Load model from HuggingFace Hub
model_name = "deepseek-ai/deepseek-math-7b-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Run inference locally
inputs = tokenizer("Solve: x^2 + 5x + 6 = 0", return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=256)
result = tokenizer.decode(outputs[0])

# Browser-based with transformers.js (no backend!)
# npm install @xenova/transformers
import { pipeline } from '@xenova/transformers';

const generator = await pipeline('text-generation', 'Xenova/gpt2');
const output = await generator('AI will transform');`
  },
  {
    id: "security",
    title: "Security Considerations",
    subtitle: "Critical Protocols for AI Inference",
    bullets: [
      "API Key Protection: NEVER expose keys in frontend code—use server-side proxy pattern (POST /api/chat) with environment variables only",
      "Input Validation: Sanitize user prompts to prevent prompt injection attacks, implement max token limits to prevent abuse",
      "Rate Limiting: Implement per-user quotas (e.g., 100 requests/hour) to prevent cost explosion and DDoS attacks",
      "Data Privacy: Avoid sending PII/sensitive data to third-party APIs, use self-hosted models (DeepSeek/Llama) for confidential workloads",
      "Monitoring: Log all API calls with user_id/timestamp, set up cost alerts (>$100/day threshold), detect anomalous usage patterns"
    ],
    code: `// Secure API Proxy Pattern (Next.js API Route)
// pages/api/chat.ts - BACKEND ONLY
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // ✅ API key lives server-side only
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  });
  
  // ✅ Input validation
  const { prompt } = req.body;
  if (!prompt || prompt.length > 4000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }
  
  // ✅ Rate limiting (example with Redis)
  const userKey = \`rate_limit:\${req.ip}\`;
  const count = await redis.incr(userKey);
  if (count === 1) await redis.expire(userKey, 3600);
  if (count > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // ✅ Sanitize sensitive data
  const sanitized = prompt.replace(/\\b\\d{3}-\\d{2}-\\d{4}\\b/g, '[SSN_REDACTED]');
  
  const completion = await openai.chat.completions.create({
    model: 'deepseek/deepseek-chat',
    messages: [{ role: 'user', content: sanitized }],
    max_tokens: 1000  // Cost protection
  });
  
  res.json({ response: completion.choices[0].message.content });
}`
  },
  {
    id: "structured-outputs",
    title: "Structured Outputs with LLMs",
    subtitle: "JSON Schema Enforcement for Reliable Parsing",
    bullets: [
      "Definition: Force LLMs to return valid JSON matching a predefined schema—eliminates parsing errors and ensures type safety",
      "Use cases: Extracting structured data (product info, user profiles), form generation, database insertions, API integrations",
      "Implementation: Use response_format: { type: 'json_object' } with OpenAI SDK, or JSON mode with Anthropic/DeepSeek",
      "Best practice: Always provide JSON schema in system prompt, validate response with Zod/JSON Schema validator, retry with error feedback"
    ],
    code: `// Structured Outputs Example (TypeScript + OpenAI)
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// Define schema with Zod
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  category: z.enum(['electronics', 'clothing', 'food']),
  inStock: z.boolean(),
  tags: z.array(z.string())
});

// Force structured output
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: 'Extract product info: "Apple MacBook Pro 16\\" - $2499, available now"'
  }],
  response_format: zodResponseFormat(ProductSchema, 'product')
});

const product = JSON.parse(completion.choices[0].message.content);
// Guaranteed to match schema:
// { name: "MacBook Pro 16\\"", price: 2499, category: "electronics", inStock: true, tags: ["laptop", "apple"] }

// Python equivalent with Pydantic
from pydantic import BaseModel
from openai import OpenAI

class Product(BaseModel):
    name: str
    price: float
    category: str
    in_stock: bool
    tags: list[str]

response = client.chat.completions.create(
    model="gpt-4",
    response_format={"type": "json_object"},
    messages=[{"role": "user", "content": "..."}]
)

product = Product.model_validate_json(response.choices[0].message.content)`
  },
  {
    id: "function-calling",
    title: "Function Calling in AI Applications",
    subtitle: "Extend LLM Capabilities with External Tools",
    bullets: [
      "Concept: LLMs can invoke predefined functions (API calls, database queries, calculations) by returning structured JSON with function name and arguments",
      "Flow: Define function schemas → LLM decides when to call → Parse function call JSON → Execute function → Return result to LLM → LLM generates final response",
      "Use cases: Weather APIs, stock prices, database searches, send emails, create calendar events, complex math (WolframAlpha)",
      "Benefits: Reduces hallucination (real data), enables real-time info, extends beyond training cutoff, creates agentic workflows"
    ],
    code: `// Function Calling Example (OpenAI SDK)
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "City name" },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_database",
      description: "Search product database",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", default: 10 }
        },
        required: ["query"]
      }
    }
  }
];

// Step 1: LLM decides to call function
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  tools: tools,
  tool_choice: "auto"
});

const toolCall = response.choices[0].message.tool_calls?.[0];

// Step 2: Execute the function
if (toolCall?.function.name === "get_weather") {
  const args = JSON.parse(toolCall.function.arguments);
  // { location: "Tokyo", unit: "celsius" }
  
  const weatherData = await fetch(\`https://api.weather.com/\${args.location}\`);
  
  // Step 3: Return result to LLM
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: "What's the weather in Tokyo?" },
      response.choices[0].message,  // Original assistant message with tool call
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify({ temp: 22, condition: "Sunny" })
      }
    ]
  });
  
  console.log(finalResponse.choices[0].message.content);
  // "It's currently 22°C and sunny in Tokyo."
}`
  },
  {
    id: "inference-tasks",
    title: "Inference Task Types",
    subtitle: "Chat, Embeddings, Text-to-Image, Text-to-Video",
    bullets: [
      "Chat Completion: Conversational AI with messages array, supports streaming, multi-turn context (models: GPT-4, Claude, DeepSeek)",
      "Feature Extraction (Embeddings): Convert text to dense vectors for semantic search, RAG, clustering (models: text-embedding-3-large, gemini-embedding-001)",
      "Text-to-Image: Generate images from prompts (DALL-E 3, Stable Diffusion XL, Midjourney via APIs), supports style control and inpainting",
      "Text-to-Video: Emerging task—generate short videos from text (Runway Gen-2, Pika Labs), limited availability and high cost ($0.50-5/video)"
    ],
    code: `// Chat Completion with Streaming
import { OpenAI } from 'openai';
const openai = new OpenAI();

const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Explain AI' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// Embeddings for Semantic Search
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-large',
  input: 'What is quantum computing?'
});

const vector = embedding.data[0].embedding; // 3072-dimensional vector

// Text-to-Image (DALL-E 3)
const image = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'A futuristic AI laboratory with holographic displays',
  size: '1024x1024',
  quality: 'hd'
});

console.log(image.data[0].url);

// Text-to-Video (Hypothetical API - emerging)
const video = await runwayml.generate({
  prompt: 'A drone flying over a cyberpunk city at night',
  duration: 4,  // seconds
  resolution: '1280x720'
});`
  },
  {
    id: "image-editor",
    title: "Building an AI Image Editor",
    subtitle: "Integrating Vision Models & Image Generation",
    bullets: [
      "Core components: Canvas element (HTML5), image upload, OpenAI DALL-E API, Claude Vision for analysis, undo/redo stack",
      "Features: Inpainting (fill masked areas), outpainting (extend images), style transfer, object removal, upscaling (Real-ESRGAN)",
      "Tech stack: React + Konva.js (canvas manipulation), @anthropic-ai/sdk (vision analysis), openai SDK (DALL-E edits), Fabric.js (advanced editing)",
      "Workflow: Upload image → Analyze with Claude Vision → User draws mask → Send to DALL-E edit endpoint → Apply result → Save with undo history"
    ],
    code: `// AI Image Editor - Core Implementation
import { fabric } from 'fabric';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Analyze image with Claude Vision
async function analyzeImage(imageBase64: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
        },
        { type: 'text', text: 'Describe this image and suggest edit ideas' }
      ]
    }]
  });
  
  return message.content[0].text;
}

// 2. AI-powered inpainting (remove objects)
async function inpaintImage(
  originalImage: File,
  maskImage: File,  // White = keep, Black = regenerate
  prompt: string
) {
  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: originalImage,
    mask: maskImage,
    prompt: prompt,
    n: 1,
    size: '1024x1024'
  });
  
  return response.data[0].url;
}

// 3. Canvas-based mask drawing (React component)
function ImageEditorCanvas({ imageUrl }: { imageUrl: string }) {
  const canvasRef = useRef<fabric.Canvas>();
  
  useEffect(() => {
    const canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true,
      width: 1024,
      height: 1024
    });
    
    fabric.Image.fromURL(imageUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
    
    canvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 0.5)';
    canvas.freeDrawingBrush.width = 20;
    
    canvasRef.current = canvas;
  }, [imageUrl]);
  
  const handleInpaint = async () => {
    const maskDataUrl = canvasRef.current?.toDataURL({ format: 'png' });
    const result = await inpaintImage(
      originalImage,
      dataURLtoFile(maskDataUrl, 'mask.png'),
      'Remove the marked object naturally'
    );
    
    // Apply result to canvas
    fabric.Image.fromURL(result, (img) => {
      canvas.add(img);
    });
  };
  
  return <canvas id="canvas" />;
}

// 4. Advanced: Style transfer with img2img
async function styleTransfer(imageUrl: string, style: string) {
  const response = await openai.images.createVariation({
    image: await fetch(imageUrl).then(r => r.blob()),
    n: 1,
    size: '1024x1024'
  });
  
  return response.data[0].url;
}`
  },
  {
    id: "code-review-automation",
    title: "Automating Code Review with GitHub Actions",
    subtitle: "AI-Powered PR Analysis & Feedback",
    bullets: [
      "Benefits: Catch bugs early (before human review), enforce style guidelines, suggest optimizations, reduce reviewer burden by 40-60%",
      "Workflow: PR opened → GitHub Action triggers → Extract diff → Send to LLM (GPT-4/DeepSeek) → Generate review comments → Post to PR",
      "Setup: Create .github/workflows/ai-review.yml → Use actions/checkout + custom script → Call OpenAI API with diff → Comment with octokit",
      "Best practices: Focus on logic errors (not style), use DeepSeek-Coder for cost efficiency ($0.00014/1K tokens), rate limit to avoid spam"
    ],
    code: `# .github/workflows/ai-code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai_review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Get PR diff
        id: diff
        run: |
          git diff origin/main..HEAD > diff.txt
          echo "diff<<EOF" >> $GITHUB_OUTPUT
          cat diff.txt >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
      
      - name: AI Review
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          python << 'PYTHON_SCRIPT'
import os
import json
from openai import OpenAI
from github import Github

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
gh = Github(os.environ["GITHUB_TOKEN"])

# Get PR diff
diff = os.environ["DIFF"]

# Analyze with AI
response = client.chat.completions.create(
    model="gpt-4",  # or deepseek/deepseek-coder for 200x cost savings
    messages=[{
        "role": "system",
        "content": """You are an expert code reviewer. Analyze the diff and provide:
1. Potential bugs or logic errors
2. Security vulnerabilities
3. Performance improvements
4. Best practice violations

Format as JSON: {"comments": [{"file": "...", "line": 10, "body": "..."}]}"""
    }, {
        "role": "user",
        "content": f"Review this PR diff:\\n{diff}"
    }],
    response_format={"type": "json_object"}
)

review = json.loads(response.choices[0].message.content)

# Post comments to PR
repo = gh.get_repo(os.environ["GITHUB_REPOSITORY"])
pr = repo.get_pull(int(os.environ["PR_NUMBER"]))

for comment in review["comments"]:
    pr.create_review_comment(
        body=f"🤖 AI Code Review:\\n{comment['body']}",
        path=comment["file"],
        line=comment["line"]
    )
PYTHON_SCRIPT`
  },
  {
    id: "model-evaluation",
    title: "Model Evaluation & Benchmarking",
    subtitle: "Using Inspect for Systematic Testing",
    bullets: [
      "Why evaluate: Models vary widely in quality/cost—GPT-4 excels at reasoning but DeepSeek-R1 matches it at 1/200th cost for math",
      "Metrics: Accuracy (% correct), F1 score (precision + recall), perplexity (language modeling), BLEU (translation), human eval (quality)",
      "Tools: Inspect AI (structured evals), LangSmith (tracing), PromptFoo (A/B testing), OpenAI Evals (benchmark suite)",
      "Process: Define test dataset → Run inference on multiple models → Compare metrics → Analyze failure cases → Iterate prompts"
    ],
    code: `# Model Evaluation with Inspect AI
from inspect_ai import Task, eval
from inspect_ai.dataset import example_dataset
from inspect_ai.scorer import model_graded_fact
from inspect_ai.solver import generate, system_message

# Define evaluation task
@task
def math_reasoning():
    return Task(
        dataset=example_dataset("math_qa"),
        plan=[
            system_message("You are a math expert. Solve step-by-step."),
            generate()
        ],
        scorer=model_graded_fact(model="gpt-4")  # Use GPT-4 as judge
    )

# Run evaluation across multiple models
results = eval(
    [math_reasoning()],
    model=["openai/gpt-4", "deepseek/deepseek-r1", "anthropic/claude-3-opus"],
    limit=100  # Test on 100 examples
)

# Compare results
for model, result in results.items():
    print(f"{model}: Accuracy = {result.metrics['accuracy']:.2%}")
    print(f"  Avg cost per question: \${result.metrics['total_cost']/100:.4f}")

# Output:
# openai/gpt-4: Accuracy = 87.5%, Cost = $0.0420/question
# deepseek/deepseek-r1: Accuracy = 86.2%, Cost = $0.0002/question  ← 200x cheaper!
# anthropic/claude-3-opus: Accuracy = 89.1%, Cost = $0.0375/question

# Advanced: A/B testing with PromptFoo
# npx promptfoo@latest eval -c promptfooconfig.yaml

# promptfooconfig.yaml
prompts:
  - "Solve this math problem: {{problem}}"
  - "Think step-by-step and solve: {{problem}}"
  
providers:
  - openai:gpt-4
  - openrouter:deepseek/deepseek-chat
  
tests:
  - vars:
      problem: "If x^2 = 16, what is x?"
    assert:
      - type: contains
        value: "x = 4 or x = -4"`
  },
  {
    id: "hub-api-provider",
    title: "Hub API & Provider Registration",
    subtitle: "Becoming an Inference Provider",
    bullets: [
      "Hub API: Central registry for discovering models and inference providers—used by OpenRouter, HuggingFace, Replicate",
      "Registration process: (1) Create API endpoint with /v1/chat/completions → (2) Implement health checks → (3) Submit to hub registry → (4) Pass latency/uptime tests → (5) Get listed",
      "Requirements: 99.9% uptime SLA, <2s p95 latency, OpenAI-compatible API, usage-based billing integration, DDoS protection",
      "Benefits: Exposure to developers, automatic routing from aggregators, pay-per-use revenue, multi-model support"
    ],
    code: `# Minimal Inference Provider API (Flask + HuggingFace)
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)

# Load model at startup
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/deepseek-chat-7b")
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-chat-7b")
model.to("cuda" if torch.cuda.is_available() else "cpu")

@app.route("/v1/chat/completions", methods=["POST"])
def chat_completions():
    """OpenAI-compatible endpoint"""
    data = request.json
    messages = data["messages"]
    
    # Format prompt
    prompt = tokenizer.apply_chat_template(messages, tokenize=False)
    
    # Generate
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=data.get("max_tokens", 512),
        temperature=data.get("temperature", 0.7)
    )
    
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Return OpenAI-format response
    return jsonify({
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "model": "deepseek-chat-7b",
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": response_text
            },
            "finish_reason": "stop"
        }],
        "usage": {
            "prompt_tokens": len(inputs.input_ids[0]),
            "completion_tokens": len(outputs[0]) - len(inputs.input_ids[0]),
            "total_tokens": len(outputs[0])
        }
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model": "deepseek-chat-7b"})

# Register with hub
# POST https://api.openrouter.ai/api/v1/providers/register
# {
#   "name": "My Inference Provider",
#   "base_url": "https://my-api.com",
#   "models": ["deepseek-chat-7b"],
#   "pricing": {"input": 0.0001, "output": 0.0002}
# }`
  },
  {
    id: "resources-extended",
    title: "Extended Resources & Documentation",
    subtitle: "Essential Repositories & Learning Paths",
    bullets: [
      "Transformers.js (huggingface/transformers.js): Browser-based ML—run BERT, GPT-2, Whisper without backend (npm install @xenova/transformers)",
      "LiteLLM (BerriAI/litellm): Python abstraction for 100+ LLMs—unified interface for OpenAI, Anthropic, DeepSeek, etc.",
      "OpenRouter SDK (OpenRouterTeam/typescript-sdk): Official TypeScript SDK with streaming, retries, Vercel AI integration",
      "Inspect AI (UKGovernmentBEIS/inspect_ai): Model evaluation framework for systematic benchmarking",
      "Venice API (veniceai/api-docs): Privacy-focused inference with local deployment options"
    ],
    code: `# Quick start: huggingface/transformers.js
# Clone and explore
git clone https://github.com/huggingface/transformers.js.git
cd transformers.js/examples

# Install
npm install @xenova/transformers

# Browser-based sentiment analysis (no backend!)
import { pipeline } from '@xenova/transformers';

const classifier = await pipeline('sentiment-analysis');
const result = await classifier('I love transformers.js!');
console.log(result);
// [{ label: 'POSITIVE', score: 0.9998 }]

# Text generation in browser
const generator = await pipeline('text-generation', 'Xenova/gpt2');
const output = await generator('The future of AI is', {
  max_new_tokens: 50
});

# Image classification
const imageClassifier = await pipeline('image-classification');
const predictions = await imageClassifier('https://example.com/cat.jpg');
// [{ label: 'tabby cat', score: 0.89 }, ...]

# Learn more
# - Documentation: https://huggingface.co/docs/transformers.js
# - Models: https://huggingface.co/models?library=transformers.js
# - Examples: https://github.com/huggingface/transformers.js/tree/main/examples`
  },
  {
    id: "summary",
    title: "Summary",
    subtitle: "The Future is Multimodal",
    bullets: [
      "Leverage OpenRouter for model flexibility and cost optimization across 100+ models",
      "Utilize DeepSeek for specialized reasoning tasks at 1/200th the cost of GPT-4",
      "Orchestrate with LiteLLM for stability, automatic retries, and multi-provider fallback",
      "Build with privacy and performance first—use secure API proxies, implement caching, monitor costs",
      "Explore transformers.js for browser-based ML and hub integration for seamless model discovery"
    ],
    content: "Thank You"
  }
];
