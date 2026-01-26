import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModelHubApp } from '../src/components/ModelHub/ModelHubApp';
import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react';

// Mock child components
vi.mock('@/components/ModelHub/APIKeyManager', () => ({ APIKeyManager: () => <div>APIKeyManager</div> }));
vi.mock('@/components/ModelHub/ModelExplorer', () => ({ ModelExplorer: () => <div>ModelExplorer</div> }));
vi.mock('@/components/ModelHub/EnhancedPromptTester', () => ({ EnhancedPromptTester: () => <div>EnhancedPromptTester</div> }));
vi.mock('@/components/ModelHub/ResponseComparison', () => ({ ResponseComparison: () => <div>ResponseComparison</div> }));
vi.mock('@/components/ModelHub/SavedPrompts', () => ({ SavedPrompts: () => <div>SavedPrompts</div> }));
vi.mock('@/components/ModelHub/LiveModelTester', () => ({ LiveModelTester: () => <div>LiveModelTester</div> }));
vi.mock('@/components/ModelHub/UnifiedModelCatalog', () => ({ UnifiedModelCatalog: () => <div>UnifiedModelCatalog</div> }));
vi.mock('@/components/ModelHub/BatchModelTester', () => ({ BatchModelTester: () => <div>BatchModelTester</div> }));
vi.mock('@/components/ModelHub/ConfigurationExporter', () => ({ ConfigurationExporter: () => <div>ConfigurationExporter</div> }));
vi.mock('@/components/XAIExplainerDemo', () => ({ XAIExplainerDemo: () => <div>XAIExplainerDemo</div> }));

// Mock the target component specifically to check for its presence
vi.mock('@/components/ModelHub/RAGPipelineDemo', () => ({
  RAGPipelineDemo: () => <div data-testid="rag-demo">RAG Pipeline Demo</div>
}));

// Mock ResizeObserver which is often used in UI libraries
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});

describe('ModelHubApp Performance', () => {
  it('renders RAGPipelineDemo only when active', async () => {
    const user = userEvent.setup();
    render(<ModelHubApp />);

    // Optimization check: RAGPipelineDemo should NOT be rendered initially
    expect(screen.queryByTestId('rag-demo')).not.toBeInTheDocument();

    // Click RAG tab
    const ragTab = screen.getByRole('tab', { name: /RAG/i });
    await user.click(ragTab);

    // Verification: Now it should be present
    expect(await screen.findByTestId('rag-demo')).toBeInTheDocument();
  });
});
