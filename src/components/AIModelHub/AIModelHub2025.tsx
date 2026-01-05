// AI Model Hub Main Component - 2025 Models with Supabase AI

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  Brain,
  ChatCircle,
  Lightning,
  Sparkle,
  Globe,
  ArrowLeft,
  Gear,
  Info,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { ModelCatalog } from './ModelCatalog';
import { ModelChat } from './ModelChat';
import { RAGPipeline } from './RAGPipeline';
import { SupabaseAISystem } from './SupabaseAISystem';
import { AIModel, RAGCitation, LANGUAGE_FLAGS } from './types';
import { modelCatalog2025 } from './modelCatalog2025';

export function AIModelHub2025() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [chatModel, setChatModel] = useState<AIModel | null>(null);
  const [ragContext, setRagContext] = useState<RAGCitation[]>([]);
  const [showChat, setShowChat] = useState(false);

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
  };

  const handleChatWithModel = (model: AIModel) => {
    setChatModel(model);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatModel(null);
  };

  const stats = {
    total: modelCatalog2025.getAllModels().length,
    new: modelCatalog2025.getNewModels().length,
    german: modelCatalog2025.getGermanModels().length,
    japanese: modelCatalog2025.getJapaneseModels().length,
    multilingual: modelCatalog2025.getMultilingualModels().length,
    free: modelCatalog2025.getFreeModels().length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg">
                <Brain size={28} weight="bold" className="text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  AI Model Hub 2025
                  <Badge className="bg-green-500 text-white">
                    <Sparkle size={12} weight="fill" className="mr-1" />
                    NEW
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  TFree-HAT • Llama 3.1 • Qwen3 • Supabase AI Integration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Stats */}
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  🇩🇪 {stats.german}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  🇯🇵 {stats.japanese}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  🌍 {stats.multilingual}
                </Badge>
              </div>
              
              <Badge variant="outline" className="font-mono">
                {stats.total} Models
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {showChat && chatModel ? (
          // Chat View
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleCloseChat} className="gap-2">
                <ArrowLeft size={16} />
                Back to Catalog
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xl">{chatModel.languageFlag || LANGUAGE_FLAGS[chatModel.languageOptimization]}</span>
                <span className="font-medium">{chatModel.name}</span>
                {ragContext.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Database size={12} />
                    {ragContext.length} RAG docs
                  </Badge>
                )}
              </div>
            </div>
            <ModelChat
              model={chatModel}
              ragContext={ragContext}
              onClose={handleCloseChat}
            />
          </div>
        ) : (
          // Main Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="catalog" className="gap-2">
                <Database size={18} />
                Model Catalog
              </TabsTrigger>
              <TabsTrigger value="rag" className="gap-2">
                <MagnifyingGlass size={18} />
                RAG Pipeline
              </TabsTrigger>
              <TabsTrigger value="supabase" className="gap-2">
                <Lightning size={18} />
                Supabase AI
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <Info size={18} />
                About
              </TabsTrigger>
            </TabsList>

            {/* Model Catalog */}
            <TabsContent value="catalog">
              <ModelCatalog
                onSelectModel={handleSelectModel}
                onChatWithModel={handleChatWithModel}
              />
            </TabsContent>

            {/* RAG Pipeline */}
            <TabsContent value="rag">
              <RAGPipeline
                selectedModel={selectedModel || undefined}
                onModelSelect={handleSelectModel}
              />
            </TabsContent>

            {/* Supabase AI System */}
            <TabsContent value="supabase">
              <SupabaseAISystem />
            </TabsContent>

            {/* About */}
            <TabsContent value="about">
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Featured Models */}
                <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkle size={24} weight="fill" className="text-purple-500" />
                      Featured 2025 Models
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* TFree-HAT */}
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">🇩🇪</span>
                          <div>
                            <h3 className="font-semibold">TFree-HAT 7B</h3>
                            <p className="text-sm text-muted-foreground">
                              Aleph Alpha's German-optimized tokenizer-free model. 
                              Outperforms Llama 3.1 8B on 67% of German benchmarks.
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline">German</Badge>
                              <Badge variant="outline">Tokenizer-Free</Badge>
                              <Badge className="bg-green-500 text-white">NEW</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Llama 3.1 */}
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">🌍</span>
                          <div>
                            <h3 className="font-semibold">Llama 3.1 70B</h3>
                            <p className="text-sm text-muted-foreground">
                              Meta's flagship open model with 128K context window. 
                              Excellent multilingual support for German and Japanese.
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline">128K Context</Badge>
                              <Badge variant="outline">Open Source</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Qwen3 14B */}
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">🌍</span>
                          <div>
                            <h3 className="font-semibold">Qwen3 14B</h3>
                            <p className="text-sm text-muted-foreground">
                              Alibaba's multilingual powerhouse supporting 119 languages 
                              with 131K context window.
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline">119 Languages</Badge>
                              <Badge variant="outline">131K Context</Badge>
                              <Badge className="bg-green-500 text-white">NEW</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Qwen3 Japanese */}
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">🇯🇵</span>
                          <div>
                            <h3 className="font-semibold">Qwen3 Japanese</h3>
                            <p className="text-sm text-muted-foreground">
                              Specialized Japanese model - open-source alternative to 
                              Rakuten AI 3.0 with superior performance.
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="outline">Japanese</Badge>
                              <Badge variant="outline">Specialized</Badge>
                              <Badge className="bg-green-500 text-white">NEW</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Supabase AI Integration */}
                <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Lightning size={24} weight="fill" className="text-emerald-500" />
                      Supabase AI Integration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 text-center">
                        <Database size={32} className="mx-auto mb-2 text-emerald-500" />
                        <h4 className="font-medium">pgvector</h4>
                        <p className="text-sm text-muted-foreground">
                          Vector similarity search with PostgreSQL
                        </p>
                      </Card>
                      <Card className="p-4 text-center">
                        <Lightning size={32} className="mx-auto mb-2 text-cyan-500" />
                        <h4 className="font-medium">Edge Functions</h4>
                        <p className="text-sm text-muted-foreground">
                          Serverless AI processing at the edge
                        </p>
                      </Card>
                      <Card className="p-4 text-center">
                        <Globe size={32} className="mx-auto mb-2 text-blue-500" />
                        <h4 className="font-medium">Multilingual E5</h4>
                        <p className="text-sm text-muted-foreground">
                          Embeddings for 100+ languages
                        </p>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Gear size={24} />
                      Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium">Model Catalog</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Filter by provider (Hugging Face, Ollama, Supabase AI)</li>
                          <li>Filter by language (English, German, Japanese, Multilingual)</li>
                          <li>Search by model name and capabilities</li>
                          <li>View benchmarks, context windows, pricing</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">RAG Pipeline</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Generate embeddings with Supabase AI or OpenAI</li>
                          <li>Vector search with pgvector</li>
                          <li>Hybrid search (vector + full-text)</li>
                          <li>Answer generation with citations</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Multilingual Support</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>German-optimized models (TFree-HAT)</li>
                          <li>Japanese-specialized models (Qwen3)</li>
                          <li>119 languages (Qwen3 series)</li>
                          <li>Language flags for easy identification</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Deployment Options</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>API (Hugging Face, Together AI, etc.)</li>
                          <li>Ollama (local inference)</li>
                          <li>Direct download links</li>
                          <li>Supabase AI (serverless)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Models</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.new}</p>
                    <p className="text-sm text-muted-foreground">New 2025</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold">{stats.german}</p>
                    <p className="text-sm text-muted-foreground">🇩🇪 German</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold">{stats.japanese}</p>
                    <p className="text-sm text-muted-foreground">🇯🇵 Japanese</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold">{stats.multilingual}</p>
                    <p className="text-sm text-muted-foreground">🌍 Multilingual</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-500">{stats.free}</p>
                    <p className="text-sm text-muted-foreground">Free Tier</p>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p className="font-mono">AI Model Hub 2025 - Supabase AI Integration</p>
          <p className="mt-2">
            TFree-HAT 7B • Llama 3.1 70B • Qwen3 14B/235B • Japanese Models
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Badge variant="outline">🇩🇪 German-Optimized</Badge>
            <Badge variant="outline">🇯🇵 Japanese-Specialized</Badge>
            <Badge variant="outline">🌍 119 Languages</Badge>
            <Badge variant="outline">⚡ Supabase pgvector</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AIModelHub2025;
