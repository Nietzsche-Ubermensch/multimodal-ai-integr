# Planning Guide

A unified AI Integration Platform featuring an end-to-end RAG (Retrieval-Augmented Generation) demo that combines Oxylabs web scraping, Supabase vector storage, and LiteLLM unified inference. This platform consolidates all AI provider SDK demos, interactive API testers, and comprehensive documentation into a single, production-ready application enabling developers to build intelligent applications with real-world data.

**Experience Qualities**: 
1. **Unified & Intelligent**: Complete RAG pipeline demonstration showing web scraping → embedding → vector storage → retrieval → LLM generation, plus individual SDK testing for all major providers (Anthropic, DeepSeek, xAI, OpenRouter, LiteLLM, Firecrawl, Oxylabs, Supabase) - eliminating the complexity of integrating multiple services
2. **Production-Ready & Interactive**: Live end-to-end RAG demo with configurable URLs, questions, and LLM providers, real-time pipeline visualization, automatic code generation for Oxylabs + Supabase + LiteLLM integration, plus individual API testing for each service
3. **Comprehensive & Educational**: Complete coverage of modern AI application patterns including RAG architecture, vector databases, web scraping for LLMs, embedding generation, similarity search, and multi-provider LLM orchestration with security best practices

**Complexity Level**: Complex Application (advanced functionality with full RAG pipeline, multiple interactive views, real-time API testing, vector search demonstrations, and comprehensive educational content)

This platform enables developers to understand and implement complete AI applications - from gathering fresh data via web scraping to storing embeddings in vector databases to generating intelligent answers using multiple LLM providers - all demonstrated through interactive, production-ready examples.

## Essential Features

### Node.js API Gateway (NEW)
- **Functionality**: Production-ready Express.js/TypeScript backend providing unified REST API access to 8+ AI providers (Anthropic, DeepSeek, xAI, OpenRouter, LiteLLM, Nvidia NIM, Perplexity, HuggingFace) with JWT authentication, rate limiting, request validation, streaming support, and comprehensive error handling
- **Purpose**: Enable secure, scalable backend integration for AI applications with provider abstraction, centralized API key management, monitoring, and consistent request/response formats across all providers
- **Trigger**: Start API gateway server (`npm run dev` in api-gateway directory)
- **Progression**: Configure API keys → Start gateway → Register/login user → Get JWT token → Make chat/embeddings/rerank requests → Monitor health/metrics → Deploy with Docker
- **Success criteria**: Working authentication flow, successful API calls to configured providers, rate limiting enforcement, streaming chat responses, comprehensive API documentation, Docker deployment ready, Redis integration for rate limiting, provider health checks

### End-to-End RAG Pipeline Demo
- **Functionality**: Interactive demonstration of complete RAG workflow: Oxylabs web scraping → embedding generation → Supabase vector storage → similarity search → LiteLLM answer generation with real-time progress tracking and step-by-step visualization
- **Purpose**: Show developers exactly how to build production RAG applications combining web scraping, vector databases, and LLM inference with working code examples
- **Trigger**: Navigate to RAG Demo tab (featured prominently on overview page)
- **Progression**: Configure URL and question → Select LLM provider → Run pipeline → View scraped content → See embeddings generated → Watch Supabase storage → Observe vector search → Read AI-generated answer → Copy production Python code → Review Supabase schema → Deploy
- **Success criteria**: Complete 5-step pipeline execution (scrape, embed, store, retrieve, generate), real-time progress indicators, working demo mode with realistic data, production code generation, Supabase SQL schema examples, architecture diagrams, environment setup guide

### Unified Dashboard Interface
- **Functionality**: Tab-based navigation system consolidating all AI provider demos, API testers, documentation, and deployment guides into a single cohesive interface
- **Purpose**: Eliminate context switching between separate presentations/tools and enable seamless exploration of all AI integration concepts from one central hub
- **Trigger**: App loads with overview dashboard showing all available providers and features
- **Progression**: View overview → Select provider tab (Anthropic/DeepSeek/xAI/OpenRouter/LiteLLM/Firecrawl) → Test APIs → View documentation → Deploy → Return to overview
- **Success criteria**: Smooth tab navigation, persistent state across tabs, responsive design for all screen sizes, clear visual hierarchy, quick access to all 9 main sections

