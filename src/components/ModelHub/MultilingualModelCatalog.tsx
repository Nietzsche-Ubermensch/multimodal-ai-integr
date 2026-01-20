import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  DollarSign, 
  Globe, 
  Database, 
  Download, 
  Languages,
  Brain,
  Code,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { UNIFIED_MODEL_CATALOG, type UnifiedModel, PROVIDER_COLORS, type ProviderType, type ModelType } from '@/data/unifiedModelCatalog';

type LanguageSupport = 'en' | 'de' | 'ja' | 'multilingual';

const LANGUAGE_FLAGS: Record<LanguageSupport, string> = {
  'en': '🇬🇧',
  'de': '🇩🇪',
  'ja': '🇯🇵',
  'multilingual': '🌍',
};

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  'reasoning': <Brain className="w-3 h-3" />,
  'code': <Code className="w-3 h-3" />,
  'vision': <Eye className="w-3 h-3" />,
  'chat': <MessageSquare className="w-3 h-3" />,
  'text': <MessageSquare className="w-3 h-3" />,
};

export function MultilingualModelCatalog() {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const models = UNIFIED_MODEL_CATALOG;

  const languageStats = useMemo(() => {
    return models.reduce((acc, m) => {
      const isMultilingual = m.tags?.includes('multilingual');
      if (m.tags?.includes('german') || isMultilingual) acc.german++;
      if (m.tags?.includes('japanese') || isMultilingual) acc.japanese++;
      if (isMultilingual) acc.multilingual++;
      return acc;
    }, { german: 0, japanese: 0, multilingual: 0 });
  }, [models]);

  const filtered = useMemo(() => {
    let result = models;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(lowerSearch) ||
        m.description?.toLowerCase().includes(lowerSearch) ||
        m.tags?.some(t => t.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedProvider !== 'all') {
      result = result.filter(m => m.provider === selectedProvider);
    }

    if (selectedLanguage !== 'all') {
      if (selectedLanguage === 'multilingual') {
        result = result.filter(m => m.tags?.includes('multilingual'));
      } else {
        result = result.filter(m => 
          m.tags?.includes(selectedLanguage) || 
          m.tags?.includes('multilingual')
        );
      }
    }

    if (selectedType !== 'all') {
      result = result.filter(m => m.modelType === selectedType);
    }

    return result;
  }, [models, search, selectedProvider, selectedLanguage, selectedType]);

  const maxContext = 2_000_000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Multilingual Model Catalog
            <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
              2025
            </Badge>
          </h1>
          <span className="text-sm text-muted-foreground">
            TFree-HAT 7B • Llama 3.1 70B • Qwen3 Series
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">🇩🇪 {languageStats.german} German</Badge>
          <Badge variant="outline">🇯🇵 {languageStats.japanese} Japanese</Badge>
          <Badge variant="outline">🌍 {languageStats.multilingual} Multilingual</Badge>
        </div>
      </div>

      {/* Featured Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Featured Multilingual Models</span>
          </div>
          <p className="text-sm text-muted-foreground">
            🇩🇪 TFree-HAT 7B (German-optimized, outperforms Llama 3.1 8B) • 
            🌍 Llama 3.1 70B (128K multilingual) • 
            🌍 Qwen3 14B/235B (119 languages)
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="xai">xAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="de">🇩🇪 German</SelectItem>
            <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
            <SelectItem value="multilingual">🌐 Multilingual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="chat">💬 Chat</SelectItem>
            <SelectItem value="code">💻 Code</SelectItem>
            <SelectItem value="reasoning">🧠 Reasoning</SelectItem>
            <SelectItem value="vision">👁️ Vision</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((model) => (
          <Card key={model.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
            <CardHeader className="pb-2">
              {model.tags?.includes('new') && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500 text-white">NEW</Badge>
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{model.name}</CardTitle>
                <Badge 
                  className="text-xs text-white" 
                  style={{ 
                    backgroundColor: PROVIDER_COLORS[model.provider] || '#666',
                  }}
                >
                  {model.provider}
                </Badge>
              </div>
              <div className="flex gap-1">
                {model.tags?.includes('german') && <span title="German">🇩🇪</span>}
                {model.tags?.includes('japanese') && <span title="Japanese">🇯🇵</span>}
                {model.tags?.includes('multilingual') && <span title="Multilingual">🌍</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Context Window */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Database className="w-3 h-3" />
                  <span>Context: {(model.contextWindow / 1000).toFixed(0)}K</span>
                </div>
                <Progress 
                  value={Math.min((model.contextWindow / maxContext) * 100, 100)} 
                  className="h-1.5"
                />
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                {model.inputCostPer1M === 0 && model.outputCostPer1M === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  <span className="text-muted-foreground">
                    ${model.inputCostPer1M?.toFixed(2)} / ${model.outputCostPer1M?.toFixed(2)} per 1M
                  </span>
                )}
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1">
                {model.capabilities.slice(0, 4).map((cap) => (
                  <Badge 
                    key={cap.name} 
                    variant="outline" 
                    className="text-xs gap-1"
                  >
                    {CAPABILITY_ICONS[cap.name]}
                    {cap.name}
                  </Badge>
                ))}
                {model.capabilities.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{model.capabilities.length - 4}</Badge>
                )}
              </div>

              {/* Benchmarks */}
              {model.benchmarkScores && (
                <div className="text-xs bg-secondary/50 p-2 rounded">
                  {Object.entries(model.benchmarkScores).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {model.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
              )}

              <Button className="w-full" variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Use Model
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No models found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
