import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Code, 
  Sparkle, 
  Globe, 
  Shield, 
  Rocket,
  BookOpen,
  TestTube,
  Database,
  Gauge,
  GitBranch,
  ListMagnifyingGlass
} from "@phosphor-icons/react";
import { AnthropicSDKDemo } from "@/components/AnthropicSDKDemo";
import { DeepSeekSDKDemo } from "@/components/DeepSeekSDKDemo";
import { XAISDKDemo } from "@/components/XAISDKDemo";
import { OpenRouterSDKDemo } from "@/components/OpenRouterSDKDemo";
import { LiteLLMIntegrationDemo } from "@/components/LiteLLMIntegrationDemo";
import { FirecrawlTester } from "@/components/FirecrawlTester";
import { ApiKeyValidator } from "@/components/ApiKeyValidator";
import { BatchApiKeyTester } from "@/components/BatchApiKeyTester";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { DeploymentGuide } from "@/components/DeploymentGuide";
import { EnvSetup } from "@/components/EnvSetup";
import { ApiStatusDashboard } from "@/components/ApiStatusDashboard";
import { SupabaseMCPIntegration } from "@/components/SupabaseMCPIntegration";
import { OxylabsAIStudioDemo } from "@/components/OxylabsAIStudioDemo";
import { LiteLLMGatewayDemo } from "@/components/LiteLLMGatewayDemo";
import { RAGDemo } from "@/components/RAGDemo";
import { HuggingFaceEmbeddingDemo } from "@/components/HuggingFaceEmbeddingDemo";
import { NvidiaNIMEmbeddingDemo } from "@/components/NvidiaNIMEmbeddingDemo";
import { HuggingFaceRerankDemo } from "@/components/HuggingFaceRerankDemo";
import { NvidiaNIMRerankDemo } from "@/components/NvidiaNIMRerankDemo";

