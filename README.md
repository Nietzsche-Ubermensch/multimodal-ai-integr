# Comprehensive AI Inference Provider Guide

A complete interactive reference guide for developers building AI applications with modern inference providers. Covers 19+ essential topics from basic concepts to advanced production deployment strategies, featuring live SDK demos, real-time API testing, and production-ready code examples for Anthropic Claude, DeepSeek, xAI Grok, OpenRouter, and more.

## 🎉 Recent Updates (December 30, 2025)

### New Features
- **🧠 Explainable AI (XAI) SDK**: Added comprehensive XAI integration for neural network prediction transparency with 6 explanation methods (SHAP, attention, gradients, integrated gradients, LRP, LIME)
- **🔍 Together AI BGE Embeddings**: Integrated Together AI's BGE (BAAI General Embedding) models via OpenRouter for enhanced RAG pipeline capabilities
- **🤖 Trusted Bot Workflow**: Automated workflow for dependency updates and required status checks

### Security Enhancements
- **🔒 Rate Limiting & JWT Auth**: Added robust rate limiting and JWT authentication middleware
- **🛡️ Input Validation**: Implemented comprehensive input validation to prevent SSRF, XSS, and DoS attacks
- **🔐 RPC Allowlists**: Enhanced database security with Supabase RPC allowlists
- **✅ API Gateway Pattern**: Enforced secure server-side API calls, removing unsafe mock implementations

### Dependency Updates
- **Major Updates**: `react-resizable-panels` (v4.1.0), `recharts` (v3.6.0) - [See migration guide](./docs/DEPENDENCY_NOTES.md)
- **Minor Updates**: `react` (v19.2.3), `eslint` (v9.39.2)

📋 **Full Changelog**: See [CHANGELOG.md](./docs/CHANGELOG.md) for complete release notes and breaking changes

## 🎯 What's Covered

This guide provides comprehensive coverage of:

1. **Overview of Inference Providers** - Understanding hosted vs self-hosted solutions
2. **Pricing & Billing Models** - Cost calculation, optimization strategies, hidden fees
3. **Hub Integration** - HuggingFace (500K+ models), OpenRouter (100+ models), transformers.js
4. **Security Considerations** - API key protection, rate limiting, input validation
5. **API Calls & Integration** - Step-by-step guides for 6 major providers
6. **Building AI Applications** - Image editors, code review automation, semantic search
7. **Structured Outputs with LLMs** - JSON schema enforcement, Zod/Pydantic validation
8. **Function Calling** - Extending LLMs with external tools and agentic workflows
9. **Responses API** - Streaming, error handling, multi-turn conversations
10. **Using OpenAI GPT-OSS** - Open-source alternatives and self-hosting
11. **Building an Image Editor** - Claude Vision + DALL-E integration
12. **Automating Code Review** - GitHub Actions + GPT-4/DeepSeek integration
13. **Agentic Coding Environments** - LangChain, AutoGPT, autonomous workflows
14. **Model Evaluation** - Systematic testing with Inspect AI and PromptFoo
15. **Integrations** - Vercel AI SDK, LangChain, LiteLLM, HuggingFace
16. **Inference Tasks** - Chat, embeddings, text-to-image, text-to-video
17. **Providers** - In-depth coverage of Anthropic, DeepSeek, xAI, OpenRouter, NVIDIA, Microsoft
18. **Hub API** - Becoming an inference provider, registration requirements
19. **Resources & Documentation** - Essential repositories, learning paths, quick-starts
20. **Explainable AI (XAI)** - Transparency and interpretability for neural network predictions

📖 **Quick Reference**: See [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) for topic summaries and navigation guide
📚 **Complete Guide**: See [COMPREHENSIVE_GUIDE.md](./docs/COMPREHENSIVE_GUIDE.md) for detailed documentation
📑 **Table of Contents**: See [TOC.md](./docs/TOC.md) for complete documentation index
🧠 **XAI SDK Guide**: See [XAI_SDK_GUIDE.md](./docs/XAI_SDK_GUIDE.md) for explainable AI integration

## 🚀 Interactive Features

