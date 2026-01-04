// Model Catalog with Filters - Language, Provider, Capability

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  MagnifyingGlass,
  Funnel,
  X,
  Database,
  Globe,
  ChartBar,
  Lightning,
  Sparkle,
  Brain,
} from '@phosphor-icons/react';
import { ModelCard } from './ModelCard';
import { 
  AIModel, 
  ModelFilter, 
  LANGUAGE_FLAGS,
  PROVIDER_COLORS,
  ProviderType,
  LanguageOptimization,
  ModelCapabilityType,
  DeploymentMethod,
} from './types';
import { modelCatalog2025 } from './modelCatalog2025';

interface ModelCatalogProps {
  onSelectModel: (model: AIModel) => void;
  onChatWithModel: (model: AIModel) => void;
}

const PROVIDERS: { value: ProviderType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Providers' },
  { value: 'huggingface', label: '🤗 Hugging Face' },
  { value: 'ollama', label: '🦙 Ollama (Local)' },
  { value: 'supabase-ai', label: '⚡ Supabase AI' },
  { value: 'openrouter', label: '🔀 OpenRouter' },
  { value: 'together-ai', label: '🤝 Together AI' },
  { value: 'aleph-alpha', label: '🇩🇪 Aleph Alpha' },
  { value: 'meta', label: '📘 Meta AI' },
  { value: 'alibaba', label: '☁️ Alibaba Cloud' },
];

const LANGUAGES: { value: LanguageOptimization | 'all'; label: string; flag: string }[] = [
  { value: 'all', label: 'All Languages', flag: '🌐' },
  { value: 'english', label: 'English', flag: '🇬🇧' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
  { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'multilingual', label: 'Multilingual', flag: '🌍' },
];

const CAPABILITIES: { value: ModelCapabilityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Capabilities' },
  { value: 'text', label: 'Text Generation' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'code', label: 'Code' },
  { value: 'multilingual', label: 'Multilingual' },
  { value: 'vision', label: 'Vision' },
  { value: 'embedding', label: 'Embeddings' },
];

const DEPLOYMENTS: { value: DeploymentMethod | 'all'; label: string }[] = [
  { value: 'all', label: 'All Deployments' },
  { value: 'api', label: 'API' },
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'supabase-ai', label: 'Supabase AI' },
  { value: 'download', label: 'Download' },
];

