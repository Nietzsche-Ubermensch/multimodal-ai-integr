import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { catalogInstance, PROVIDER_COLORS, UnifiedModel, ProviderType, ModelType } from '@/data/unifiedModelCatalog';
import { ModelParameterConfig } from './ModelParameterConfig';
import { 
  MagnifyingGlass, 
  Cpu, 
  CurrencyDollar, 
  Lightning, 
  Code, 
  Eye, 
  ChatCircle,
  Brain,
  Database,
  ChartBar,
  Funnel,
  X,
  Sliders,
  Play,
  Info
} from '@phosphor-icons/react';

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  reasoning: <Brain size={16} />,
  code: <Code size={16} />,
  vision: <Eye size={16} />,
  chat: <ChatCircle size={16} />,
  embedding: <Database size={16} />,
};

export function UnifiedModelCatalog() {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<UnifiedModel | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const allModels = catalogInstance.getAllModels();
  const allTags = catalogInstance.getAllTags();
  const providerStats = catalogInstance.getProviderStats();

  const filteredModels = useMemo(() => {
    let result = allModels;

    if (search) {
      result = catalogInstance.search(search);
    }

    if (selectedProvider !== 'all') {
      result = result.filter((m) => m.provider === selectedProvider);
    }

    if (selectedType !== 'all') {
      result = result.filter((m) => m.modelType === selectedType);
    }

    if (selectedTag !== 'all') {
      result = result.filter((m) => m.tags.includes(selectedTag));
    }

    return result;
  }, [search, selectedProvider, selectedType, selectedTag, allModels]);

  const maxContext = 2_000_000;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">Total Models</span>
            </div>
            <p className="text-3xl font-bold">{allModels.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-neon-magenta/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar size={20} className="text-accent" />
              <span className="text-sm text-muted-foreground">Providers</span>
            </div>
            <p className="text-3xl font-bold">{Object.keys(providerStats).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={20} className="text-success" />
              <span className="text-sm text-muted-foreground">Filtered</span>
            </div>
            <p className="text-3xl font-bold">{filteredModels.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightning size={20} className="text-warning" />
              <span className="text-sm text-muted-foreground">Categories</span>
            </div>
            <p className="text-3xl font-bold">{allTags.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search models by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-40">
                <Funnel size={16} className="mr-2" />
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {Object.entries(providerStats).map(([provider, count]) => (
                  <SelectItem key={provider} value={provider}>
                    {provider} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="reasoning">Reasoning</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="vision">Vision</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.slice(0, 20).map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || selectedProvider !== 'all' || selectedType !== 'all' || selectedTag !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedProvider('all');
                  setSelectedType('all');
                  setSelectedTag('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => (
          <Card
            key={model.id}
            className="hover:shadow-lg hover:shadow-accent/20 transition-all cursor-pointer group"
            onClick={() => setSelectedModel(model)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate group-hover:text-accent transition-colors">
                    {model.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                    {model.id}
                  </p>
                </div>
                <Badge className={PROVIDER_COLORS[model.provider]} variant="secondary">
                  {model.provider}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Context Window */}
              <div className="flex items-center gap-2 text-sm">
                <Cpu size={16} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Context</span>
                    <span className="text-xs font-mono">{(model.contextWindow / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-accent rounded-full h-1.5 transition-all"
                      style={{ width: `${Math.min((model.contextWindow / maxContext) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              {model.inputCostPer1M !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <CurrencyDollar size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs">
                    ${model.inputCostPer1M.toFixed(2)} / ${model.outputCostPer1M?.toFixed(2) || '0.00'} per 1M
                  </span>
                </div>
              )}

              {/* Capabilities */}
              {model.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.slice(0, 3).map((cap) => (
                    <Badge key={cap.name} variant="outline" className="text-xs gap-1">
                      {CAPABILITY_ICONS[cap.name]}
                      {cap.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {model.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {model.tags.length > 3 && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    +{model.tags.length - 3}
                  </span>
                )}
              </div>

              <Button className="w-full" variant="outline" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <MagnifyingGlass size={48} className="mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No models found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        </Card>
      )}

      {/* Model Detail Dialog with Parameters */}
      <Dialog open={!!selectedModel} onOpenChange={(open) => !open && setSelectedModel(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl">{selectedModel.name}</DialogTitle>
                    <DialogDescription className="font-mono mt-1">{selectedModel.id}</DialogDescription>
                  </div>
                  <Badge className={PROVIDER_COLORS[selectedModel.provider]} variant="secondary">
                    {selectedModel.provider}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="gap-2">
                    <Info size={16} />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="parameters" className="gap-2">
                    <Sliders size={16} />
                    Parameters
                  </TabsTrigger>
                  <TabsTrigger value="test" className="gap-2">
                    <Play size={16} />
                    Test Model
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {selectedModel.description && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Description</h3>
                      <p className="text-sm">{selectedModel.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Specifications</h3>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Context Window</dt>
                            <dd className="font-mono font-medium">{selectedModel.contextWindow.toLocaleString()} tokens</dd>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Model Type</dt>
                            <dd className="font-medium capitalize">{selectedModel.modelType}</dd>
                          </div>
                          {selectedModel.maxTokens && (
                            <div className="flex justify-between py-2 border-b border-border">
                              <dt className="text-muted-foreground">Max Output</dt>
                              <dd className="font-mono font-medium">{selectedModel.maxTokens.toLocaleString()}</dd>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Streaming</dt>
                            <dd>
                              <Badge variant={selectedModel.supportsStreaming ? "default" : "secondary"} className="text-xs">
                                {selectedModel.supportsStreaming ? 'Supported' : 'Not Supported'}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Function Calling</dt>
                            <dd>
                              <Badge variant={selectedModel.supportsFunctionCalling ? "default" : "secondary"} className="text-xs">
                                {selectedModel.supportsFunctionCalling ? 'Supported' : 'Not Supported'}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Vision</dt>
                            <dd>
                              <Badge variant={selectedModel.supportsVision ? "default" : "secondary"} className="text-xs">
                                {selectedModel.supportsVision ? 'Supported' : 'Not Supported'}
                              </Badge>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedModel.inputCostPer1M !== undefined && (
                        <div>
                          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Pricing</h3>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-border">
                              <dt className="text-muted-foreground">Input (per 1M tokens)</dt>
                              <dd className="font-mono font-medium">${selectedModel.inputCostPer1M.toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <dt className="text-muted-foreground">Output (per 1M tokens)</dt>
                              <dd className="font-mono font-medium">${selectedModel.outputCostPer1M?.toFixed(2) || '0.00'}</dd>
                            </div>
                          </dl>
                        </div>
                      )}

                      {selectedModel.benchmarkScores && Object.keys(selectedModel.benchmarkScores).length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Benchmark Scores</h3>
                          <dl className="space-y-2 text-sm">
                            {Object.entries(selectedModel.benchmarkScores).map(([benchmark, score]) => (
                              <div key={benchmark} className="flex justify-between py-2 border-b border-border">
                                <dt className="text-muted-foreground capitalize">{benchmark}</dt>
                                <dd className="font-mono font-medium">{score.toFixed(1)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedModel.capabilities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Capabilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedModel.capabilities.map((cap) => (
                          <Badge key={cap.name} variant="outline" className="gap-2">
                            {CAPABILITY_ICONS[cap.name]}
                            {cap.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedModel.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedModel.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedModel.endpoint && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">API Endpoint</h3>
                      <code className="block bg-muted p-3 rounded text-xs font-mono break-all">
                        {selectedModel.endpoint}
                      </code>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="parameters" className="mt-6">
                  <ModelParameterConfig 
                    model={{
                      id: selectedModel.id,
                      name: selectedModel.name,
                      provider: selectedModel.provider as any,
                      contextWindow: selectedModel.contextWindow,
                      maxTokens: selectedModel.maxTokens,
                    } as any}
                    showPresetSave={true}
                  />
                </TabsContent>

                <TabsContent value="test" className="mt-6">
                  <Card className="border-dashed border-2 bg-muted/30">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Play size={32} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Test This Model</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Configure your API keys in the Config tab, then use the Live Test or Batch Test features to try this model.
                        </p>
                      </div>
                      <Button className="gap-2">
                        <Play size={18} />
                        Go to Live Tester
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