- **4 Live SDK Demos**: Anthropic Claude, DeepSeek, xAI Grok, OpenRouter with real/simulated API calls
- **XAI Explainer Demo**: Interactive explainable AI with 6 explanation methods (SHAP, attention, gradients, etc.)
- **API Key Validation**: Real-time testing for 6 providers with latency metrics
- **Live API Testing**: 10+ provider examples with editable JSON and temperature controls
- **Embedding Generation**: Interactive vector testing with statistics and export
- **Environment Setup**: Platform-specific guides for Vercel, Replit, Docker, AWS Lambda
- **GitHub Integration**: 7 essential repositories with quick-start code and clone commands
- **Deployment Guides**: Step-by-step instructions for 4 platforms
- **API Documentation**: Complete reference with cURL and Python examples

## ⭐ Featured: OpenRouter TypeScript SDK

This platform now includes **full integration and live testing** of the official OpenRouter TypeScript SDK!

### Clone the SDK Repository

```bash
# Clone the official OpenRouter TypeScript SDK
git clone https://github.com/OpenRouterTeam/typescript-sdk.git
cd typescript-sdk
npm install
npm run build
npm test
```

### Quick Start with the SDK

```bash
# Install the SDK in your project
npm install @openrouter/ai-sdk-provider ai
```

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText } from 'ai';

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://your-site.com',
    'X-Title': 'Your App Name'
  }
});

// Generate text
const { text } = await generateText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages: [{ role: 'user', content: 'Explain quantum entanglement' }]
});