### Multi-Provider SDK Testing Suite
- **Functionality**: Interactive SDK demo components for 5 major AI providers (Anthropic, DeepSeek, xAI, OpenRouter, LiteLLM) with live API testing, model selection, real-time response generation, and production-ready code examples
- **Purpose**: Enable developers to test each provider's SDK with real or simulated API calls, compare model capabilities side-by-side, and generate production code instantly
- **Trigger**: Navigate to any provider tab (Anthropic/DeepSeek/xAI/OpenRouter/LiteLLM)
- **Progression**: Select provider → Choose model → Enter prompt → Toggle real/simulated API → Execute test → View streaming response → Copy TypeScript/Python code → Switch between installation/basic/advanced examples
- **Success criteria**: Working demos for all 5 providers, accurate model information for 20+ models, streaming support, vision API examples, error handling, toast notifications, syntax-highlighted code blocks

### Firecrawl Live API Tester
- **Functionality**: Real-time web scraping demo with URL input, endpoint selection (Scrape/Map/Search), toggle between demo and live API modes, instant Markdown/HTML preview, and automatic Python code generation
- **Purpose**: Allow developers to test Firecrawl API endpoints immediately without writing code, understand LLM-ready response formats, and build RAG applications
- **Trigger**: Navigate to Firecrawl tab
- **Progression**: Select endpoint type → Enter URL or search query → Configure options → Toggle real API mode → Execute → View formatted Markdown response → Copy JSON or Python code → Test different URLs
- **Success criteria**: Working scrape/map/search endpoints, real API integration, clean Markdown preview, JSON response viewer, auto-generated code, loading states, error handling

### Environment Setup & API Key Management
- **Functionality**: Comprehensive guide for setting up API keys securely across all providers with validation, security best practices, and example .env configurations
- **Purpose**: Help developers configure their development environment correctly and securely manage API credentials
- **Trigger**: Navigate to Security tab or view EnvSetup component on overview
- **Progression**: View provider list → Copy API key template → Set environment variables → Validate keys → Review security practices → Implement proxy patterns
- **Success criteria**: Clear instructions for all 6+ providers, .env templates, security warnings, proxy pattern examples, validation tools

### Deployment & Production Guides
- **Functionality**: Step-by-step deployment guides for Vercel, Docker, AWS, and self-hosting with configuration examples, security checklists, and monitoring setup
- **Purpose**: Enable developers to deploy AI applications to production with confidence using best practices
- **Trigger**: Navigate to Deploy tab
- **Progression**: Choose deployment platform → Review requirements → Follow configuration steps → Deploy → Set up monitoring → Review security checklist
- **Success criteria**: Working examples for 4+ deployment platforms, environment configuration guides, security best practices, monitoring setup, cost optimization tips

### Perplexity-Like Search Implementation
- **Functionality**: Complete architecture guide for building AI-powered search using Firecrawl Search API + LLM synthesis with source citations
- **Purpose**: Teach developers to build Perplexity-style answer engines that search the web, scrape content, and synthesize answers with citations
- **Trigger**: Navigate to Firecrawl + LLM integration slide
- **Progression**: Understand architecture (query → search → scrape → aggregate → synthesize) → Review Firecrawl Search advantage (URLs + content in one call) → Implement LLM synthesis with citations → Optimize for cost → Production patterns (async queues, caching)
- **Success criteria**: Complete Python implementation with Firecrawl + OpenAI, citation system using [Source X] tags, cost optimization strategies (gpt-4o-mini for synthesis), production-ready patterns for 5-15s searches, working example with xAI Grok 4.1 query

### Model Endpoints Catalog (13+ Models)
- **Functionality**: Comprehensive database covering xAI (Grok-4, Grok-Code-Fast), DeepSeek (V3, R1, Chat), NVIDIA (Nemotron Nano), Microsoft (Phi-4, WizardLM-2), Google, OpenAI, and community models
- **Purpose**: Reference guide for model selection with specifications (context length, parameters, use cases, pricing)
- **Trigger**: Navigate through model endpoint slides (Part 1, 2, 3)
- **Progression**: Browse categorized models → View specifications → Understand optimal use cases → Compare capabilities
- **Success criteria**: Complete model information including context windows, parameter counts, specialized capabilities, and provider routing

### Embedding Models Configuration
- **Functionality**: Detailed coverage of google/gemini-embedding-001 (768-dim), openai/text-embedding-3-large (3072-dim), operational mechanics, and optimization strategies
- **Purpose**: Enable semantic search, RAG applications, and clustering with proper embedding configuration
- **Trigger**: Navigate to embeddings slide
- **Progression**: Learn embedding concepts → View configuration code → Understand dimensionality tradeoffs → Implement similarity search
- **Success criteria**: Working code examples for embedding generation, cosine similarity calculation, and vector search integration

