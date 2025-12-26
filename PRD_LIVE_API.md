# Live API Mode - Product Requirements Document

## Executive Summary

Enhanced the AI Integration Platform with **Live API Mode** - a production-ready implementation connecting real Oxylabs web scraping, Supabase vector database, and LiteLLM gateway for end-to-end RAG (Retrieval-Augmented Generation) workflows.

---

## Mission Statement

Enable users to seamlessly transition from demo mode to production-grade AI workflows with real API integrations, providing a complete RAG pipeline that combines web scraping, vector embeddings, and intelligent question answering.

---

## Experience Qualities

1. **Transparent & Configurable** - Clear distinction between demo and live modes with intuitive API key management
2. **Production-Ready** - Real API integrations with proper error handling, retries, and status monitoring
3. **Educational** - Demonstrates complete RAG architecture with visual feedback at each pipeline stage

---

## Complexity Level

**Complex Application** (advanced functionality with multiple services)

This system orchestrates three distinct external services (Oxylabs, Supabase, LiteLLM) through a unified interface, handling async operations, error states, and real-time progress tracking across distributed systems.

---

## Essential Features

### 1. Live API Mode Toggle
- **Functionality**: Switch between simulated demo and real API calls
- **Purpose**: Allow safe exploration before committing to API costs
- **Trigger**: Toggle switch in RAG Demo interface
- **Progression**: Demo Mode → Configure API Keys → Enable Live Mode → Execute Pipeline → View Real Results
- **Success Criteria**: Seamless transition without data loss; clear visual indicators of current mode

### 2. Oxylabs Web Scraping Integration
- **Functionality**: Real-time web content extraction using Oxylabs Realtime API
- **Purpose**: Gather fresh, structured data from any URL for RAG context
- **Trigger**: User provides target URL and initiates pipeline
- **Progression**: URL Input → API Authentication → HTTP Request → Content Extraction → HTML Cleaning → Markdown Conversion
- **Success Criteria**: Successfully extract main content from 95%+ of URLs; handle JavaScript-rendered pages; proper error messages for blocked/inaccessible sites

### 3. Supabase Vector Storage
- **Functionality**: Store document chunks with embeddings in PostgreSQL + pgvector
- **Purpose**: Enable semantic search and context retrieval for RAG
- **Trigger**: After embedding generation completes
- **Progression**: Chunk Text → Generate Embeddings → Batch Insert → Index Creation → Similarity Search Ready
- **Success Criteria**: Sub-100ms vector similarity search; handle 1000+ document chunks; automatic HNSW indexing

### 4. LiteLLM Gateway Integration  
- **Functionality**: Unified interface to multiple LLM providers via Spark LLM API
- **Purpose**: Generate embeddings and completions without vendor lock-in
- **Trigger**: Embedding generation and final answer synthesis steps
- **Progression**: Format Request → Route to Provider → Stream Response → Parse Output → Display to User
- **Success Criteria**: Support 5+ LLM providers; automatic fallbacks on errors; cost tracking per request

### 5. API Key Management
- **Functionality**: Secure input and validation of service credentials
- **Purpose**: Enable authenticated API access without hardcoded keys
- **Trigger**: User enables Live API Mode
- **Progression**: Show Key Inputs → User Pastes Keys → Mask Sensitive Data → Validate on First Use → Cache for Session
- **Success Criteria**: Password-masked inputs; keys never logged; clear validation errors; optional persistence (future)

### 6. Real-Time Progress Tracking
- **Functionality**: Visual pipeline execution with step-by-step status updates
- **Purpose**: Provide transparency and debugging context during long-running operations
- **Trigger**: Pipeline execution starts
- **Progression**: Pending → Running (animated) → Complete (checkmark) → Error (with details)
- **Success Criteria**: Sub-second status updates; progress bar reflects actual completion %; toast notifications for major events

### 7. Error Handling & Recovery
- **Functionality**: Graceful degradation when API services fail
- **Purpose**: Prevent complete workflow failure from single service outage
- **Trigger**: Network errors, auth failures, rate limits, or service downtime
- **Progression**: Error Detection → User Notification → Partial Results Display → Retry Option → Fallback to Demo
- **Success Criteria**: Never crash UI; specific error messages (not generic "failed"); suggest corrective actions

---

## Edge Case Handling

- **Invalid API Keys**: Detect on first use; show specific provider error message; allow re-entry without page refresh
- **Rate Limiting**: Catch 429 responses; display retry-after timing; suggest batching or upgrading plan
- **Large Documents**: Chunk intelligently at sentence boundaries; limit initial scrape to 50KB; warn before processing
- **No Internet / CORS**: Detect offline state; explain browser security restrictions; provide backend proxy option
- **Slow Responses**: Show activity indicator after 3s; allow cancellation; timeout after 60s with partial results
- **Malformed URLs**: Validate before API call; suggest corrections; handle redirects automatically
- **Unsupported Content**: Detect PDFs, images, videos; extract text where possible; clear messaging when not

---

## Design Direction

The interface should feel like a **mission control dashboard** - technical, precise, but welcoming. Users are power users comfortable with APIs, so expose details (latency, chunk counts, similarity scores) without overwhelming.

