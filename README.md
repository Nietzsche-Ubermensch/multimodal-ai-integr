# Multimodal AI Integration Platform

Comprehensive platform for testing, comparing, and integrating 70+ AI models from 7+ providers. Features live model testing, RAG pipelines, prompt engineering studio, and secure API gateway.

[![Build](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/workflows/build/badge.svg)](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Problem

AI development challenges: provider fragmentation (different APIs/SDKs), cost uncertainty, no unified testing environment, lack of production patterns.

**Solution**: Unified interface for testing, comparing, integrating AI models with real-time validation and production code examples.

## Features

- **70+ Models**: OpenRouter, Anthropic, DeepSeek, xAI, OpenAI, NVIDIA, HuggingFace
- **Live Testing**: Streaming chat, side-by-side comparison, cost tracking, API validation
- **RAG Pipeline**: Document chunking, embeddings, Supabase pgvector, similarity search
- **Prompt Studio**: Interactive editor, A/B testing, parameter tuning
- **API Gateway**: Secure proxy, encrypted keys, rate limiting (100 req/hour)
- **Web Scraping**: Multi-provider (Firecrawl/Oxylabs), structured extraction
- **Explainable AI**: 6 methods (SHAP, attention, gradients), feature visualization

## Tech Stack

**Frontend**: React 19, TypeScript 5.7, Vite 7, Tailwind CSS 4, shadcn/ui
**Backend**: Express.js, Supabase (PostgreSQL + pgvector)
**AI**: OpenRouter, Anthropic, OpenAI, DeepSeek, xAI SDKs
**Testing**: Vitest 4, Testing Library

## Quick Start

```bash
git clone https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr.git
cd multimodal-ai-integr
npm install
cp .env.example .env  # Add API keys
npm run dev           # Open http://localhost:5173
```

**Environment** (`.env`):
```bash
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
# Optional: ANTHROPIC, DEEPSEEK, XAI, OPENAI, NVIDIA keys
```

See [ENV_SETUP.md](./docs/ENV_SETUP.md) for details.

## Usage

**Test Model**: AI Model Hub → Browse models → Enter API key → Test with streaming

**RAG Pipeline**: RAG Testing → Upload doc → Configure chunking → Generate embeddings → Test search

**Compare Models**: Chat → Select 2-3 models → Enter prompt → View parallel responses

**Optimize Prompts**: Prompt Studio → Enter prompt → A/B test → Compare outputs

## Project Structure

```
src/                 # React frontend
  components/ui/     # 51 shadcn/ui primitives
  components/        # Feature components (ModelHub, AIModelHub, PromptEngineering)
  lib/               # Services (AI, RAG, scraping, Supabase)
  hooks/             # Custom React hooks
api-gateway/         # Express backend
  routes/            # API endpoints
  services/          # Provider integrations
  middleware/        # Auth, validation, rate limiting
supabase/            # Database config, edge functions
tests/               # Test suites
docs/                # Documentation (50+ guides)
```

## Documentation

**Getting Started**: [CONTRIBUTING.md](./CONTRIBUTING.md), [ENV_SETUP.md](./docs/ENV_SETUP.md)

**Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md), [PRODUCT.md](./PRODUCT.md), [SECURITY.md](./docs/SECURITY.md)

**Guides**: [OpenRouter SDK](./docs/OPENROUTER_SDK_INTEGRATION.md), [XAI SDK](./docs/XAI_SDK_GUIDE.md), [RAG Pipeline](./docs/SUPABASE_VECTOR_RAG_GUIDE.md), [API Gateway](./docs/API_GATEWAY.md)

**Reference**: [Changelog](./docs/CHANGELOG.md), [Dependencies](./docs/DEPENDENCY_NOTES.md), [Quick Reference](./docs/QUICK_REFERENCE.md)

## Resources

**APIs**: [OpenRouter](https://openrouter.ai/docs), [Anthropic](https://docs.anthropic.com/), [DeepSeek](https://platform.deepseek.com/), [xAI](https://console.x.ai/), [Supabase](https://supabase.com/docs)

**SDKs**: [OpenRouter TS](https://github.com/OpenRouterTeam/typescript-sdk), [Vercel AI](https://github.com/vercel/ai), [LiteLLM](https://github.com/BerriAI/litellm), [Transformers.js](https://github.com/huggingface/transformers.js)

## License

MIT License - See [LICENSE](./LICENSE)

## Support

[Issues](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/issues) · [Discussions](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/discussions) · [Security](./docs/SECURITY.md)

---

**Built with** React 19, TypeScript, Vite, Tailwind CSS, and modern AI SDKs.