### Interactive API Testing (10+ Examples)
- **Functionality**: Live request/response testing with 10 provider examples covering all major models, temperature controls, editable JSON, real API call toggle, and both simulated and live responses
- **Purpose**: Allow developers to experiment with API payloads, adjust parameters, test with real API keys, and see model-specific responses
- **Trigger**: Navigate to Live API Testing slide
- **Progression**: Select provider/model → Adjust temperature slider → Toggle real/simulated API → Edit request JSON → Send request → View formatted response with latency/tokens → Copy JSON or cURL
- **Success criteria**: Accurate model-specific responses (both simulated and real), dynamic parameter controls, token counting, latency measurement, real API integration with error handling, copy functionality

### API Key Validation & Real-Time Status Monitoring (6 Providers)
- **Functionality**: Comprehensive API key management system with real-time validation, live provider status monitoring, latency tracking, auto-refresh capabilities, and security best practices for OpenRouter, DeepSeek, xAI, NVIDIA, OpenAI, and Anthropic
- **Purpose**: Enable developers to validate API keys before deployment, monitor provider availability in real-time, track performance metrics, and ensure all required integrations are functional
- **Trigger**: Navigate to Security tab
- **Progression**: 
  1. **Status Dashboard**: View live status of all providers → Monitor latency metrics → Check required vs optional providers → Enable auto-refresh (30s intervals)
  2. **Key Configuration**: Enter API key → Automatic format validation → Click individual test or validate all → View validation result with latency and model count → See success/error feedback with detailed messages
  3. **Monitoring**: Track provider uptime → View average latency across all providers → Monitor connection health → Receive visual status indicators
- **Success criteria**: 
  - Real API endpoint testing with 10s timeout
  - Accurate format validation with regex patterns (sk-or-v1-*, sk-ant-*, xai-*, nvapi-*, etc.)
  - Model availability counts and lists
  - Latency metrics with color-coded performance indicators (<2000ms green, >2000ms yellow)
  - Secure local storage with privacy warnings
  - Live status dashboard showing online/offline/degraded/unknown states
  - Auto-refresh capability for continuous monitoring
  - Summary cards showing configured count, validated count, required provider status, and average latency
  - Progress bars for latency visualization
  - Last-checked timestamps for each provider
  - Detailed error messages for failed validations

### Embedding Generation Testing
- **Functionality**: Interactive embedding generation with support for Google Gemini and OpenAI models, real/simulated API toggle, vector statistics display (magnitude, mean, std dev, range), and export functionality
- **Purpose**: Enable testing of embedding models for semantic search and RAG applications with real vector output
- **Trigger**: Navigate to Embedding Generation slide  
- **Progression**: Select embedding model → Enter input text → Toggle real/simulated → Generate embedding → View vector statistics → Export embedding JSON
- **Success criteria**: Support for 4+ embedding models, real API integration, accurate vector statistics calculation, dimensional display, export functionality

### API Reference Documentation (5 Endpoints)
- **Functionality**: Complete endpoint documentation including /api/chat, /api/embeddings, /api/models, /api/config, /api/health with parameter specs, multi-language examples (cURL, Python), success/error responses
- **Purpose**: Technical reference for API implementation with production-ready code snippets
- **Trigger**: Navigate to API Reference slide
- **Progression**: Select endpoint → View parameters with type/required badges → Switch between cURL/Python/Success/Error tabs → Copy code examples
- **Success criteria**: All parameters documented with types, both cURL and Python examples for each endpoint, success and error response examples, one-click copy

### Environment Variable Setup (Interactive)
- **Functionality**: Comprehensive configuration guide for all 6 AI providers (OpenRouter, DeepSeek, xAI, NVIDIA, OpenAI, Anthropic) with platform-specific instructions for Vercel, Replit, Docker, AWS Lambda, and local development
- **Purpose**: Enable secure and correct environment variable configuration across all deployment platforms with copy-ready templates
- **Trigger**: Navigate to Environment Variable Setup slide
- **Progression**: View required API keys with descriptions → Select deployment platform (Vercel/Replit/Docker/AWS/Local) → Follow numbered setup steps → Copy CLI commands or config files → Review security best practices → Validate with test commands
- **Success criteria**: Complete setup guides for 5 platforms, security warnings displayed prominently, copy functionality for .env template and platform-specific configs, validation endpoint examples

### Python Integration Patterns
- **Functionality**: LiteLLM integration with unified completion() interface, environment variable management, retry policies, and fallback handling
- **Purpose**: Provide production-ready Python code for multi-provider AI integration
- **Trigger**: Navigate to Python Integration slide
- **Progression**: Learn LiteLLM setup → Review model routing → Implement error handling → Configure retries and fallbacks
- **Success criteria**: Working code examples with proper secret management, retry logic, and multi-provider support