// Stream responses
const { textStream } = await streamText({
  model: openrouter('deepseek/deepseek-chat-v3'),
  messages: [{ role: 'user', content: 'Write a story' }]
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### Interactive SDK Demo

Navigate to the **"OpenRouter TypeScript SDK Integration"** slide in the presentation to:
- View complete repository cloning instructions
- See step-by-step installation guide
- Test the SDK with your API key (live testing)
- Explore code examples for:
  - Basic text generation
  - Streaming responses
  - Multi-provider routing
  - Error handling patterns
- Try the interactive demo with real or simulated API calls
- Copy all code snippets with one click

**Slide Location**: Slide 7 - "OpenRouter TypeScript SDK Integration"

📖 **Full Documentation**: See [OPENROUTER_SDK_INTEGRATION.md](./docs/OPENROUTER_SDK_INTEGRATION.md) for complete integration guide.

## ⭐ Featured: Explainable AI (XAI) SDK

This platform now includes a **comprehensive XAI SDK** for transparent and interpretable AI predictions!

### Quick XAI Integration

```bash
# No installation needed - integrated into the platform
# Import and use directly
```

```typescript
import { explainAIResponse } from '@/lib/xai-service';

// Generate explanation for any model prediction
const explanation = await explainAIResponse(
  "Is this email spam?",              // Input
  "Yes, this appears to be spam",     // Model output
  "gpt-4o",                            // Model ID
  "openai"                             // Provider
);

// Display top contributing features
console.log(explanation.summary.explanation);
explanation.summary.topFeatures.forEach(f => {
  console.log(`${f.feature}: ${(f.score * 100).toFixed(1)}%`);
});
```

### XAI Features

- **6 Explanation Methods**: Feature importance, attention weights, gradients, integrated gradients, LRP, LIME
- **Multi-Model Support**: Text, vision, code, and multimodal AI models
- **Interactive Demo**: Test explanations with real models via the XAI Explainer component
- **Visualization**: Heatmaps, bar charts, attention matrices, and gradient visualizations
- **Export**: JSON and CSV export for further analysis
- **Batch Processing**: Explain multiple predictions efficiently
- **Model Comparison**: Compare explanations across different models

### Interactive XAI Demo

Navigate to the **"Explainable AI (XAI) SDK"** slide in the presentation to:
- Select from multiple explanation methods (SHAP, attention, gradients, etc.)
- Test with different AI models (GPT-4o, Claude, DeepSeek, Grok)
- Compare explanations side-by-side
- Visualize feature importance and attention weights
- Export explanations for analysis
- Understand why models make specific predictions

**Slide Location**: Near the end - "Explainable AI (XAI) SDK"

📖 **Full Documentation**: See [XAI_SDK_GUIDE.md](./docs/XAI_SDK_GUIDE.md) for complete XAI integration guide.

## 📋 Quick Start

### Environment Variables

This platform requires API keys from various AI providers. See [ENV_SETUP.md](./docs/ENV_SETUP.md) for comprehensive setup instructions.

**Required Keys:**
```bash
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=sk-deepseek-...
XAI_API_KEY=xai-...
```

**Optional Keys:**
```bash
NVIDIA_NIM_API_KEY=nvapi-...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spark-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your API keys to .env
   # See ENV_SETUP.md for detailed instructions
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔐 Security

**Critical Security Rules:**
- Never commit `.env` files to version control
- Never expose API keys in client-side code
- Use server-side API proxy pattern
- Rotate keys every 90 days
- Use separate keys for dev/staging/production

See [ENV_SETUP.md](./docs/ENV_SETUP.md) for complete security best practices.

## 📚 Documentation

### Getting Started
- **[QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - Quick topic summaries and navigation guide
- **[COMPREHENSIVE_GUIDE.md](./docs/COMPREHENSIVE_GUIDE.md)** - Complete guide to all 19 topics
- **[PRESENTATION_README.md](./docs/PRESENTATION_README.md)** - Presentation navigation guide

### Project Information
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and release notes
- **[DEPENDENCY_NOTES.md](./docs/DEPENDENCY_NOTES.md)** - Dependency versions and migration guides
- **[COMPREHENSIVE_UPDATE_SUMMARY.md](./docs/COMPREHENSIVE_UPDATE_SUMMARY.md)** - Detailed coverage matrix and feature status

### Technical Guides
- **[OPENROUTER_SDK_INTEGRATION.md](./docs/OPENROUTER_SDK_INTEGRATION.md)** - OpenRouter TypeScript SDK guide
- **[XAI_SDK_GUIDE.md](./docs/XAI_SDK_GUIDE.md)** - Explainable AI SDK integration guide
- **[GROK_CLI_GUIDE.md](./docs/GROK_CLI_GUIDE.md)** - grok-cli terminal assistant integration guide
- **[ENV_SETUP.md](./docs/ENV_SETUP.md)** - Environment variable setup for all platforms
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture documentation
- **[SECURITY.md](./docs/SECURITY.md)** - Security guidelines and best practices
- **[PRD.md](./docs/PRD.md)** - Product requirements and design specifications

## 🎓 Learning Paths

### Beginner Path
1. Overview of Inference Providers (Slides 1-3)
2. API Calls & Integration (Slides 9-12 - SDK Demos)
3. Live API Testing (Slide 14)
4. Environment Setup (Slide 17)

### Intermediate Path
1. Security Considerations (Slide 19 - Best Practices)
2. Structured Outputs (Documented in PRD)
3. Function Calling (Documented in PRD)
4. Model Evaluation (Documented in PRD)

### Advanced Path
1. Building AI Applications (Image Editor, Code Review)
2. Agentic Coding Environments
3. Hub API & Provider Registration
4. Production Deployment (Slides 30-31)

### Production Path
1. API Key Validation (Slide 13)
2. Security Best Practices (Slide 19)
3. Deployment Guides (Slides 30-31)
4. GitHub Integration (Slide 29)

## 🎯 Use Cases

### For Developers
- **Learning**: Comprehensive guide from basics to advanced topics
- **Reference**: Quick access to API docs, pricing models, security patterns
- **Implementation**: Production-ready code examples for 6 providers
- **Testing**: Live API playground with real/simulated modes

### For Technical Leaders
- **Architecture Decisions**: Provider comparisons, cost/quality tradeoffs
- **Security Planning**: API proxy patterns, rate limiting strategies
- **Cost Optimization**: Pricing models, caching strategies (80%+ savings)
- **Vendor Selection**: Model evaluation frameworks and benchmarks

### For Product Managers
- **Capability Assessment**: Understanding inference tasks (chat, embeddings, image, video)
- **Cost Planning**: Detailed pricing breakdowns and optimization strategies
- **Competitive Analysis**: Provider features and unique capabilities
- **Integration Planning**: Deployment timelines and platform requirements

### For Students & Educators
- **Learning Path**: Structured curriculum from beginner to advanced
- **Interactive Demos**: Hands-on experience with real AI providers
- **Code Examples**: 50+ production-ready examples in TypeScript and Python
- **Best Practices**: Security, performance, and scalability patterns

### For AI Researchers
- **Model Evaluation**: Systematic testing with Inspect AI and PromptFoo
- **Provider Comparison**: Benchmarks across GPT-4, Claude, DeepSeek, Grok
- **Cost/Quality Analysis**: Detailed metrics (GPT-4: 87.5%/$0.042 vs DeepSeek: 86.2%/$0.0002)
- **Hub Integration**: Access to 500K+ models via HuggingFace

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui v4 (Radix UI primitives)
- **Icons**: Phosphor Icons
- **Fonts**: JetBrains Mono, Inter
- **Build Tool**: Vite 7
- **Deployment**: Vercel, Replit, Docker, AWS Lambda

## 📦 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── ApiDocumentation.tsx    # API reference component
│   │   ├── ApiKeyValidator.tsx     # API key validation
│   │   ├── ApiTester.tsx           # Live API testing
│   │   ├── CodeBlock.tsx           # Syntax-highlighted code
│   │   ├── DeploymentGuide.tsx     # Platform deployment guides
│   │   ├── EmbeddingTester.tsx     # Embedding generation testing
│   │   ├── EnvSetup.tsx            # Environment variable setup
│   │   ├── GitHubIntegration.tsx   # Repository examples
│   │   ├── OpenRouterSDKDemo.tsx   # OpenRouter SDK integration demo
│   │   └── UniversalSlide.tsx      # Main slide renderer
│   ├── data/
│   │   └── slides.ts               # Slide content and configuration
│   ├── lib/
│   │   ├── api-service.ts          # API integration utilities
│   │   ├── openrouter-sdk.ts       # OpenRouter SDK wrapper
│   │   └── utils.ts                # Utility functions
│   ├── types/
│   │   └── slides.ts               # TypeScript type definitions
│   ├── App.tsx                     # Main application component
│   └── index.css                   # Global styles and theme
├── docs/                           # Documentation
│   ├── OPENROUTER_SDK_INTEGRATION.md
│   ├── ENV_SETUP.md
│   └── PRD.md
└── package.json                    # Dependencies
```

## 🎨 Theme

**Primary Color**: Deep Technical Blue `oklch(0.55 0.15 240)`
**Accent Color**: Electric Purple `oklch(0.65 0.20 290)`
**Fonts**: JetBrains Mono (code/headings), Inter (body)
**Design**: Dark theme with syntax highlighting and technical precision

## 🚢 Deployment

### Vercel
```bash
vercel env add OPENROUTER_API_KEY
vercel env add DEEPSEEK_API_KEY
vercel --prod
```

### Docker
```bash
docker build -t multimodal-ai-platform .
docker run --env-file .env -p 3000:3000 multimodal-ai-platform
```

See [ENV_SETUP.md](./docs/ENV_SETUP.md) for platform-specific deployment instructions.

## 🤝 Contributing

This is a technical reference platform. Contributions for:
- Additional AI provider integrations
- New model endpoints
- Enhanced code examples
- Improved documentation

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🔗 Resources

### Official Documentation
- [OpenRouter Documentation](https://openrouter.ai/docs) - Unified API for 100+ models
- [DeepSeek Platform](https://platform.deepseek.com/) - 671B MoE reasoning models
- [xAI Console](https://console.x.ai/) - Grok with web search integration
- [Anthropic Claude](https://www.anthropic.com/) - 200K context, best-in-class coding
- [NVIDIA NIM](https://build.nvidia.com/) - Accelerated inference platform

### Essential Repositories (Featured in Slides)
- [huggingface/transformers.js](https://github.com/huggingface/transformers.js) - Browser-based ML
- [BerriAI/litellm](https://github.com/BerriAI/litellm) - Python abstraction for 100+ LLMs
- [OpenRouterTeam/typescript-sdk](https://github.com/OpenRouterTeam/typescript-sdk) - Official TypeScript SDK
- [vercel/ai](https://github.com/vercel/ai) - AI SDK for streaming applications
- [xai-org/xai-cookbook](https://github.com/xai-org/xai-cookbook) - Advanced usage patterns
- [superagent-ai/grok-cli](https://github.com/superagent-ai/grok-cli) - AI terminal assistant powered by Grok
- [deepseek-ai/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) - 671B MoE model
- [veniceai/api-docs](https://github.com/veniceai/api-docs) - Privacy-focused inference

### Evaluation & Testing Tools
- [Inspect AI](https://github.com/UKGovernmentBEIS/inspect_ai) - Model evaluation framework
- [PromptFoo](https://github.com/promptfoo/promptfoo) - A/B testing for prompts
- [LangSmith](https://www.langchain.com/langsmith) - Tracing and monitoring

## 📊 Key Statistics

- **40+ Interactive Slides** with keyboard navigation
- **19 Comprehensive Topics** from basics to advanced
- **13+ Model Endpoints** with detailed specifications
- **6 Provider SDKs** with live demos
- **4 Deployment Platforms** supported
- **7 GitHub Repositories** with quick-starts
- **50+ Code Examples** (TypeScript, Python, YAML, Shell)
- **100% Interactive Navigation** with ESC menu and arrow keys

## 💡 Key Takeaways

### Cost Optimization
- **DeepSeek**: 1/200th the cost of GPT-4 ($0.00014 vs $0.03 per 1K input tokens)
- **Caching**: Implement for 80%+ cost savings on repeated queries
- **Model Selection**: Use smaller models for simple tasks

### Security First
- **NEVER** expose API keys in frontend code
- Always use server-side proxy pattern (POST /api/chat)
- Implement rate limiting: 100 requests/hour per user
- Sanitize all user inputs before sending to APIs

### Provider Selection
- **Anthropic Claude**: Best for coding and analysis (200K context)
- **DeepSeek**: Cost-effective reasoning (671B MoE, 37B active)
- **xAI Grok**: Real-time web search integration
- **OpenRouter**: Model flexibility and automatic fallback

### Production Best Practices
- Multi-provider fallback chains for 99.9% uptime
- Redis/KV caching for performance and cost savings
- Async processing (Celery/BullMQ) for long-running tasks
- Monitoring: Track latency, tokens, errors per model

## 🔧 Repository Maintenance

### Recommended Settings

To keep the repository clean and organized, we recommend the following GitHub settings:

#### Branch Settings
1. **Enable "Automatically delete head branches"**
   - Go to Settings → General → Pull Requests
   - Check "Automatically delete head branches"
   - This keeps your branches list clean after PRs are merged

#### Branch Protection Rules (for `main` branch)
We recommend configuring the following branch protection rules:

1. **Require pull request reviews before merging**
   - Require at least 1 approval
   - Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - `build` - TypeScript compilation and Vite build
     - `lint` - ESLint code quality checks
     - `type-check` - TypeScript type checking

3. **Require conversation resolution before merging**
   - Ensures all review comments are addressed

4. **Do not allow bypassing the above settings**
   - Applies to administrators as well

#### Repository Topics/Tags
To improve discoverability, add these topics to your repository:
- `ai` - Artificial Intelligence
- `machine-learning` - ML/AI applications
- `typescript` - Primary language
- `react` - Frontend framework
- `openrouter` - AI provider integration
- `rag` - Retrieval-Augmented Generation
- `xai` - Explainable AI
- `embeddings` - Vector embeddings
- `supabase` - Database and vector storage
- `vite` - Build tool
- `tailwindcss` - Styling framework
- `ai-sdk` - AI SDK integration
- `inference` - AI inference platform

### Dependency Management

- **Automated Updates**: The repository uses the trusted-bot workflow for dependency updates
- **Security**: Dependabot alerts are enabled for security vulnerabilities
- **Testing**: All dependency updates should be tested against the test suite before merging
- **Major Updates**: See [DEPENDENCY_NOTES.md](./docs/DEPENDENCY_NOTES.md) for migration guides

### Release Process

1. Update [CHANGELOG.md](./docs/CHANGELOG.md) with new changes
2. Run full test suite: `npm run build && npm run lint`
3. Create a release branch if needed
4. Merge to `main` via pull request
5. Tag the release: `git tag -a v1.0.0 -m "Release v1.0.0"`
6. Push tags: `git push origin --tags`

---

**Navigation**: Use arrow keys (←/→) or on-screen buttons to navigate slides. Press ESC for slide menu.
