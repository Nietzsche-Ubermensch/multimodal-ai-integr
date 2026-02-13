
import { describe, it, expect } from 'vitest';
import { AIModel, ModelFilter, ProviderType, LanguageOptimization, ModelCapabilityType, DeploymentMethod, LicenseType } from '../src/components/AIModelHub/types';

// Mock data generation
const generateModels = (count: number): AIModel[] => {
  const models: AIModel[] = [];
  const providers: ProviderType[] = ['huggingface', 'ollama', 'supabase-ai', 'openrouter', 'together-ai', 'aleph-alpha', 'meta', 'alibaba', 'rakuten'];
  const languages: LanguageOptimization[] = ['english', 'german', 'japanese', 'multilingual'];

  for (let i = 0; i < count; i++) {
    models.push({
      id: `model-${i}`,
      name: `Model ${i}`,
      provider: providers[i % providers.length],
      providerDisplayName: `Provider ${i % providers.length}`,
      description: `Description for model ${i}. This is a very good model.`,
      languageOptimization: languages[i % languages.length],
      supportedLanguages: ['en'],
      contextWindow: 1024 * (i % 10 + 1),
      capabilities: [
        { type: 'text', supported: true },
        { type: 'code', supported: i % 2 === 0 },
        { type: 'reasoning', supported: i % 3 === 0 },
      ],
      benchmarks: [],
      license: 'apache-2.0',
      deploymentOptions: [
          { method: 'api', available: true },
          { method: 'ollama', available: i % 4 === 0 }
      ],
      freeTier: i % 5 === 0,
      isNew: i % 10 === 0,
      tags: ['tag1', 'tag2'],
    });
  }
  return models;
};

// Original implementation logic
const filterChain = (models: AIModel[], filter: ModelFilter) => {
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
};

// Optimized implementation logic
const filterSinglePass = (models: AIModel[], filter: ModelFilter) => {
    // Pre-calculate search term
    const searchLower = filter.search ? filter.search.toLowerCase() : '';

    return models.filter(m => {
        // Search filter
        if (filter.search) {
            const matchesSearch =
                m.name.toLowerCase().includes(searchLower) ||
                m.description.toLowerCase().includes(searchLower) ||
                m.tags.some(t => t.toLowerCase().includes(searchLower)) ||
                m.provider.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;
        }

        // Provider filter
        if (filter.provider !== 'all' && m.provider !== filter.provider) {
            return false;
        }

        // Language filter
        if (filter.language !== 'all') {
             const matchesLang = m.languageOptimization === filter.language ||
                (filter.language !== 'multilingual' && m.languageOptimization === 'multilingual');
             if (!matchesLang) return false;
        }

        // Capability filter
        if (filter.capability !== 'all') {
            const matchesCap = m.capabilities.some(c => c.type === filter.capability && c.supported);
            if (!matchesCap) return false;
        }

        // Deployment filter
        if (filter.deployment !== 'all') {
            const matchesDep = m.deploymentOptions.some(d => d.method === filter.deployment && d.available);
            if (!matchesDep) return false;
        }

        // Free tier filter
        if (filter.showFreeOnly && !m.freeTier) {
            return false;
        }

        // New models filter
        if (filter.showNewOnly && !m.isNew) {
            return false;
        }

        return true;
    });
};

describe('Filter Performance Benchmark', () => {
    const models = generateModels(100000); // 100k items to really stress it

    // Test case 1: Complex filter
    const complexFilter: ModelFilter = {
        search: 'Model 1',
        provider: 'all',
        language: 'german',
        capability: 'code',
        license: 'all',
        deployment: 'all',
        showFreeOnly: false,
        showNewOnly: false
    };

    it('benchmarks complex filter', () => {
        const startChain = performance.now();
        const resChain = filterChain(models, complexFilter);
        const endChain = performance.now();
        const timeChain = endChain - startChain;

        const startSingle = performance.now();
        const resSingle = filterSinglePass(models, complexFilter);
        const endSingle = performance.now();
        const timeSingle = endSingle - startSingle;

        console.log(`\nComplex Filter (100k items):`);
        console.log(`Chain: ${timeChain.toFixed(2)}ms`);
        console.log(`Single: ${timeSingle.toFixed(2)}ms`);
        console.log(`Improvement: ${(timeChain / timeSingle).toFixed(2)}x`);

        expect(resChain.length).toBe(resSingle.length);
    });

    // Test case 2: Search only
    const searchFilter: ModelFilter = {
        search: 'Description',
        provider: 'all',
        language: 'all',
        capability: 'all',
        license: 'all',
        deployment: 'all',
        showFreeOnly: false,
        showNewOnly: false
    };

    it('benchmarks search only', () => {
        const startChain = performance.now();
        const resChain = filterChain(models, searchFilter);
        const endChain = performance.now();
        const timeChain = endChain - startChain;

        const startSingle = performance.now();
        const resSingle = filterSinglePass(models, searchFilter);
        const endSingle = performance.now();
        const timeSingle = endSingle - startSingle;

        console.log(`\nSearch Only (100k items):`);
        console.log(`Chain: ${timeChain.toFixed(2)}ms`);
        console.log(`Single: ${timeSingle.toFixed(2)}ms`);
        console.log(`Improvement: ${(timeChain / timeSingle).toFixed(2)}x`);

        expect(resChain.length).toBe(resSingle.length);
    });

     // Test case 3: Multiple property filters (no search)
    const propFilter: ModelFilter = {
        search: '',
        provider: 'ollama',
        language: 'english',
        capability: 'all',
        license: 'all',
        deployment: 'all',
        showFreeOnly: true,
        showNewOnly: true
    };

    it('benchmarks property filters', () => {
        const startChain = performance.now();
        const resChain = filterChain(models, propFilter);
        const endChain = performance.now();
        const timeChain = endChain - startChain;

        const startSingle = performance.now();
        const resSingle = filterSinglePass(models, propFilter);
        const endSingle = performance.now();
        const timeSingle = endSingle - startSingle;

        console.log(`\nProperty Filters (100k items):`);
        console.log(`Chain: ${timeChain.toFixed(2)}ms`);
        console.log(`Single: ${timeSingle.toFixed(2)}ms`);
        console.log(`Improvement: ${(timeChain / timeSingle).toFixed(2)}x`);

        expect(resChain.length).toBe(resSingle.length);
    });
});