function App() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <Brain size={24} weight="bold" className="text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Integration Platform</h1>
                <p className="text-sm text-muted-foreground">
                  Unified SDK Testing & Documentation Hub
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono">
              v1.0.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 lg:grid-cols-15 w-full mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2">
              <GitBranch size={16} />
              <span className="hidden sm:inline">RAG Demo</span>
            </TabsTrigger>
            <TabsTrigger value="anthropic" className="gap-2">
              <Brain size={16} />
              <span className="hidden sm:inline">Anthropic</span>
            </TabsTrigger>
            <TabsTrigger value="deepseek" className="gap-2">
              <Code size={16} />
              <span className="hidden sm:inline">DeepSeek</span>
            </TabsTrigger>
            <TabsTrigger value="xai" className="gap-2">
              <Sparkle size={16} />
              <span className="hidden sm:inline">xAI</span>
            </TabsTrigger>
            <TabsTrigger value="openrouter" className="gap-2">
              <Globe size={16} />
              <span className="hidden sm:inline">OpenRouter</span>
            </TabsTrigger>
            <TabsTrigger value="litellm" className="gap-2">
              <Rocket size={16} />
              <span className="hidden sm:inline">LiteLLM</span>
            </TabsTrigger>
            <TabsTrigger value="gateway" className="gap-2">
              <Gauge size={16} />
              <span className="hidden sm:inline">Gateway</span>
            </TabsTrigger>
            <TabsTrigger value="embeddings" className="gap-2">
              <Database size={16} />
              <span className="hidden sm:inline">Embeddings</span>
            </TabsTrigger>
            <TabsTrigger value="rerank" className="gap-2">
              <ListMagnifyingGlass size={16} />
              <span className="hidden sm:inline">Rerank</span>
            </TabsTrigger>
            <TabsTrigger value="firecrawl" className="gap-2">
              <TestTube size={16} />
              <span className="hidden sm:inline">Firecrawl</span>
            </TabsTrigger>
            <TabsTrigger value="oxylabs" className="gap-2">
              <Globe size={16} />
              <span className="hidden sm:inline">Oxylabs</span>
            </TabsTrigger>
            <TabsTrigger value="supabase" className="gap-2">
              <Database size={16} />
              <span className="hidden sm:inline">Supabase</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={16} />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="deploy" className="gap-2">
              <Rocket size={16} />
              <span className="hidden sm:inline">Deploy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Welcome to the AI Integration Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                A comprehensive platform for testing, validating, and integrating multiple AI providers
                including Anthropic Claude, DeepSeek, xAI Grok, OpenRouter, and LiteLLM.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <Card className="p-6 hover:border-accent transition-colors cursor-pointer border-accent bg-gradient-to-br from-accent/5 to-primary/5" onClick={() => setActiveTab("rag")}>
                  <GitBranch size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">End-to-End RAG Demo</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete RAG pipeline: Oxylabs scraping + Supabase vectors + LiteLLM generation
                  </p>
                  <Badge className="mt-2" variant="secondary">New!</Badge>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("anthropic")}>
                  <Brain size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Anthropic Claude</h3>
                  <p className="text-sm text-muted-foreground">
                    Test Claude 3.5 Sonnet, Opus, and Haiku with interactive SDK demos
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("deepseek")}>
                  <Code size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">DeepSeek</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore DeepSeek Chat, Reasoner, and Coder models with live testing
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("xai")}>
                  <Sparkle size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">xAI Grok</h3>
                  <p className="text-sm text-muted-foreground">
                    Test Grok 4.1 models including reasoning and vision capabilities
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("openrouter")}>
                  <Globe size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">OpenRouter</h3>
                  <p className="text-sm text-muted-foreground">
                    Access 100+ models through a unified gateway with TypeScript SDK
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("gateway")}>
                  <Gauge size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">LiteLLM Gateway</h3>
                  <p className="text-sm text-muted-foreground">
                    Production AI Gateway with load balancing, caching, and guardrails
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("embeddings")}>
                  <Database size={32} className="text-purple-500 mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Embeddings API</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate embeddings with HuggingFace and NVIDIA NIM for RAG and semantic search
                  </p>
                  <Badge className="mt-2" variant="secondary">New!</Badge>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("rerank")}>
                  <ListMagnifyingGlass size={32} className="text-pink-500 mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Rerank API</h3>
                  <p className="text-sm text-muted-foreground">
                    Improve search relevance with HuggingFace and NVIDIA NIM reranking models
                  </p>
                  <Badge className="mt-2" variant="secondary">New!</Badge>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("firecrawl")}>
                  <TestTube size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Firecrawl API</h3>
                  <p className="text-sm text-muted-foreground">
                    Live web scraping demo for LLM-ready data extraction
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("oxylabs")}>
                  <Globe size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Oxylabs AI Studio</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered web scraping with natural language prompts
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("supabase")}>
                  <Database size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Supabase MCP</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect AI assistants to Supabase for data persistence and RAG
                  </p>
                </Card>
              </div>
            </Card>

            <EnvSetup />
            <ApiDocumentation />
          </TabsContent>

          <TabsContent value="rag">
            <RAGDemo />
          </TabsContent>

          <TabsContent value="anthropic">
            <AnthropicSDKDemo />
          </TabsContent>

          <TabsContent value="deepseek">
            <DeepSeekSDKDemo />
          </TabsContent>

          <TabsContent value="xai">
            <XAISDKDemo />
          </TabsContent>

          <TabsContent value="openrouter">
            <OpenRouterSDKDemo />
          </TabsContent>

          <TabsContent value="litellm">
            <LiteLLMIntegrationDemo />
          </TabsContent>

          <TabsContent value="gateway">
            <LiteLLMGatewayDemo />
          </TabsContent>

          <TabsContent value="embeddings">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Embeddings API Integration</h2>
                <p className="text-muted-foreground mb-6">
                  Generate text embeddings using HuggingFace and NVIDIA NIM models for semantic search, RAG applications, and document similarity.
                </p>
              </Card>
              
              <HuggingFaceEmbeddingDemo />
              <NvidiaNIMEmbeddingDemo />
            </div>
          </TabsContent>

          <TabsContent value="rerank">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Rerank API Integration</h2>
                <p className="text-muted-foreground mb-6">
                  Improve search relevance by reordering documents based on semantic similarity using HuggingFace and NVIDIA NIM reranking models.
                </p>
              </Card>
              
              <HuggingFaceRerankDemo />
              <NvidiaNIMRerankDemo />
            </div>
          </TabsContent>

          <TabsContent value="firecrawl">
            <FirecrawlTester />
          </TabsContent>

          <TabsContent value="oxylabs">
            <OxylabsAIStudioDemo />
          </TabsContent>

          <TabsContent value="supabase">
            <SupabaseMCPIntegration />
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Real-Time API Status</h2>
                <p className="text-muted-foreground mb-6">
                  Monitor the live status of all configured AI providers with automatic connectivity checks and latency monitoring.
                </p>
              </Card>
              <ApiStatusDashboard />
              
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Batch API Key Testing</h2>
                <p className="text-muted-foreground mb-6">
                  Test multiple API keys simultaneously with parallel validation, real-time progress tracking, and detailed status indicators across all providers.
                </p>
              </Card>
              <BatchApiKeyTester />
              
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Individual API Key Validation</h2>
                <p className="text-muted-foreground mb-6">
                  Configure and validate your API keys individually with real-time testing across all supported providers.
                </p>
              </Card>
              <ApiKeyValidator />
            </div>
          </TabsContent>

          <TabsContent value="deploy">
            <DeploymentGuide />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>AI Integration Platform - Comprehensive SDK Testing & Documentation</p>
          <p className="mt-2">
            Built with React, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;