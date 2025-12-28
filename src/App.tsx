import { ModelHubApp } from "@/components/ModelHub/ModelHubApp";
import PromptStudio from "@/components/PromptEngineering/PromptStudio";
import { SupabaseVectorRAG } from "@/components/SupabaseVectorRAG";
import { DocumentChunkingDemo } from "@/components/DocumentChunkingDemo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Database, Brain, Scissors } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="modelhub" className="w-full">
        <div className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto">
            <TabsList className="h-14 w-full justify-start rounded-none bg-transparent border-b-0">
              <TabsTrigger
                value="modelhub"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Database className="w-4 h-4" />
                Model Hub
              </TabsTrigger>
              <TabsTrigger
                value="prompt-studio"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Sparkles className="w-4 h-4" />
                Prompt Engineering Studio
              </TabsTrigger>
              <TabsTrigger
                value="vector-rag"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Brain className="w-4 h-4" />
                Vector RAG
              </TabsTrigger>
              <TabsTrigger
                value="chunking"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Scissors className="w-4 h-4" />
                Document Chunking
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="modelhub" className="mt-0">
          <ModelHubApp />
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