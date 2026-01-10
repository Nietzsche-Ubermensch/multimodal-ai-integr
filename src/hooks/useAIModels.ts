// Custom hook for AI Model Hub state management
import { useState, useMemo, useCallback } from 'react';
import { AIModel, ModelFilter, LanguageOptimization, ProviderType, ModelCapabilityType, DeploymentMethod } from '@/components/AIModelHub/types';
import { modelCatalog2025 } from '@/components/AIModelHub/modelCatalog2025';

export interface UseAIModelsReturn {
  // State
  models: AIModel[];
  filteredModels: AIModel[];
  filter: ModelFilter;
  isLoading: boolean;
  selectedModel: AIModel | null;
  compareModels: AIModel[];
  
  // Stats
  stats: {
    total: number;
    filtered: number;
    new: number;
    german: number;
    japanese: number;
    multilingual: number;
    free: number;
    byProvider: Record<string, number>;
  };
  
  // Actions
  setFilter: (filter: Partial<ModelFilter>) => void;
  resetFilter: () => void;
  selectModel: (model: AIModel | null) => void;
  addToCompare: (model: AIModel) => void;
  removeFromCompare: (modelId: string) => void;
  clearCompare: () => void;
  getModelById: (id: string) => AIModel | undefined;
  getSimilarModels: (model: AIModel, limit?: number) => AIModel[];
}

const defaultFilter: ModelFilter = {
  search: '',
  provider: 'all',
  language: 'all',
  capability: 'all',
  license: 'all',
  deployment: 'all',
  showFreeOnly: false,
  showNewOnly: false,
};

export function useAIModels(): UseAIModelsReturn {
  const [filter, setFilterState] = useState<ModelFilter>(defaultFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [compareModels, setCompareModels] = useState<AIModel[]>([]);

  const models = useMemo(() => modelCatalog2025.getAllModels(), []);

  const filteredModels = useMemo(() => {
    let result = [...models];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.tags.some(t => t.toLowerCase().includes(searchLower)) ||
        m.provider.toLowerCase().includes(searchLower)
      );
    }

    // Provider filter
    if (filter.provider !== 'all') {
      result = result.filter(m => m.provider === filter.provider);
    }

    // Language filter
    if (filter.language !== 'all') {
      result = result.filter(m => 
        m.languageOptimization === filter.language ||
        (filter.language !== 'multilingual' && m.languageOptimization === 'multilingual')
      );
    }

    // Capability filter
    if (filter.capability !== 'all') {
      result = result.filter(m =>
        m.capabilities.some(c => c.type === filter.capability && c.supported)
      );
    }

    // Deployment filter
    if (filter.deployment !== 'all') {
      result = result.filter(m =>
        m.deploymentOptions.some(d => d.method === filter.deployment && d.available)
      );
    }

    // Free tier filter
    if (filter.showFreeOnly) {
      result = result.filter(m => m.freeTier);
    }

    // New models filter
    if (filter.showNewOnly) {
      result = result.filter(m => m.isNew);
    }

    return result;
  }, [models, filter]);

  const stats = useMemo(() => {
    const byProvider: Record<string, number> = {};
    models.forEach(m => {
      byProvider[m.provider] = (byProvider[m.provider] || 0) + 1;
    });

    return {
      total: models.length,
      filtered: filteredModels.length,
      new: models.filter(m => m.isNew).length,
      german: models.filter(m => m.languageOptimization === 'german').length,
      japanese: models.filter(m => m.languageOptimization === 'japanese').length,
      multilingual: models.filter(m => m.languageOptimization === 'multilingual').length,
      free: models.filter(m => m.freeTier).length,
      byProvider,
    };
  }, [models, filteredModels]);

  const setFilter = useCallback((partial: Partial<ModelFilter>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(defaultFilter);
  }, []);

  const selectModel = useCallback((model: AIModel | null) => {
    setSelectedModel(model);
  }, []);

  const addToCompare = useCallback((model: AIModel) => {
    setCompareModels(prev => {
      if (prev.length >= 3) return prev; // Max 3 models
      if (prev.some(m => m.id === model.id)) return prev;
      return [...prev, model];
    });
  }, []);

  const removeFromCompare = useCallback((modelId: string) => {
    setCompareModels(prev => prev.filter(m => m.id !== modelId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareModels([]);
  }, []);

  const getModelById = useCallback((id: string) => {
    return models.find(m => m.id === id);
  }, [models]);

  const getSimilarModels = useCallback((model: AIModel, limit = 3) => {
    return models
      .filter(m => m.id !== model.id)
      .map(m => {
        let score = 0;
        // Same provider
        if (m.provider === model.provider) score += 2;
        // Same language optimization
        if (m.languageOptimization === model.languageOptimization) score += 3;
        // Similar context window
        const contextDiff = Math.abs(m.contextWindow - model.contextWindow) / model.contextWindow;
        if (contextDiff < 0.3) score += 2;
        // Shared capabilities
        const sharedCaps = m.capabilities.filter(mc =>
          model.capabilities.some(c => c.type === mc.type && mc.supported && c.supported)
        );
        score += sharedCaps.length;
        return { model: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.model);
  }, [models]);

  return {
    models,
    filteredModels,
    filter,
    isLoading,
    selectedModel,
    compareModels,
    stats,
    setFilter,
    resetFilter,
    selectModel,
    addToCompare,
    removeFromCompare,
    clearCompare,
    getModelById,
    getSimilarModels,
  };
}
