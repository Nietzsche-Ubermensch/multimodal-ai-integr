import { ModelHubApp } from "@/components/ModelHub/ModelHubApp";
import PromptStudio from "@/components/PromptEngineering/PromptStudio";
import { SupabaseVectorRAG } from "@/components/SupabaseVectorRAG";
import { DocumentChunkingDemo } from "@/components/DocumentChunkingDemo";
import { UnifiedScrapingLayer } from "@/components/UnifiedScrapingLayer";
import { RAGTestingPanel } from "@/components/RAGTestingPanel";
import { ModelHubDashboard } from "@/components/ModelHubDashboard";
import { AISearchPanel } from "@/components/AISearchPanel";
import { LibreChatInterface } from "@/components/LibreChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Database, Brain, Scissors, Globe, Layers, FlaskConical, Search, MessageSquare } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto">
            <TabsList className="h-14 w-full justify-start rounded-none bg-transparent border-b-0 overflow-x-auto">
              <TabsTrigger
                value="dashboard"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <FlaskConical className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="modelhub"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Database className="w-4 h-4" />
                Model Hub
              </TabsTrigger>
              <TabsTrigger
                value="scraping"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Globe className="w-4 h-4" />
                Scraping
              </TabsTrigger>
              <TabsTrigger
                value="ai-search"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Search className="w-4 h-4" />
                AI Search
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="rag-testing"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Brain className="w-4 h-4" />
                RAG Testing
              </TabsTrigger>
              <TabsTrigger
                value="prompt-studio"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Sparkles className="w-4 h-4" />
                Prompt Studio
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

        <TabsContent value="dashboard" className="mt-0">
          <ModelHubDashboard />
        </TabsContent>

        <TabsContent value="modelhub" className="mt-0">
          <ModelHubApp />
        </TabsContent>

        <TabsContent value="scraping" className="mt-0">
          <div className="container mx-auto py-8 max-w-6xl">
            <UnifiedScrapingLayer />
          </div>
        </TabsContent>

        <TabsContent value="ai-search" className="mt-0">
          <div className="container mx-auto py-8 max-w-4xl">
            <AISearchPanel />
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <LibreChatInterface />
        </TabsContent>

        <TabsContent value="rag-testing" className="mt-0">
          <div className="container mx-auto py-8 max-w-7xl">
            <RAGTestingPanel />
          </div>
        </TabsContent>

        <TabsContent value="prompt-studio" className="mt-0">
          <PromptStudio />
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