**Visual Metaphor**: Think AWS Console meets Notion - data-dense but organized, with clear hierarchy and breathing room.

---

## Color Selection

Building on existing dark theme with enhanced status indicators:

- **Primary (Deep Blue)**: `oklch(0.55 0.15 240)` - Trust, technical depth, main actions
- **Accent (Electric Purple)**: `oklch(0.65 0.20 290)` - AI/ML operations, highlights, live mode indicator
- **Success (Emerald)**: `oklch(0.70 0.15 145)` - Completed steps, successful API calls
- **Warning (Amber)**: `oklch(0.75 0.18 70)` - API key required, approaching limits
- **Error (Crimson)**: `oklch(0.60 0.25 25)` - Failed requests, validation errors

**Foreground/Background Pairings**:
- Background: `oklch(0.12 0.02 240)` → Foreground: `oklch(0.95 0.01 240)` - Ratio 14.2:1 ✓
- Accent: `oklch(0.65 0.20 290)` → White: `oklch(1 0 0)` - Ratio 5.8:1 ✓
- Success: `oklch(0.70 0.15 145)` → Background: `oklch(0.12 0.02 240)` - Ratio 7.1:1 ✓

---

## Font Selection

Technical clarity with monospace for data:

- **Headings**: JetBrains Mono Bold - reinforces developer/API theme
- **Body**: Inter Regular/Medium - readable at small sizes for dense info
- **Code/Data**: JetBrains Mono Regular - API keys, JSON, URLs, logs

**Typographic Hierarchy**:
- H1 (Section Title): JetBrains Mono Bold / 28px / -0.02em letter-spacing
- H2 (Card Title): JetBrains Mono Bold / 20px / normal spacing  
- H3 (Step Name): Inter Semibold / 16px / normal spacing
- Body (Descriptions): Inter Regular / 14px / 1.5 line-height
- Small (Metadata): Inter Regular / 12px / text-muted-foreground

---

## Animations

Purposeful, performance-conscious motion:

1. **Pipeline Steps**: Fade-in with stagger (50ms delay each) when pipeline starts
2. **Running State**: Subtle pulse on icon (1.5s ease-in-out infinite)
3. **Complete Checkmark**: Scale from 0 to 1 with bounce (spring physics)
4. **Progress Bar**: Smooth fill with 300ms transition
5. **Mode Toggle**: Background color shift 200ms ease-out
6. **Error Shake**: Horizontal shake 400ms on validation failure

**No animation on**:
- Text content appearing (instant for readability)
- Large data blocks (performance)
- Scrolling behaviors (user-controlled)

---

## Component Selection

**Shadcn v4 Components**:
- `Card` - Pipeline steps, configuration panels, results display (with custom border states)
- `Badge` - Status indicators, mode labels (custom variants: success, running, error)
- `Button` - Primary actions, copy code (with loading states)
- `Input` - URL, query, API keys (with password masking)
- `Textarea` - Multi-line inputs
- `Switch` - Live mode toggle (with description text)
- `Select` - LLM provider selection
- `Progress` - Visual pipeline completion
- `Alert` - Mode explanations, warnings
- `Tabs` - Demo / Architecture / Code views

**Customizations**:
- **API Key Input**: Password type with reveal icon (Phosphor `Eye`/`EyeSlash`)
- **Status Card**: Custom left border color matching step state
- **Progress Bar**: Gradient fill from primary to accent
- **Live Mode Badge**: Pulsing dot indicator when active

**Icon Selection** (Phosphor):
- `Globe` (duotone) - Web scraping operations
- `Database` (duotone) - Supabase vector storage
- `Brain` (duotone) - LLM generation
- `Sparkle` (duotone) - Embeddings, AI operations
- `MagnifyingGlass` (duotone) - Vector search
- `CheckCircle` (fill) - Completed steps
- `Warning` (fill) - Configuration needed
- `Code` (duotone) - Implementation view

**Spacing**: Consistent 24px (`space-y-6`) between major sections; 12px (`gap-3`) within cards

**Mobile**: Single column layout; collapsible API key section; sticky Run button at bottom

---

## API Integration Patterns

### Oxylabs Client
```typescript
interface OxylabsConfig {
  apiKey: string;
}

class OxylabsClient {
  async scrapeUrl(url: string): Promise<ScrapeResult>
  - POST to realtime.oxylabs.io/v1/queries
  - Basic auth with API key
  - Extract and clean HTML to plain text
  - Return content + metadata (title, timestamp)
}
```

### Supabase Vector Client
```typescript
interface SupabaseConfig {
  url: string;
  key: string;
}

class SupabaseVectorClient {
  async storeEmbeddings(chunks, embeddings, metadata)
  - Batch insert to documents table
  - Include pgvector embedding column
  
  async searchSimilar(queryEmbedding, threshold, limit)
  - Call match_documents RPC function
  - Return top-k results with similarity scores
}
```

