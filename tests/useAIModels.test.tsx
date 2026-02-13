
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIModels } from '../src/hooks/useAIModels';
import { modelCatalog2025 } from '../src/components/AIModelHub/modelCatalog2025';
import { AIModel } from '../src/components/AIModelHub/types';

// Mock the model catalog
vi.mock('../src/components/AIModelHub/modelCatalog2025', () => ({
  modelCatalog2025: {
    getAllModels: vi.fn(),
  },
}));

const mockModels: AIModel[] = [
  {
    id: 'model-1',
    name: 'Alpha Model',
    provider: 'huggingface',
    providerDisplayName: 'Hugging Face',
    description: 'A great model',
    languageOptimization: 'english',
    supportedLanguages: ['en'],
    contextWindow: 4096,
    capabilities: [{ type: 'text', supported: true }],
    benchmarks: [],
    license: 'apache-2.0',
    deploymentOptions: [{ method: 'api', available: true }],
    freeTier: true,
    isNew: false,
    tags: ['text', 'generation'],
  },
  {
    id: 'model-2',
    name: 'Beta Model',
    provider: 'ollama',
    providerDisplayName: 'Ollama',
    description: 'Another model',
    languageOptimization: 'german',
    supportedLanguages: ['de'],
    contextWindow: 8192,
    capabilities: [{ type: 'code', supported: true }],
    benchmarks: [],
    license: 'mit',
    deploymentOptions: [{ method: 'ollama', available: true }],
    freeTier: false,
    isNew: true,
    tags: ['code', 'coding'],
  },
  {
    id: 'model-3',
    name: 'Gamma Model',
    provider: 'supabase-ai',
    providerDisplayName: 'Supabase AI',
    description: 'Multilingual model',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'fr'],
    contextWindow: 16384,
    capabilities: [{ type: 'text', supported: true }, { type: 'multilingual', supported: true }],
    benchmarks: [],
    license: 'apache-2.0',
    deploymentOptions: [{ method: 'supabase-ai', available: true }],
    freeTier: true,
    isNew: true,
    tags: ['multilingual'],
  }
];

describe('useAIModels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (modelCatalog2025.getAllModels as any).mockReturnValue(mockModels);
  });

  it('should return all models by default', () => {
    const { result } = renderHook(() => useAIModels());
    expect(result.current.filteredModels).toHaveLength(3);
  });

  it('should filter by search term', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ search: 'Alpha' });
    });

    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0].id).toBe('model-1');
  });

  it('should filter by provider', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ provider: 'ollama' });
    });

    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0].id).toBe('model-2');
  });

  it('should filter by language', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ language: 'german' });
    });

    // model-2 is german, model-3 is multilingual (which should match german if logic allows, checking logic...)
    // Current logic: m.languageOptimization === filter.language || (filter.language !== 'multilingual' && m.languageOptimization === 'multilingual')
    // So german filter matches 'german' AND 'multilingual'.

    expect(result.current.filteredModels).toHaveLength(2);
    const ids = result.current.filteredModels.map(m => m.id);
    expect(ids).toContain('model-2');
    expect(ids).toContain('model-3');
  });

  it('should filter by capability', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ capability: 'code' });
    });

    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0].id).toBe('model-2');
  });

  it('should filter by deployment', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ deployment: 'supabase-ai' });
    });

    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0].id).toBe('model-3');
  });

  it('should filter by free tier', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ showFreeOnly: true });
    });

    expect(result.current.filteredModels).toHaveLength(2); // model-1 and model-3
  });

  it('should filter by new only', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({ showNewOnly: true });
    });

    expect(result.current.filteredModels).toHaveLength(2); // model-2 and model-3
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useAIModels());

    act(() => {
      result.current.setFilter({
        showFreeOnly: true,
        language: 'english'
      });
    });

    // model-1: free, english -> YES
    // model-2: not free, german -> NO
    // model-3: free, multilingual (matches english) -> YES

    expect(result.current.filteredModels).toHaveLength(2);

    act(() => {
        result.current.setFilter({
            search: 'Alpha'
        });
    });

    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0].id).toBe('model-1');
  });
});