export function ModelCatalog({ onSelectModel, onChatWithModel }: ModelCatalogProps) {
  const [filters, setFilters] = useState<ModelFilter>({
    search: '',
    provider: 'all',
    language: 'all',
    capability: 'all',
    license: 'all',
    deployment: 'all',
    showFreeOnly: false,
    showNewOnly: false,
  });

  const allModels = modelCatalog2025.getAllModels();

  const filteredModels = useMemo(() => {
    let result = allModels;

    // Search filter
    if (filters.search) {
      result = modelCatalog2025.searchModels(filters.search);
    }

    // Provider filter
    if (filters.provider !== 'all') {
      result = result.filter(m => m.provider === filters.provider);
    }

    // Language filter
    if (filters.language !== 'all') {
      result = result.filter(m => m.languageOptimization === filters.language);
    }

    // Capability filter
    if (filters.capability !== 'all') {
      result = result.filter(m => 
        m.capabilities.some(c => c.type === filters.capability && c.supported)
      );
    }

    // Deployment filter
    if (filters.deployment !== 'all') {
      result = result.filter(m =>
        m.deploymentOptions.some(d => d.method === filters.deployment && d.available)
      );
    }

    // Free tier filter
    if (filters.showFreeOnly) {
      result = result.filter(m => m.freeTier);
    }

    // New models filter
    if (filters.showNewOnly) {
      result = result.filter(m => m.isNew);
    }

    return result;
  }, [filters, allModels]);

  const providerStats = modelCatalog2025.getProviderStats();
  const languageStats = modelCatalog2025.getLanguageStats();
  const featuredModels = modelCatalog2025.getFeaturedModels();
  const newModels = modelCatalog2025.getNewModels();

  const clearFilters = () => {
    setFilters({
      search: '',
      provider: 'all',
      language: 'all',
      capability: 'all',
      license: 'all',
      deployment: 'all',
      showFreeOnly: false,
      showNewOnly: false,
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.provider !== 'all' ||
    filters.language !== 'all' ||
    filters.capability !== 'all' ||
    filters.deployment !== 'all' ||
    filters.showFreeOnly ||
    filters.showNewOnly;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Database size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">Total Models</span>
            </div>
            <p className="text-2xl font-bold">{allModels.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkle size={18} className="text-green-500" />
              <span className="text-xs text-muted-foreground">New 2025</span>
            </div>
            <p className="text-2xl font-bold">{newModels.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🇩🇪</span>
              <span className="text-xs text-muted-foreground">German</span>
            </div>
            <p className="text-2xl font-bold">{languageStats['german'] || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🇯🇵</span>
              <span className="text-xs text-muted-foreground">Japanese</span>
            </div>
            <p className="text-2xl font-bold">{languageStats['japanese'] || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={18} className="text-blue-500" />
              <span className="text-xs text-muted-foreground">Multilingual</span>
            </div>
            <p className="text-2xl font-bold">{languageStats['multilingual'] || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Models Banner */}
      {featuredModels.length > 0 && !hasActiveFilters && (
        <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightning size={20} weight="fill" className="text-purple-500" />
              <h3 className="font-semibold">Featured 2025 Models</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredModels.map(model => (
                <Badge
                  key={model.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors gap-1.5 px-3 py-1.5"
                  onClick={() => onSelectModel(model)}
                >
                  <span>{model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}</span>
                  {model.name}
                  {model.isNew && <Sparkle size={12} weight="fill" className="text-green-500" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search models by name, description, or tags..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap gap-3">
            {/* Provider Filter */}
            <Select
              value={filters.provider}
              onValueChange={(value) => setFilters({ ...filters, provider: value as ProviderType | 'all' })}
            >
              <SelectTrigger className="w-[180px]">
                <Funnel size={14} className="mr-2" />
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                    {p.value !== 'all' && providerStats[p.value] && (
                      <span className="ml-2 text-muted-foreground">({providerStats[p.value]})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select
              value={filters.language}
              onValueChange={(value) => setFilters({ ...filters, language: value as LanguageOptimization | 'all' })}
            >
              <SelectTrigger className="w-[180px]">
                <Globe size={14} className="mr-2" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.value} value={l.value}>
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Capability Filter */}
            <Select
              value={filters.capability}
              onValueChange={(value) => setFilters({ ...filters, capability: value as ModelCapabilityType | 'all' })}
            >
              <SelectTrigger className="w-[180px]">
                <Brain size={14} className="mr-2" />
                <SelectValue placeholder="Capability" />
              </SelectTrigger>
              <SelectContent>
                {CAPABILITIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Deployment Filter */}
            <Select
              value={filters.deployment}
              onValueChange={(value) => setFilters({ ...filters, deployment: value as DeploymentMethod | 'all' })}
            >
              <SelectTrigger className="w-[180px]">
                <Lightning size={14} className="mr-2" />
                <SelectValue placeholder="Deployment" />
              </SelectTrigger>
              <SelectContent>
                {DEPLOYMENTS.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Toggle Filters */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <Switch
                  id="free-only"
                  checked={filters.showFreeOnly}
                  onCheckedChange={(checked) => setFilters({ ...filters, showFreeOnly: checked })}
                />
                <Label htmlFor="free-only" className="text-sm cursor-pointer">Free Only</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="new-only"
                  checked={filters.showNewOnly}
                  onCheckedChange={(checked) => setFilters({ ...filters, showNewOnly: checked })}
                />
                <Label htmlFor="new-only" className="text-sm cursor-pointer">New Only</Label>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredModels.length}</span> of{' '}
          <span className="font-medium text-foreground">{allModels.length}</span> models
        </p>
        
        {/* Quick Language Filters */}
        <div className="flex gap-2">
          {LANGUAGES.filter(l => l.value !== 'all').map(lang => (
            <Button
              key={lang.value}
              variant={filters.language === lang.value ? 'default' : 'outline'}
              size="sm"
              className="gap-1"
              onClick={() => setFilters({ 
                ...filters, 
                language: filters.language === lang.value ? 'all' : lang.value 
              })}
            >
              <span>{lang.flag}</span>
              {lang.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Model Grid */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map(model => (
            <ModelCard
              key={model.id}
              model={model}
              onSelectModel={onSelectModel}
              onChatWithModel={onChatWithModel}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Database size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No models found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </Card>
      )}
    </div>
  );
}
