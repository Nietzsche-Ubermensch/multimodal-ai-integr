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
  TestTube
} from "@phosphor-icons/react";
import { AnthropicSDKDemo } from "@/components/AnthropicSDKDemo";
import { DeepSeekSDKDemo } from "@/components/DeepSeekSDKDemo";
import { XAISDKDemo } from "@/components/XAISDKDemo";
import { OpenRouterSDKDemo } from "@/components/OpenRouterSDKDemo";
import { LiteLLMIntegrationDemo } from "@/components/LiteLLMIntegrationDemo";
import { FirecrawlTester } from "@/components/FirecrawlTester";
import { ApiKeyValidator } from "@/components/ApiKeyValidator";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { DeploymentGuide } from "@/components/DeploymentGuide";
import { EnvSetup } from "@/components/EnvSetup";

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
          <TabsList className="grid grid-cols-4 lg:grid-cols-9 w-full mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">Overview</span>
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
            <TabsTrigger value="firecrawl" className="gap-2">
              <TestTube size={16} />
              <span className="hidden sm:inline">Firecrawl</span>
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

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("litellm")}>
                  <Rocket size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">LiteLLM</h3>
                  <p className="text-sm text-muted-foreground">
                    Unified Python interface for all LLM providers with failover
                  </p>
                </Card>

                <Card className="p-6 hover:border-accent transition-colors cursor-pointer" onClick={() => setActiveTab("firecrawl")}>
                  <TestTube size={32} className="text-accent mb-3" weight="duotone" />
                  <h3 className="font-bold text-lg mb-2">Firecrawl API</h3>
                  <p className="text-sm text-muted-foreground">
                    Live web scraping demo for LLM-ready data extraction
                  </p>
                </Card>
              </div>
            </Card>

            <EnvSetup />
            <ApiDocumentation />
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

          <TabsContent value="firecrawl">
            <FirecrawlTester />
          </TabsContent>

          <TabsContent value="security">
            <ApiKeyValidator />
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