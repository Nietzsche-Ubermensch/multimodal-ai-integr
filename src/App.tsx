import { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Database, Brain, Scissors, Globe, Github, FlaskConical, MessageSquare, Search, Layers, Loader2 } from "lucide-react";

// Lazy load components
const ModelHubApp = lazy(() => import("@/components/ModelHub/ModelHubApp").then(module => ({ default: module.ModelHubApp })));
const AIModelHub2025 = lazy(() => import("@/components/AIModelHub").then(module => ({ default: module.AIModelHub2025 })));
const PromptStudio = lazy(() => import("@/components/PromptEngineering/PromptStudio"));
const SupabaseVectorRAG = lazy(() => import("@/components/SupabaseVectorRAG").then(module => ({ default: module.SupabaseVectorRAG })));
const DocumentChunkingDemo = lazy(() => import("@/components/DocumentChunkingDemo").then(module => ({ default: module.DocumentChunkingDemo })));
const UnifiedScrapingLayer = lazy(() => import("@/components/UnifiedScrapingLayer").then(module => ({ default: module.UnifiedScrapingLayer })));
const RAGTestingPanel = lazy(() => import("@/components/RAGTestingPanel").then(module => ({ default: module.RAGTestingPanel })));
const ModelHubDashboard = lazy(() => import("@/components/ModelHubDashboard").then(module => ({ default: module.ModelHubDashboard })));
const AISearchPanel = lazy(() => import("@/components/AISearchPanel").then(module => ({ default: module.AISearchPanel })));
const LibreChatInterface = lazy(() => import("@/components/LibreChatInterface").then(module => ({ default: module.LibreChatInterface })));

// GitHubModelsPlayground is unused, so it is removed.

function App() {
  const LoadingFallback = (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="modelhub2025" className="w-full">
        <div className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto">
            <TabsList className="h-14 w-full justify-start rounded-none bg-transparent border-b-0 overflow-x-auto">
              <TabsTrigger
                value="modelhub2025"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Globe className="w-4 h-4" />
                AI Model Hub 2025
              </TabsTrigger>
              <TabsTrigger
                value="modelhub"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Github className="w-4 h-4" />
                GitHub Models
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <FlaskConical className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="ai-search"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Search className="w-4 h-4" />
                AI Search
              </TabsTrigger>
              <TabsTrigger
                value="rag-testing"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Brain className="w-4 h-4" />
                RAG Testing
              </TabsTrigger>
              <TabsTrigger
                value="scraping"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Globe className="w-4 h-4" />
                Scraping
              </TabsTrigger>
              <TabsTrigger
                value="prompt-studio"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Sparkles className="w-4 h-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger
                value="modelhub"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Database className="w-4 h-4" />
                Legacy Hub
              </TabsTrigger>
              <TabsTrigger
                value="vector-rag"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Layers className="w-4 h-4" />
                Vector DB
              </TabsTrigger>
              <TabsTrigger
                value="chunking"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Scissors className="w-4 h-4" />
                Chunking
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="modelhub2025" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <AIModelHub2025 />
          </Suspense>
        </TabsContent>

        <TabsContent value="modelhub" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <ModelHubApp />
          </Suspense>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <ModelHubDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <LibreChatInterface />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai-search" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <AISearchPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="rag-testing" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <RAGTestingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="scraping" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <UnifiedScrapingLayer />
          </Suspense>
        </TabsContent>

        <TabsContent value="prompt-studio" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <PromptStudio />
          </Suspense>
        </TabsContent>

        <TabsContent value="vector-rag" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <div className="container mx-auto py-8 max-w-6xl">
              <SupabaseVectorRAG />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="chunking" className="mt-0">
          <Suspense fallback={LoadingFallback}>
            <div className="container mx-auto py-8 max-w-6xl">
              <DocumentChunkingDemo />
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
