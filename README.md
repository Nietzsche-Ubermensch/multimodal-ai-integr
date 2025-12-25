# Multimodal AI Integration Platform

A comprehensive technical presentation platform for exploring multimodal AI integration architectures, API configurations, and implementation patterns across DeepSeek, OpenRouter, xAI, NVIDIA, Microsoft, Google, and other leading AI platforms.

## 🚀 Features

- **Platform Overview**: In-depth coverage of DeepSeek and OpenRouter capabilities
- **Model Catalog**: 13+ AI models with detailed specifications
- **Live API Testing**: Interactive request/response testing for 10+ providers
- **OpenRouter SDK Integration**: Live testing of the official TypeScript SDK
- **API Documentation**: Complete endpoint reference with cURL and Python examples
- **Environment Setup**: Platform-specific configuration guides (Vercel, Replit, Docker, AWS, Local)
- **Python Integration**: LiteLLM patterns with error handling and retries
- **GitHub Integration**: 7 production-ready repositories with quick-start code and live SDK testing
- **Deployment Guides**: Step-by-step instructions for 4 platforms
- **Best Practices**: Security, performance, and scalability patterns

## ⭐ Featured: OpenRouter TypeScript SDK

This platform now includes **live integration testing** for the official OpenRouter TypeScript SDK!

### Quick Start with the SDK

```bash
# Install the SDK
npm install @openrouter/ai-sdk-provider ai openai
```

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText } from 'ai';

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
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

### Test the SDK Live

Navigate to the "GitHub Repository Integration" slide in the presentation to:
- Test the OpenRouter TypeScript SDK with your API key
- View live response times and outputs
- Copy installation commands
- Access complete deployment guides

Repository: `gh repo clone OpenRouterTeam/typescript-sdk`

## 📋 Quick Start

### Environment Variables

This platform requires API keys from various AI providers. See [ENV_SETUP.md](./ENV_SETUP.md) for comprehensive setup instructions.

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

See [ENV_SETUP.md](./ENV_SETUP.md) for complete security best practices.

## 📚 Documentation

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Comprehensive environment variable setup guide
- **[PRD.md](./PRD.md)** - Product requirements and design specifications
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture documentation
- **[SECURITY.md](./SECURITY.md)** - Security guidelines and best practices
- **[PRESENTATION_README.md](./PRESENTATION_README.md)** - Presentation navigation guide

## 🎯 Use Cases

- **AI Integration Specialists**: Reference guide for multi-provider AI architectures
- **Technical Presentations**: Interactive slides for conferences and workshops
- **Developer Documentation**: Complete API reference and code examples
- **Educational Resource**: Learn multimodal AI integration patterns

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
│   │   ├── ApiTester.tsx           # Live API testing
│   │   ├── CodeBlock.tsx           # Syntax-highlighted code
│   │   ├── DeploymentGuide.tsx     # Platform deployment guides
│   │   ├── EnvSetup.tsx            # Environment variable setup
│   │   ├── GitHubIntegration.tsx   # Repository examples
│   │   └── UniversalSlide.tsx      # Main slide renderer
│   ├── data/
│   │   └── slides.ts               # Slide content and configuration
│   ├── types/
│   │   └── slides.ts               # TypeScript type definitions
│   ├── App.tsx                     # Main application component
│   └── index.css                   # Global styles and theme
├── ENV_SETUP.md                    # Environment setup guide
├── PRD.md                          # Product requirements
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

See [ENV_SETUP.md](./ENV_SETUP.md) for platform-specific deployment instructions.

## 🤝 Contributing

This is a technical reference platform. Contributions for:
- Additional AI provider integrations
- New model endpoints
- Enhanced code examples
- Improved documentation

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🔗 Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [xAI Console](https://console.x.ai/)
- [NVIDIA NIM](https://build.nvidia.com/)
- [BerriAI/litellm](https://github.com/BerriAI/litellm)

---

**Navigation**: Use arrow keys (←/→) or on-screen buttons to navigate slides. Press ESC for slide menu.
