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
  ShieldCheck
} from "@phosphor-icons/react";
import { APIKeyManager } from "./APIKeyManager";
import { ModelExplorer } from "./ModelExplorer";
import { EnhancedPromptTester } from "./EnhancedPromptTester";
import { ResponseComparison } from "./ResponseComparison";
import { SavedPrompts } from "./SavedPrompts";

export function ModelHubApp() {
  const [activeTab, setActiveTab] = useState("explore");
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
                <h1 className="text-2xl font-bold tracking-tight">ModelHub</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Test & Compare Multiple AI Models
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
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-8 bg-card/50 backdrop-blur-sm border border-border">
            <TabsTrigger value="config" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Gear size={18} />
              <span className="hidden sm:inline">API Config</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain size={18} />
              <span className="hidden sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TestTube size={18} />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <SquaresFour size={18} />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookmarkSimple size={18} />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="explore">
            <ModelExplorer />
          </TabsContent>

          <TabsContent value="test">
            <EnhancedPromptTester apiKeysConfigured={apiKeysConfigured} />
          </TabsContent>

          <TabsContent value="compare">
            <ResponseComparison apiKeysConfigured={apiKeysConfigured} />
          </TabsContent>

          <TabsContent value="saved">
            <SavedPrompts />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p className="font-mono">ModelHub - Unified AI Integration Platform</p>
          <p className="mt-2">
            Supports OpenRouter, xAI Grok, DeepSeek, Anthropic Claude, and OpenAI
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