### LiteLLM Backend Integration (NEW - Interactive)
- **Functionality**: Comprehensive BerriAI/litellm repository integration demo with interactive provider selection (OpenRouter, DeepSeek, Anthropic, xAI, OpenAI), live completion testing, architecture visualization showing request flow (Frontend → API Gateway → LiteLLM → Caching → Providers), and production code examples across 5 tabs (Installation, Basic Usage, Router Config, Caching, Error Handling)
- **Purpose**: Demonstrate complete backend integration of LiteLLM with OpenRouter and multi-provider AI systems, showing repository setup, architecture design, secure connectivity, endpoint coordination, performance optimization (Redis caching with 80%+ hit rate), reliability features (automatic retries, fallback chains), and security patterns (environment-based secrets, rate limiting, input validation)
- **Trigger**: Navigate to LiteLLM Backend Integration slide
- **Progression**: View interactive demo → Select provider from dropdown → Enter custom prompt → Click "Test Completion" → View simulated response with latency → Explore architecture diagram showing data flow → Switch between code tabs (Install/Basic/Router/Cache/Errors) → Copy implementation code → Review performance/reliability/security features in summary cards
- **Success criteria**: Working interactive demo with 5 provider options, realistic latency simulation (1500-2500ms), architecture diagram with color-coded components, 5 complete code examples covering installation through error handling, provider-specific response variations, copy-to-clipboard functionality on all code blocks, visual architecture showing Frontend → API Gateway → LiteLLM Router → Redis Cache → Multi-provider endpoints, feature cards highlighting Performance (Redis caching, latency-based routing), Reliability (auto-retry, fallback), and Security (env secrets, rate limiting, validation)

### Real API Testing with LiteLLM Backend (NEW - Interactive)
- **Functionality**: Live API integration testing for Perplexity AI (sonar-pro, sonar-reasoning), OpenRouter (Llama 2 70B, Claude 2), NVIDIA NIM (Llama 3 70B, Nemotron 4 340B), and HuggingFace (CodeBERT embeddings, BGE reranker) with real/simulated API toggle, API key input, custom prompt testing, latency measurement, token counting, and comprehensive code examples across 4 languages (Python, Python Streaming, cURL, JavaScript)
- **Purpose**: Enable developers to test real LiteLLM backend calls with actual API keys (or simulate for development), understand provider-specific responses, view implementation code patterns, and validate API configurations before production deployment
- **Trigger**: Navigate to Real API Testing slide
- **Progression**: Select provider/model from dropdown → View model description and endpoint info → Enter API key (optional for simulation) → Write custom test prompt → Toggle real/simulated API mode → Click "Test" → View success/failure result with latency and tokens → Read response content → Switch between code example tabs (Python/Streaming/cURL/JS) → Copy implementation code → Review provider feature cards
- **Success criteria**: Support for 8 models across 4 providers (Perplexity, OpenRouter, NVIDIA NIM, HuggingFace), working real/simulated API toggle with validation, accurate latency measurement (800-2000ms simulated), provider-specific mock responses that match real API behavior, comprehensive code examples for all 4 languages showing proper environment variable usage, API key security warnings, token count display, copy-to-clipboard for all code blocks, provider feature cards highlighting unique capabilities (web search, unified gateway, enterprise inference, embeddings)

