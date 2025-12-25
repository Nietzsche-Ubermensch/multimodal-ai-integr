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
      "DeepSeek Platform Capabilities",
      "OpenRouter Integration Layer",
      "Model Endpoint Specifications",
      "Python Integration Patterns (LiteLLM)",
      "Best Practices: Security & Scale",
      "Resources & Repositories"
    ]
  },
  {
    id: "deepseek",
    title: "DeepSeek Platform",
    subtitle: "Advanced Open-Source Intelligence",
    bullets: [
      "DeepSeek-Math-V2: SOTA Mathematical reasoning",
      "3FS: Fire-Flyer File System for high-performance AI training storage",
      "Optimized for large-scale inference and reasoning tasks",
      "Open weights available on HuggingFace"
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
      "Standardized OpenAI-compatible API",
      "Access to best-in-class models (GPT-4, Claude 3, Llama 3)",
      "Transparent pricing and low-latency routing",
      "ai-sdk-provider: Seamless Vercel AI SDK integration"
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
    id: "endpoints",
    title: "Model Endpoints",
    subtitle: "Internal API Architecture",
    bullets: [
      "GET /api/config - Discovery endpoint for available providers and active keys",
      "POST /api/chat - Secure server-side proxy for OpenAI-compatible inference",
      "GET /api/health - Service health and latency monitoring",
      "Supports: DeepSeek, OpenRouter, xAI, NVIDIA NIM"
    ],
    code: `// POST /api/chat Request
{
  "provider": "deepseek", // or "openrouter", "xai", "nvidia"
  "model": "deepseek-chat",
  "messages": [
    { "role": "user", "content": "Explain quantum entanglement" }
  ],
  "temperature": 0.7
}

// Response (Standard OpenAI Format)
{
  "id": "chatcmpl-123...",
  "choices": [{ "message": { "content": "..." } }]
}`
  },
  {
    id: "python-integration",
    title: "Python Integration",
    subtitle: "Secure Environment Configuration",
    bullets: [
      "Use Replit Secrets for API Key Management (Never hardcode credentials)",
      "LiteLLM handles unified routing across providers",
      "Automatic failover and retry logic built-in",
      "Environment Variables: OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, NVIDIA_NIM_API_KEY"
    ],
    code: `import os
from litellm import completion

# Keys are automatically loaded from os.environ
# Ensure these are set in Replit Secrets

def run_multimodal_inference(provider, prompt):
    model_map = {
        "deepseek": "deepseek/deepseek-chat",
        "openrouter": "openrouter/anthropic/claude-3-opus",
        "xai": "xai/grok-1",
        "nvidia": "nvidia/llama-3-70b-instruct"
    }
    
    response = completion(
        model=model_map[provider],
        messages=[{"role": "user", "content": prompt}]
    )
    return response`
  },
  {
    id: "best-practices",
    title: "Best Practices",
    subtitle: "Production-Grade AI Systems",
    bullets: [
      "Security: Never expose API keys on client-side (Use /api/chat proxy)",
      "Performance: Implement aggressive caching (Redis/KV)",
      "Scalability: Use async queues (Celery/BullMQ) for long-running inference",
      "Evaluation: Continuous testing with MoonshotAI/checkpoint-engine"
    ]
  },
  {
    id: "resources",
    title: "Resources & Links",
    subtitle: "Core Infrastructure Repositories",
    bullets: [
      "BerriAI/litellm - Python LLM abstraction",
      "veniceai/api-docs - Privacy-focused inference",
      "xai-org/xai-cookbook - Advanced usage patterns",
      "OpenRouterTeam/ai-sdk-provider - Vercel AI SDK provider",
      "huggingface/dataset-viewer - Data inspection tools",
      "deepseek-ai/DeepSeek-Math-V2 - Math reasoning models",
      "deepseek-ai/3FS - High-performance storage"
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
