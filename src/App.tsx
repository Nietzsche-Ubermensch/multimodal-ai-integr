import { ModelHubApp } from "@/components/ModelHub/ModelHubApp";
import { AIModelHub2025 } from "@/components/AIModelHub";
import PromptStudio from "@/components/PromptEngineering/PromptStudio";
import { SupabaseVectorRAG } from "@/components/SupabaseVectorRAG";
import { DocumentChunkingDemo } from "@/components/DocumentChunkingDemo";
import { UnifiedScrapingLayer } from "@/components/UnifiedScrapingLayer";
import { RAGTestingPanel } from "@/components/RAGTestingPanel";
import { ModelHubDashboard } from "@/components/ModelHubDashboard";
import { AISearchPanel } from "@/components/AISearchPanel";
import { LibreChatInterface } from "@/components/LibreChatInterface";
import { GitHubModelsPlayground } from "@/components/GitHubModelsPlayground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Database, Brain, Scissors, Globe } from "lucide-react";

function App() {
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
          <AIModelHub2025 />
        </TabsContent>

        <TabsContent value="modelhub" className="mt-0">
          <ModelHubApp />
        </TabsContent>

        <TabsContent value="prompt-studio" className="mt-0">
          <PromptStudio />
        </TabsContent>

        <TabsContent value="modelhub" className="mt-0">
          <ModelHubApp />
        </TabsContent>

        <TabsContent value="vector-rag" className="mt-0">
          <div className="container mx-auto py-8 max-w-6xl">
            <SupabaseVectorRAG />
          </div>
        </TabsContent>

        <TabsContent value="chunking" className="mt-0">
          <div className="container mx-auto py-8 max-w-6xl">
            <DocumentChunkingDemo />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;