### Live Model Testing with Real API Integration (NEW - Interactive)
- **Functionality**: Production-ready live model testing component supporting 6 AI providers (OpenAI, Anthropic, OpenRouter, Perplexity, DeepSeek, xAI) with real streaming API calls, simulation mode for development, configurable parameters (temperature, max tokens), real-time metrics (latency, tokens/sec), token-by-token streaming display, and automatic code generation for implementation
- **Purpose**: Enable developers to test actual AI models with real API keys using streaming responses, validate API integrations before production deployment, compare model responses across providers, and generate production-ready code examples with proper security patterns
- **Trigger**: Navigate to Live Model Testing slide
- **Progression**: Select provider (OpenAI/Anthropic/OpenRouter/Perplexity/DeepSeek/xAI) → Choose model from dropdown → Enter API key (required for real mode, optional for simulation) → Write custom prompt → Adjust temperature slider (0-1) and max tokens (100-4000) → Toggle Real API mode (with security warnings) → Enable/disable streaming → Click "Test Real API" or "Simulate Response" → Watch real-time streaming response with live cursor → Monitor metrics panel (latency, tokens, tokens/sec, status) → Copy response to clipboard → View implementation code (TypeScript with OpenAI SDK) → Review security best practices → Copy production code examples
- **Success criteria**: 
  - Real API integration working for all 6 providers using OpenAI SDK with provider-specific base URLs
  - Actual streaming responses via async generators with token-by-token display
  - Accurate real-time metrics: latency measurement, token counting, tokens-per-second calculation
  - Simulation mode with realistic provider-specific mock responses for development/testing
  - Security warnings about `dangerouslyAllowBrowser` with clear guidance to use backend proxy
  - Parameter controls: temperature (0-1, 0.05 steps), max tokens (100-4000, 100 steps)
  - Provider-specific model lists (3-4 models per provider)
  - Live metrics panel showing: latency (ms), tokens generated, speed (t/s), status badges
  - Response display with auto-scroll during streaming, copy button, inline cursor animation
  - Auto-generated TypeScript code examples showing streaming and non-streaming patterns
  - Implementation code tab with syntax highlighting and one-click copy
  - Security info tab explaining production best practices (backend proxy, rate limiting, input validation)
  - Proper error handling with user-friendly messages
  - Stop button to cancel ongoing streaming requests
  - Visual status indicators (Ready/Processing/Complete with color-coded badges)
  - Responsive layout working on desktop and mobile

### Integration Best Practices
- **Functionality**: Enterprise-grade patterns for security (API proxy), performance (caching), scalability (async queues), monitoring (metrics), cost optimization, and failover strategies
- **Purpose**: Guide production deployment with 99.9% uptime and cost efficiency
- **Trigger**: Navigate to Best Practices slide
- **Progression**: Review security patterns → Implement caching strategies → Configure monitoring → Design failover chains
- **Success criteria**: Clear recommendations for proxy patterns, Redis caching, async processing, metrics tracking, and multi-model fallback

### GitHub Repository Integration (7 Repositories + Live SDK Testing)
- **Functionality**: Interactive repository catalog featuring OpenRouterTeam/typescript-sdk (Featured with live testing), BerriAI/litellm, OpenRouterTeam/ai-sdk-provider, deepseek-ai/DeepSeek-Math-V2, xai-org/xai-cookbook, veniceai/api-docs, and huggingface/dataset-viewer with quick-start code, star counts, key features, and live SDK testing interface
- **Purpose**: Provide direct access to production-ready repositories with actionable integration examples and real-time testing of the OpenRouter TypeScript SDK
- **Trigger**: Navigate to GitHub Integration slide
- **Progression**: View SDK Test alert → Click "Show SDK Test" → Enter OpenRouter API key → Test live SDK integration → Browse repositories by category → View key features and highlights → Copy quick-start code → Copy clone commands → Click through to GitHub
- **Success criteria**: All 7 repositories displayed with accurate descriptions, working quick-start code snippets, live GitHub links, organized by category (Featured, Orchestration, Integration, Models, Documentation, Tools), plus functional live SDK testing with API key validation, real API calls, response display, and latency metrics

### Deployment Guides (4 Platforms)
- **Functionality**: Step-by-step deployment tutorials for Vercel (serverless), Replit (instant dev environment), Docker (containerized), and AWS Lambda (serverless architecture) with environment variable setup, build commands, and production optimizations
- **Purpose**: Enable rapid deployment to production with platform-specific best practices for API key management, auto-scaling, and cost optimization
- **Trigger**: Navigate to Deployment Guides slide
- **Progression**: Select deployment platform → Review prerequisites → Copy configuration files → Run deployment commands → Verify with health check → Configure environment variables → Monitor deployment
- **Success criteria**: Working deployment guides with copy-ready config files, platform-specific CLI commands, health check endpoints, troubleshooting tips for each platform

### Comprehensive Inference Provider Topics

#### Overview of Inference Providers
- **Functionality**: Detailed explanation of what inference providers are, their role in AI applications, comparison of hosted vs. self-hosted solutions, provider ecosystems (OpenRouter, HuggingFace, Replicate), and strategic selection criteria
- **Purpose**: Help developers understand the AI inference landscape and make informed decisions about provider selection based on cost, latency, model availability, and compliance requirements
- **Trigger**: Navigate to platform overview slides
- **Progression**: Learn provider definitions → Understand hosted vs self-hosted tradeoffs → Compare provider ecosystems → Evaluate selection criteria → Review use cases
- **Success criteria**: Clear explanation of inference providers, comparison tables, decision frameworks, and real-world application examples

