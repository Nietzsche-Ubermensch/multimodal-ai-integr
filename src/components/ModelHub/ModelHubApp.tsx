import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Key, 
  TestTube,
  SquaresFour,
  BookmarkSimple,
  Gear,
  ShieldCheck,
  Lightning,
  Database,
  Flask,
  DownloadSimple,
  Eye,
  MagnifyingGlass
} from "@phosphor-icons/react";
import { APIKeyManager } from "./APIKeyManager";
import { ModelExplorer } from "./ModelExplorer";
import { EnhancedPromptTester } from "./EnhancedPromptTester";
import { ResponseComparison } from "./ResponseComparison";
import { SavedPrompts } from "./SavedPrompts";
import { LiveModelTester } from "./LiveModelTester";
import { UnifiedModelCatalog } from "./UnifiedModelCatalog";
import { BatchModelTester } from "./BatchModelTester";
import { RAGPipelineDemo } from "./RAGPipelineDemo";
import { ConfigurationExporter } from "./ConfigurationExporter";
import { XAIExplainerDemo } from "@/components/XAIExplainerDemo";

export function ModelHubApp() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-neon-magenta rounded-lg flex items-center justify-center relative overflow-hidden">
                <Brain size={28} weight="bold" className="text-primary-foreground relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Integration Platform</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Unified Model Catalog - 70+ Models from All Providers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {apiKeysConfigured ? (
                <Badge variant="outline" className="gap-2 border-success text-success">
                  <ShieldCheck size={16} weight="fill" />
                  API Keys Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-2 border-warning text-warning animate-pulse">
                  <Key size={16} />
                  Configure API Keys
                </Badge>
              )}
              <Badge variant="outline" className="font-mono">
                v2.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-11 w-full mb-8 bg-card/50 backdrop-blur-sm border border-border">
            <TabsTrigger value="catalog" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database size={18} />
              <span className="hidden sm:inline">Catalog</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Gear size={18} />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DownloadSimple size={18} />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain size={18} />
              <span className="hidden sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightning size={18} weight="fill" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TestTube size={18} />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flask size={18} />
              <span className="hidden sm:inline">Batch</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <SquaresFour size={18} />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="xai" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye size={18} />
              <span className="hidden sm:inline">XAI</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookmarkSimple size={18} />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MagnifyingGlass size={18} />
              <span className="hidden sm:inline">RAG</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <UnifiedModelCatalog />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-4">
                API Key Configuration
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Securely configure and validate your API keys. All keys are encrypted and stored only in your browser.
              </p>
              <APIKeyManager onConfigurationChange={setApiKeysConfigured} />
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-4">
                Export / Import Configuration
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Backup and restore your API key configuration. Export to JSON or ENV format for easy sharing across devices.
              </p>
              <ConfigurationExporter />
            </Card>
          </TabsContent>

          <TabsContent value="explore">
            <ModelExplorer />
          </TabsContent>

          <TabsContent value="live">
            <LiveModelTester />
          </TabsContent>

          <TabsContent value="test">
            <EnhancedPromptTester apiKeysConfigured={apiKeysConfigured} />
          </TabsContent>

          <TabsContent value="batch">
            <BatchModelTester />
          </TabsContent>

          <TabsContent value="compare">
            <ResponseComparison apiKeysConfigured={apiKeysConfigured} />
          </TabsContent>

          <TabsContent value="xai">
            <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
              <XAIExplainerDemo />
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <SavedPrompts />
          </TabsContent>

          <TabsContent value="rag">
            <RAGPipelineDemo />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p className="font-mono">AI Integration Platform - Unified Model Catalog</p>
          <p className="mt-2">
            70+ Models: xAI Grok, DeepSeek, Anthropic Claude, OpenRouter, HuggingFace, OpenAI, Google Gemini, NVIDIA NIM
          </p>
          <p className="mt-2 text-xs opacity-60">
            🔒 All API keys are encrypted and stored locally in your browser. No server-side storage.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ModelHubApp;
