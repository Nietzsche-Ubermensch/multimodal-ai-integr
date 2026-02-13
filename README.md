# Multimodal AI Integration Platform

A comprehensive platform for testing, comparing, and integrating 70+ AI models from 7+ providers. Features live model testing, RAG pipelines, prompt engineering studio, web scraping, and a secure Express.js API gateway.

[![Build Status](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/workflows/build/badge.svg)](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Problem Statement

Building AI-powered applications requires integrating multiple providers, comparing models, and implementing complex patterns like RAG. Developers face challenges:
- **Provider Fragmentation**: Different APIs, SDKs, and authentication methods
- **Cost Uncertainty**: Unpredictable pricing across providers
- **Testing Complexity**: No unified environment to validate integrations
- **Implementation Gaps**: Lack of production-ready patterns and examples

This platform solves these problems by providing a unified interface for testing, comparing, and integrating AI models with real-time validation and production-ready code examples.

## Key Features

### 🧠 Unified Model Catalog
- 70+ models from OpenRouter, Anthropic, DeepSeek, xAI, OpenAI, NVIDIA, HuggingFace
- Detailed specifications: context windows, pricing, capabilities
- Filter by provider, capability, cost range

### 🚀 Live API Testing
- Real-time chat interface with streaming responses
- Side-by-side model comparison
- Token usage and cost tracking
- API key validation for 6+ providers
- Latency and performance metrics

### 📚 RAG Pipeline Implementation
- Document chunking with configurable strategies
- Embedding generation (OpenAI, HuggingFace)
- Vector storage in Supabase pgvector
- Similarity search and context retrieval
- Production-ready pipeline examples

### 🎨 Prompt Engineering Studio
- Interactive prompt editor and optimizer
- A/B testing framework
- Temperature and parameter tuning
- Prompt templates library

### 🔒 Secure API Gateway
- Server-side proxy pattern
- Encrypted API key management
- Rate limiting (100 req/hour)
- Input validation and sanitization

### 🕷️ Web Scraping Integration
- Multi-provider support (Firecrawl, Oxylabs)
- Structured data extraction
- AI-powered content parsing

### 🔍 Explainable AI (XAI)
- 6 explanation methods (SHAP, attention, gradients, etc.)
- Feature importance visualization
- Model decision transparency

## Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 7, Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives), Phosphor Icons
- **State Management**: TanStack React Query 5
- **Backend**: Express.js API Gateway
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI SDKs**: OpenRouter, Anthropic, OpenAI, DeepSeek, xAI
- **Testing**: Vitest 4, Testing Library
- **Build**: Vite with SWC, TypeScript strict mode

## Installation

### Prerequisites
- Node.js 20+
- npm or pnpm
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr.git
cd multimodal-ai-integr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional (for full functionality)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_DEEPSEEK_API_KEY=sk-...
VITE_XAI_API_KEY=xai-...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_NVIDIA_NIM_API_KEY=nvapi-...
```

See [ENV_SETUP.md](./docs/ENV_SETUP.md) for detailed setup instructions and platform-specific configuration.

## Running the Project

### Development
```bash
# Frontend
npm run dev              # Start Vite dev server (port 5173)

# Backend API Gateway
cd api-gateway
npm install
npm run dev              # Start Express server (port 3000)
```

### Production Build
```bash
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm test -- --run        # Single test run
npm run lint             # Run ESLint
```

## Usage Examples

### Test an AI Model
1. Navigate to "AI Model Hub 2025" tab
2. Browse models by provider or capability
3. Click on a model to view details
4. Enter your API key and click "Test Model"
5. View streaming response and cost metrics

### Implement RAG Pipeline
1. Go to "RAG Testing" tab
2. Upload a document or enter text
3. Configure chunking strategy (size, overlap)
4. Generate embeddings
5. Test similarity search with queries
6. View retrieved context and results

### Compare Models
1. Open "Chat" tab
2. Select 2-3 models for comparison
3. Enter a prompt
4. View responses side-by-side
5. Compare costs, latency, and quality

## Project Structure

```
/
├── src/                      # React frontend application
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui primitives (51 components)
│   │   ├── ModelHub/        # GitHub Models integration
│   │   ├── AIModelHub/      # Main model catalog + RAG
│   │   └── PromptEngineering/ # Prompt studio
│   ├── lib/                 # Service layer and utilities
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── data/                # Static configuration
├── api-gateway/             # Express.js backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Auth, validation, rate limiting
│   └── Dockerfile           # Container configuration
├── supabase/                # Database configuration
│   ├── functions/           # Edge functions
│   └── migrations/          # Database migrations
├── tests/                   # Test suites
└── docs/                    # Documentation (50+ guides)
```

## Documentation

### Getting Started
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Developer contribution guidelines
- **[ENV_SETUP.md](./docs/ENV_SETUP.md)** - Environment setup for all platforms

### Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[PRODUCT.md](./PRODUCT.md)** - Product overview and features
- **[SECURITY.md](./docs/SECURITY.md)** - Security guidelines and best practices

### Technical Guides
- **[OPENROUTER_SDK_INTEGRATION.md](./docs/OPENROUTER_SDK_INTEGRATION.md)** - OpenRouter SDK guide
- **[XAI_SDK_GUIDE.md](./docs/XAI_SDK_GUIDE.md)** - Explainable AI integration
- **[SUPABASE_VECTOR_RAG_GUIDE.md](./docs/SUPABASE_VECTOR_RAG_GUIDE.md)** - RAG pipeline implementation
- **[API_GATEWAY.md](./docs/API_GATEWAY.md)** - Backend API documentation
- **[COMPREHENSIVE_GUIDE.md](./docs/COMPREHENSIVE_GUIDE.md)** - Complete platform guide

### Reference
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and release notes
- **[DEPENDENCY_NOTES.md](./docs/DEPENDENCY_NOTES.md)** - Dependency management
- **[QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - Quick reference guide

## License

MIT License - Copyright (c) 2025 GitHub, Inc.

See [LICENSE](./LICENSE) for full details.

## Resources

### Official Documentation
- [OpenRouter API](https://openrouter.ai/docs) - Unified API for 100+ models
- [Anthropic Claude](https://docs.anthropic.com/) - Claude API documentation
- [DeepSeek Platform](https://platform.deepseek.com/) - DeepSeek API docs
- [xAI Console](https://console.x.ai/) - Grok API documentation
- [Supabase Docs](https://supabase.com/docs) - Database and auth

### Essential Repositories
- [OpenRouter TypeScript SDK](https://github.com/OpenRouterTeam/typescript-sdk)
- [Vercel AI SDK](https://github.com/vercel/ai)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [HuggingFace Transformers.js](https://github.com/huggingface/transformers.js)

## Support

- **Issues**: [GitHub Issues](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr/discussions)
- **Documentation**: See [docs/](./docs/) directory
- **Security**: See [SECURITY.md](./docs/SECURITY.md) for reporting vulnerabilities

---

**Built with** ❤️ **using** React 19, TypeScript, Vite, Tailwind CSS, and modern AI SDKs.