#### Pricing & Billing Models
- **Functionality**: Comprehensive breakdown of pricing models (pay-per-token, subscription tiers, enterprise contracts), cost factors (model size, context length, real-time vs batch), hidden fees (rate limits, vision surcharges, fine-tuning storage), and cost optimization strategies (caching, model selection, batch processing)
- **Purpose**: Enable developers to accurately estimate costs, identify cost-saving opportunities, and avoid unexpected charges in production AI applications
- **Trigger**: Slides or documentation section on pricing
- **Progression**: Understand pricing models → Learn cost factors → Identify hidden fees → Calculate example costs → Implement optimization strategies
- **Success criteria**: Working cost calculation examples, pricing comparison tables for major providers (GPT-4, Claude, DeepSeek), optimization techniques with quantified savings (80%+ cache hit rates)

#### Hub Integration (HuggingFace, OpenRouter)
- **Functionality**: Complete guides for integrating with HuggingFace Hub (500K+ models) and OpenRouter (100+ models), transformers.js for browser-based ML, step-by-step integration process, authentication, model discovery, and deployment patterns
- **Purpose**: Enable seamless access to vast model libraries without managing multiple provider accounts, support browser-based inference without backend infrastructure
- **Trigger**: Hub integration slides and code examples
- **Progression**: Browse model hubs → Select appropriate models → Install SDKs → Authenticate → Load models → Run inference → Deploy applications
- **Success criteria**: Working examples for HuggingFace Hub integration, transformers.js browser demos, OpenRouter multi-model routing, and model selection best practices

#### Security Considerations
- **Functionality**: Critical security protocols including API key protection (server-side proxy pattern), input validation (prompt injection prevention), rate limiting (per-user quotas), data privacy (PII handling, self-hosted options), monitoring (logging, cost alerts, anomaly detection), and compliance requirements (GDPR, HIPAA)
- **Purpose**: Prevent security vulnerabilities, protect API keys from exposure, avoid cost explosions from abuse, ensure data privacy compliance, and maintain production system integrity
- **Trigger**: Security slides with code examples and best practices
- **Progression**: Learn API proxy pattern → Implement input validation → Configure rate limiting → Set up monitoring → Review compliance requirements → Test security measures
- **Success criteria**: Production-ready security code examples (Next.js API routes, rate limiting with Redis), comprehensive security checklist, vulnerability mitigation strategies, and compliance documentation

#### Structured Outputs with LLMs
- **Functionality**: In-depth coverage of JSON schema enforcement, Zod/Pydantic schema definitions, response_format configuration, validation strategies, retry logic with error feedback, and use cases (data extraction, form generation, database insertions)
- **Purpose**: Eliminate parsing errors, ensure type safety, enable reliable structured data extraction, and build robust AI applications with predictable outputs
- **Trigger**: Structured outputs slides with TypeScript/Python examples
- **Progression**: Define JSON schemas → Configure response format → Validate outputs → Handle errors → Implement retry logic → Test edge cases
- **Success criteria**: Working Zod/Pydantic schema examples, OpenAI/Anthropic structured output demos, validation error handling, and production use cases

#### Function Calling
- **Functionality**: Complete guide to function calling including schema definition, LLM decision logic, function execution patterns, result handling, multi-step agentic workflows, and use cases (weather APIs, database queries, email sending, calendar management, complex calculations)
- **Purpose**: Extend LLM capabilities beyond text generation, reduce hallucination with real data, enable real-time information access, and create sophisticated agentic AI systems
- **Trigger**: Function calling slides with detailed examples
- **Progression**: Define function schemas → LLM decides when to call → Parse function call JSON → Execute function → Return results to LLM → Generate final response → Build multi-step workflows
- **Success criteria**: Working function calling examples (weather API, database search), multi-function orchestration, error handling, and agentic workflow patterns

#### Inference Task Types
- **Functionality**: Comprehensive coverage of inference tasks: (1) Chat completion with streaming and multi-turn context, (2) Feature extraction (embeddings) for semantic search and RAG, (3) Text-to-image generation with DALL-E 3 and Stable Diffusion, (4) Text-to-video with emerging providers (Runway, Pika Labs)
- **Purpose**: Understand different AI capabilities, select appropriate models for specific tasks, implement diverse AI features, and explore cutting-edge multimodal applications
- **Trigger**: Inference tasks slides with code examples for each type
- **Progression**: Learn task categories → Understand model selection → Implement chat completion → Generate embeddings → Create images → Explore video generation
- **Success criteria**: Working examples for all task types, model recommendations, performance optimization techniques, and cost comparisons

