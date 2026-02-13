import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { vi } from 'vitest';

// Mock child components to avoid deep rendering issues and focus on App structure
vi.mock('@/components/ModelHub/ModelHubApp', () => ({ ModelHubApp: () => <div data-testid="legacy-hub">Legacy Hub Content</div> }));
vi.mock('@/components/AIModelHub', () => ({ AIModelHub2025: () => <div data-testid="model-hub-2025">AI Model Hub 2025 Content</div> }));
vi.mock('@/components/PromptEngineering/PromptStudio', () => ({ default: () => <div data-testid="prompt-studio">Prompt Studio Content</div> }));
vi.mock('@/components/SupabaseVectorRAG', () => ({ SupabaseVectorRAG: () => <div data-testid="vector-rag">Vector RAG Content</div> }));
vi.mock('@/components/DocumentChunkingDemo', () => ({ DocumentChunkingDemo: () => <div data-testid="chunking-demo">Chunking Demo Content</div> }));
vi.mock('@/components/UnifiedScrapingLayer', () => ({ UnifiedScrapingLayer: () => <div data-testid="scraping-layer">Scraping Layer Content</div> }));
vi.mock('@/components/RAGTestingPanel', () => ({ RAGTestingPanel: () => <div data-testid="rag-testing">RAG Testing Content</div> }));
vi.mock('@/components/ModelHubDashboard', () => ({ ModelHubDashboard: () => <div data-testid="dashboard">Dashboard Content</div> }));
vi.mock('@/components/AISearchPanel', () => ({ AISearchPanel: () => <div data-testid="ai-search">AI Search Content</div> }));
vi.mock('@/components/LibreChatInterface', () => ({ LibreChatInterface: () => <div data-testid="chat-interface">Chat Interface Content</div> }));

describe('App Navigation', () => {
  test('renders all tabs and switches content correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Check default tab
    expect(await screen.findByTestId('model-hub-2025')).toBeInTheDocument();

    // Check Dashboard Tab
    const dashboardTab = screen.getByRole('tab', { name: /Dashboard/i });
    await user.click(dashboardTab);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();

    // Check Chat Tab
    const chatTab = screen.getByRole('tab', { name: /Chat/i });
    await user.click(chatTab);
    expect(await screen.findByTestId('chat-interface')).toBeInTheDocument();

    // Check AI Search Tab
    const searchTab = screen.getByRole('tab', { name: /AI Search/i });
    await user.click(searchTab);
    expect(await screen.findByTestId('ai-search')).toBeInTheDocument();

    // Check RAG Testing Tab
    const ragTab = screen.getByRole('tab', { name: /RAG Testing/i });
    await user.click(ragTab);
    expect(await screen.findByTestId('rag-testing')).toBeInTheDocument();

    // Check Scraping Tab
    const scrapingTab = screen.getByRole('tab', { name: /Scraping/i });
    await user.click(scrapingTab);
    expect(await screen.findByTestId('scraping-layer')).toBeInTheDocument();
  });
});