### LiteLLM Client
```typescript
class LiteLLMClient {
  async generateEmbedding(text): Promise<number[]>
  - Use Spark LLM API
  - Return 1536-dim vector
  
  async complete(messages): Promise<string>
  - Format as OpenAI-style messages
  - Stream response tokens
  - Return final completion
}
```

---

## Data Flow (Live Mode)

```
1. User Input
   ├─ URL: https://docs.litellm.ai
   ├─ Query: "How do I use LiteLLM?"
   └─ LLM Provider: openrouter/claude-3.5-sonnet

2. Oxylabs Scraping [~2-5s]
   ├─ HTTP Request to Oxylabs API
   ├─ Render JavaScript (if needed)
   ├─ Extract main content
   └─ Clean HTML → Markdown

3. Text Chunking [~100ms]
   ├─ Split on sentence boundaries
   ├─ 500 words per chunk
   ├─ 50 word overlap
   └─ Generate 5-20 chunks

4. Embedding Generation [~1-3s per chunk]
   ├─ Batch process chunks
   ├─ Call Spark LLM (uses configured provider)
   └─ Store 1536-dim vectors

5. Supabase Storage [~500ms]
   ├─ Batch insert chunks + embeddings
   ├─ Auto-create HNSW index (background)
   └─ Return success confirmation

6. Query Processing [~1s]
   ├─ Generate query embedding
   ├─ Cosine similarity search in Supabase
   └─ Retrieve top-3 chunks

7. Answer Generation [~3-8s]
   ├─ Format system + user prompts
   ├─ Include retrieved context
   ├─ Stream LLM response
   └─ Display with citations
```

**Total Time (Live Mode)**: 8-20 seconds depending on document size and LLM latency

---

## Success Metrics

1. **API Success Rate**: >98% of requests complete without user-facing errors
2. **Latency Budget**: P95 end-to-end pipeline execution <30 seconds
3. **Error Recovery**: 100% of errors provide actionable next steps
4. **Demo→Live Transition**: <2 minutes for user to configure and validate
5. **Code Quality**: All API clients have TypeScript types; error boundaries on async ops

---

## Future Enhancements (Out of Scope for v1)

- Persistent API key storage (encrypted browser localStorage)
- Batch URL processing (scrape multiple docs at once)
- Real-time streaming output (show LLM response as it generates)
- Cost estimation before running pipeline
- Export RAG results as JSON/CSV
- Custom embedding models (sentence-transformers, Cohere)
- Multi-modal support (images, PDFs)
- Webhook notifications on completion

---

## Technical Implementation Notes

**Security**:
- API keys stored only in component state (cleared on unmount)
- Never logged or sent to analytics
- Password-type inputs with autocomplete="off"
- Consider backend proxy for production (hide keys from browser)

**Performance**:
- Debounce URL input validation
- Lazy-load API clients (don't instantiate until Live Mode enabled)
- Cancel in-flight requests on unmount
- Batch embedding calls (5 at a time, not sequential)

**Error Boundaries**:
- Wrap entire RAGDemo in ErrorBoundary
- Catch network failures with specific retry logic
- Validate API responses before state updates

**Testing**:
- Mock API responses for E2E tests
- Validate error states (invalid keys, network failures)
- Ensure demo mode always works (no API deps)

---

## Acceptance Criteria

- [ ] User can toggle Live API Mode on/off
- [ ] API key inputs are password-masked and validated
- [ ] Oxylabs successfully scrapes 3 different URLs
- [ ] Supabase stores and retrieves embeddings correctly
- [ ] LLM generates coherent answers based on scraped content
- [ ] Progress bar and step indicators update in real-time
- [ ] Errors display specific, actionable messages
- [ ] Demo mode works identically without API keys
- [ ] Code implementation matches generated Python example
- [ ] All components are TypeScript-strict compliant

---

## Release Checklist

- [x] API client abstraction layer (`api-clients.ts`)
- [x] Live mode toggle UI
- [x] API key input components
- [x] Real Oxylabs integration
- [x] Real Supabase integration  
- [x] Real LiteLLM integration via Spark
- [x] Error handling for all API calls
- [x] Progress tracking with toast notifications
- [x] Generated Python code reflects live implementation
- [ ] Documentation: API key acquisition guide
- [ ] Documentation: Supabase schema setup SQL
- [ ] Documentation: Troubleshooting common errors

---

## Appendix: API Provider Details

### Oxylabs
- **Docs**: https://developers.oxylabs.io/scraper-apis/getting-started
- **Pricing**: Pay-per-request, starts at $0.10/request
- **Rate Limits**: 100 concurrent requests (varies by plan)
- **Key Format**: Username + password (Basic Auth)

### Supabase
- **Docs**: https://supabase.com/docs/guides/ai/vector-embeddings
- **Pricing**: Free tier includes pgvector; pay for storage/compute
- **Rate Limits**: 500 requests/second (scales with plan)
- **Key Format**: Project URL + anon/service key

### LiteLLM (via Spark)
- **Integration**: Built-in Spark LLM API
- **Supported Models**: GPT-4o, Claude 3.5, DeepSeek, etc.
- **Authentication**: Handled by Spark runtime
- **Key Format**: N/A (managed internally)

---

**Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Owner**: AI Integration Platform Team