#### Building AI Applications
- **Functionality**: Detailed guides for building real AI applications including: (1) AI Image Editor with Claude Vision + DALL-E (inpainting, outpainting, style transfer, object removal), (2) Code Review Automation with GitHub Actions + GPT-4/DeepSeek, (3) Semantic search with embeddings, (4) RAG applications
- **Purpose**: Provide end-to-end application examples that developers can adapt for their own projects, demonstrate integration of multiple AI capabilities, and showcase production-ready patterns
- **Trigger**: Application-specific slides with complete implementations
- **Progression**: Understand application architecture → Review component breakdown → Study code examples → Implement core features → Test integrations → Deploy to production
- **Success criteria**: Complete working examples for AI image editor (Canvas API + Claude + DALL-E), GitHub Actions code review automation, semantic search implementation, and RAG application patterns

#### Model Evaluation & Benchmarking
- **Functionality**: Systematic model evaluation using Inspect AI, PromptFoo A/B testing, LangSmith tracing, metrics (accuracy, F1, perplexity, BLEU, human eval), cost/quality tradeoff analysis, and iterative prompt engineering
- **Purpose**: Make data-driven model selection decisions, optimize for cost vs quality, identify model strengths/weaknesses, and continuously improve AI application performance
- **Trigger**: Model evaluation slides with benchmark examples
- **Progression**: Define evaluation datasets → Configure evaluation frameworks → Run multi-model comparisons → Analyze metrics → Review failure cases → Iterate prompts → Make selection decisions
- **Success criteria**: Working Inspect AI and PromptFoo examples, metric calculation code, cost/quality comparison tables (GPT-4 vs DeepSeek vs Claude), and evaluation best practices

#### Hub API & Provider Registration
- **Functionality**: Guide to becoming an inference provider including API endpoint implementation (/v1/chat/completions), health checks, hub registry submission, SLA requirements (99.9% uptime, <2s latency), OpenAI-compatible API design, and billing integration
- **Purpose**: Enable developers to offer their own models through aggregator platforms, understand provider ecosystem requirements, and potentially monetize AI infrastructure
- **Trigger**: Hub API provider registration slides with Flask/FastAPI examples
- **Progression**: Implement OpenAI-compatible endpoint → Add health checks → Submit to registry → Pass latency tests → Configure billing → Get listed on hub
- **Success criteria**: Minimal working provider API (Flask + HuggingFace Transformers), OpenAI format compliance, health endpoint implementation, and registration checklist

#### Extended Resources & Documentation
- **Functionality**: Curated list of essential repositories with descriptions, quick-start code, and learning paths: (1) huggingface/transformers.js - browser-based ML, (2) BerriAI/litellm - unified Python interface, (3) OpenRouterTeam/typescript-sdk - official SDK, (4) Inspect AI - evaluation framework, (5) Venice API - privacy-focused inference, plus documentation links and community resources
- **Purpose**: Provide developers with authoritative resources for deep dives, reference implementations, and community support beyond the presentation
- **Trigger**: Resources slides and documentation sections
- **Progression**: Browse repository categories → Review descriptions and key features → Copy quick-start code → Clone repositories → Explore documentation → Join communities
- **Success criteria**: Accurate repository information with star counts, working quick-start examples, direct GitHub links, categorization (Orchestration, Integration, Models, Tools), and documentation links
- **Functionality**: Step-by-step deployment instructions for Vercel (serverless with automatic scaling), Replit (instant dev environment with secrets), Docker (containerized with Redis), and AWS Lambda (serverless architecture)
- **Purpose**: Enable immediate production deployment with platform-specific configurations
- **Trigger**: Navigate to Deployment Guides slide
- **Progression**: Select deployment platform → Follow numbered steps → Copy configuration files → Deploy to production
- **Success criteria**: Complete guides for each platform including CLI commands, environment variable setup, configuration files (vercel.json, Dockerfile, docker-compose.yml, serverless.yml), and deployment commands

## Edge Case Handling

- **Keyboard Navigation Conflicts**: Prevent default browser shortcuts during presentation mode
- **Code Copy Failures**: Fallback to manual selection if clipboard API unavailable
- **Long Code Blocks**: Implement horizontal scroll with visible indicators for overflow content
- **Mobile Viewing**: Responsive layout with touch swipe navigation for tablets
- **Missing Content**: Graceful loading states and error messages for unavailable resources

## Design Direction

The design should evoke the feeling of a **high-fidelity developer conference presentation** with a sophisticated, code-centric aesthetic. Think technical documentation meets interactive playground—professional, precise, and built for engineers who appreciate attention to detail. The interface should feel like premium developer tooling with dark themes, monospace typography, and technical precision.

