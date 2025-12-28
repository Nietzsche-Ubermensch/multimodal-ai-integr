import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { catalogInstance, PROVIDER_COLORS, UnifiedModel, ProviderType, ModelType } from '@/data/unifiedModelCatalog';
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
  Funnel
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

      {/* Model Detail Modal */}
      {selectedModel && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModel(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedModel.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono mt-1">{selectedModel.id}</p>
                </div>
                <Badge className={PROVIDER_COLORS[selectedModel.provider]}>
                  {selectedModel.provider}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedModel.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Context Window:</dt>
                      <dd className="font-mono">{selectedModel.contextWindow.toLocaleString()} tokens</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Model Type:</dt>
                      <dd className="capitalize">{selectedModel.modelType}</dd>
                    </div>
                    {selectedModel.maxTokens && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Max Output:</dt>
                        <dd className="font-mono">{selectedModel.maxTokens.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {selectedModel.inputCostPer1M !== undefined && (
                  <div>
                    <h3 className="font-semibold mb-2">Pricing (per 1M tokens)</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Input:</dt>
                        <dd className="font-mono">${selectedModel.inputCostPer1M.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Output:</dt>
                        <dd className="font-mono">${selectedModel.outputCostPer1M?.toFixed(2) || '0.00'}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.capabilities.map((cap) => (
                    <Badge key={cap.name} variant={cap.supported ? 'default' : 'outline'}>
                      {cap.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {selectedModel.supportsStreaming ? '✅' : '❌'}
                    <span>Streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedModel.supportsFunctionCalling ? '✅' : '❌'}
                    <span>Function Calling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedModel.supportsVision ? '✅' : '❌'}
                    <span>Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedModel.requiresApiKey ? '🔑' : '🆓'}
                    <span>API Key Required</span>
                  </div>
                </div>
              </div>

              {selectedModel.benchmarkScores && (
                <div>
                  <h3 className="font-semibold mb-2">Benchmark Scores</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedModel.benchmarkScores).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground capitalize w-24">{key}:</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-accent rounded-full h-2"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono w-12 text-right">{value.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Test This Model</Button>
                <Button variant="outline" onClick={() => setSelectedModel(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