## Color Selection

**Primary Color**: Deep Technical Blue `oklch(0.55 0.15 240)` - Represents trust, technical precision, and cutting-edge AI technology
**Secondary Colors**: 
  - Code Background: Rich Dark `oklch(0.15 0.01 240)` for code blocks and slide backgrounds
  - Accent Cyan: `oklch(0.75 0.12 200)` for interactive elements, links, and highlights
  - Success Green: `oklch(0.70 0.15 145)` for code syntax and positive indicators
**Accent Color**: Electric Purple `oklch(0.65 0.20 290)` for CTAs, active states, and model badges
**Foreground/Background Pairings**:
  - Primary Background `oklch(0.12 0.02 240)`: Light text `oklch(0.95 0.01 240)` - Ratio 18.2:1 ✓
  - Code Background `oklch(0.15 0.01 240)`: Syntax colors `oklch(0.75 0.12 200)` - Ratio 12.5:1 ✓
  - Accent (Electric Purple `oklch(0.65 0.20 290)`): White text `oklch(1 0 0)` - Ratio 5.8:1 ✓

## Font Selection

Typography must convey technical precision and code-readability while maintaining professional presentation quality.

- **Typographic Hierarchy**:
  - H1 (Slide Titles): JetBrains Mono Bold / 56px / tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter SemiBold / 32px / normal spacing
  - H3 (Subsections): Inter Medium / 24px / normal spacing
  - Body Text: Inter Regular / 16px / 1.6 line height
  - Code Blocks: JetBrains Mono Regular / 14px / 1.5 line height
  - Inline Code: JetBrains Mono Medium / 15px / background highlight

**Primary Font**: JetBrains Mono for code, headings, and technical content—engineered for developers with excellent character distinction
**Secondary Font**: Inter for body text and UI elements—clean, modern, highly readable at all sizes

## Animations

Animations should enhance the technical presentation experience with subtle, purposeful motion that aids comprehension without distraction.

- **Slide Transitions**: Smooth horizontal slide with 400ms cubic-bezier easing for professional presentation feel
- **Code Block Reveal**: Subtle fade-in with syntax highlighting cascade (50ms stagger per line)
- **Navigation Highlights**: Quick pulse effect (200ms) when section becomes active
- **Copy Feedback**: Success toast with slide-up animation confirming code copied
- **Hover States**: Gentle color shift (150ms) on interactive elements for tactile feedback

## Component Selection

- **Components**: 
  - `Card` for slide containers with custom dark styling and border accents
  - `Button` for navigation controls with icon support (phosphor-icons)
  - `Tabs` for switching between code examples and cURL/response views
  - `Badge` for model types, API versions, and feature tags
  - `Dialog` for expanded code views and detailed specifications
  - `Separator` for section divisions within slides
  - `ScrollArea` for long code blocks and content overflow
  - `Textarea` for editable API request payloads in interactive testing
  - `Select` for choosing between API provider examples

- **Customizations**: 
  - Custom syntax highlighter component for code blocks (not using external libraries)
  - Full-screen slide container with fixed aspect ratio for presentation mode
  - Progress indicator showing current slide position
  - Custom keyboard shortcut handler for presentation navigation
  - Interactive API testing component with live request/response simulation
  - Copy-to-clipboard functionality with visual feedback throughout

- **States**: 
  - Buttons: Default (semi-transparent), Hover (accent glow), Active (pressed state), Disabled (low opacity)
  - Code Blocks: Default (dark bg), Hover (border highlight), Copied (success flash)
  - Slides: Active (visible), Previous/Next (pre-loaded), Inactive (unmounted)
  - Interactive Elements: Editing (focused textarea), Loading (processing request), Success (response received)

- **Icon Selection**: 
  - `ArrowLeft/ArrowRight` for slide navigation
  - `Copy/Check` for code copy states
  - `Code/Terminal` for code section indicators
  - `GitBranch` for repository references
  - `Rocket` for deployment examples
  - `Brain/Cpu` for AI model indicators
  - `Play/Lightning` for interactive API testing triggers
  - `List` for slide menu navigation

- **Spacing**: Consistent 8px base unit - cards (24px padding), sections (32px gap), slides (40px margins)

- **Mobile**: 
  - Stack slide content vertically on <768px
  - Touch swipe gestures for slide navigation
  - Reduced font sizes (H1: 36px, Body: 14px)
  - Collapsible code blocks with expand button
  - Bottom-fixed navigation bar for mobile controls
