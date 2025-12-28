# Document Chunking System

## Overview

The Document Chunking System provides automatic text splitting for RAG (Retrieval-Augmented Generation) pipelines with configurable chunk size, overlap, and multiple chunking strategies.

## Features

- **5 Chunking Strategies**:
  - Recursive: Smart splitting with separator hierarchy
  - Semantic: Preserve paragraphs and meaning
  - Markdown: Keep headers and structure
  - Sentence: Split by complete sentences
  - Fixed: Simple character-based chunking

- **Configurable Parameters**:
  - Chunk size (100-2000 characters)
  - Chunk overlap (0-500 characters)
  - Min/max chunk size constraints
  - Strategy-specific options

- **Metadata Tracking**:
  - Character positions (start/end)
  - Chunk index and total count
  - Processing statistics
  - Custom metadata support

## Quick Start

### Basic Usage

```typescript
import { DocumentChunker } from '@/lib/documentChunker';

// Create chunker with default settings
const chunker = new DocumentChunker({
  chunkSize: 500,
  chunkOverlap: 50,
  strategy: 'recursive'
});

// Chunk your document
const result = chunker.chunk(documentText);

console.log(`Created ${result.totalChunks} chunks`);
console.log(`Average chunk size: ${result.avgChunkSize} characters`);
console.log(`Processing time: ${result.processingTime}ms`);

// Access individual chunks
result.chunks.forEach((chunk, index) => {
  console.log(`Chunk ${index}:`, chunk.content);
  console.log(`Position: ${chunk.metadata.startChar}-${chunk.metadata.endChar}`);
});
```

### Using Different Strategies

```typescript
// Semantic chunking for preserving meaning
const semanticChunker = new DocumentChunker({
  chunkSize: 800,
  chunkOverlap: 100,
  strategy: 'semantic'
});

// Markdown-aware chunking for documentation
const markdownChunker = new DocumentChunker({
  chunkSize: 1000,
  chunkOverlap: 0,
  strategy: 'markdown'
});

// Sentence-based chunking for narratives
const sentenceChunker = new DocumentChunker({
  chunkSize: 500,
  chunkOverlap: 50,
  strategy: 'sentence'
});
```

## Chunking Strategies

### Recursive (Default)

Intelligently splits text using a hierarchy of separators:
1. Paragraphs (`\n\n`)
2. Lines (`\n`)
3. Sentences (`. `, `! `, `? `)
4. Clauses (`;`, `:`, `,`)
5. Words (` `)
6. Characters (``)

**Best for**: General-purpose text, mixed content

**Example**:
```typescript
const chunker = new DocumentChunker({ strategy: 'recursive', chunkSize: 500 });
```

### Semantic

Splits based on semantic boundaries like paragraphs and sections. Preserves meaning and context.

**Best for**: Documents where semantic coherence is critical

**Features**:
- Respects paragraph boundaries
- Splits long paragraphs by sentences
- Maintains context across chunks

**Example**:
```typescript
const chunker = new DocumentChunker({ strategy: 'semantic', chunkSize: 800 });
```

### Markdown

Preserves markdown headers and structure. Keeps headers with their content.

**Best for**: Technical documentation, structured content

**Features**:
- Detects markdown headers (# to ######)
- Keeps headers with their sections
- Preserves code blocks and formatting

**Example**:
```typescript
const chunker = new DocumentChunker({ strategy: 'markdown', chunkSize: 1000 });
```

### Sentence

Splits by complete sentences with configurable chunk size. Maintains sentence integrity.

**Best for**: Conversational or narrative text

**Features**:
- Detects sentence boundaries
- Never breaks mid-sentence
- Overlap calculated at sentence level

**Example**:
```typescript
const chunker = new DocumentChunker({ strategy: 'sentence', chunkSize: 500 });
```

### Fixed Size

Simple character-based chunking with fixed size and overlap.

**Best for**: When speed is more important than semantic preservation

**Features**:
- Fastest processing
- Predictable chunk sizes
- May break semantic units

**Example**:
```typescript
const chunker = new DocumentChunker({ strategy: 'fixed', chunkSize: 500 });
```

## Configuration Options

### ChunkConfig Interface

```typescript
interface ChunkConfig {
  // Required
  chunkSize: number;           // Target chunk size in characters
  chunkOverlap: number;        // Overlap between chunks in characters
  strategy: 'recursive' | 'semantic' | 'fixed' | 'markdown' | 'sentence';
  
  // Optional
  separator?: string;          // Custom separator (strategy-specific)
  keepSeparator?: boolean;     // Keep separators in output (default: true)
  minChunkSize?: number;       // Minimum chunk size (default: 100)
  maxChunkSize?: number;       // Maximum chunk size (default: 2000)
}
```

### Default Configuration

```typescript
{
  chunkSize: 500,
  chunkOverlap: 50,
  strategy: 'recursive',
  keepSeparator: true,
  minChunkSize: 100,
  maxChunkSize: 2000
}
```

## Advanced Usage

### Batch Chunking

Process multiple documents at once:

```typescript
const documents = [
  { text: "Document 1 content...", metadata: { source: "doc1.txt" } },
  { text: "Document 2 content...", metadata: { source: "doc2.txt" } }
];

const results = chunker.batchChunk(documents);

results.forEach((result, index) => {
  console.log(`Document ${index}: ${result.totalChunks} chunks`);
});
```

### Adding Custom Metadata

```typescript
const result = chunker.chunk(text, {
  source: 'documentation',
  author: 'John Doe',
  category: 'technical',
  timestamp: new Date().toISOString()
});

// Access metadata in chunks
result.chunks.forEach(chunk => {
  console.log('Source:', chunk.metadata.source);
  console.log('Author:', chunk.metadata.author);
});
```

### Getting Statistics

```typescript
const result = chunker.chunk(text);
const stats = chunker.getStats(result);

console.log('Total chunks:', stats.totalChunks);
console.log('Average size:', stats.avgChunkSize);
console.log('Min size:', stats.minChunkSize);
console.log('Max size:', stats.maxChunkSize);
console.log('Total characters:', stats.totalCharacters);
console.log('Processing time:', stats.processingTime + 'ms');
```

### Dynamic Configuration

Update configuration on-the-fly:

```typescript
const chunker = new DocumentChunker();

// Use one configuration
chunker.updateConfig({ chunkSize: 500, strategy: 'recursive' });
const result1 = chunker.chunk(text1);

// Switch to another
chunker.updateConfig({ chunkSize: 1000, strategy: 'semantic' });
const result2 = chunker.chunk(text2);

// View current config
const config = chunker.getConfig();
console.log('Current configuration:', config);
```

## Chunk Overlap

Overlap helps prevent information loss at chunk boundaries. It ensures that relevant information spanning multiple chunks isn't split awkwardly.

### Overlap Recommendations

| Use Case | Recommended Overlap |
|----------|-------------------|
| **General Purpose** | 10-20% of chunk size (50-100 chars for 500 char chunks) |
| **High Precision** | 20-30% (100-150 chars for 500 char chunks) |
| **Fast Processing** | 5-10% (25-50 chars for 500 char chunks) |
| **No Overlap** | 0 chars (only when chunks are truly independent) |

### Overlap Example

```typescript
// Document: "This is sentence one. This is sentence two. This is sentence three."

// With 50% overlap
const chunker = new DocumentChunker({ 
  chunkSize: 40, 
  chunkOverlap: 20,
  strategy: 'fixed'
});

// Results in:
// Chunk 1: "This is sentence one. This is senten"
// Chunk 2: "sentence two. This is sentence three."
//           ^^^^^^^^ (overlap from previous chunk)
```

## Integration with RAG Systems

### With Supabase Vector Store

```typescript
import { DocumentChunker } from '@/lib/documentChunker';

async function indexDocument(text: string, supabase: any, embeddingModel: string) {
  // 1. Chunk the document
  const chunker = new DocumentChunker({
    chunkSize: 500,
    chunkOverlap: 50,
    strategy: 'semantic'
  });
  
  const result = chunker.chunk(text);
  
  // 2. Generate embeddings for each chunk
  for (const chunk of result.chunks) {
    const embedding = await generateEmbedding(chunk.content, embeddingModel);
    
    // 3. Store in Supabase
    await supabase
      .from('document_chunks')
      .insert({
        content: chunk.content,
        embedding,
        metadata: chunk.metadata,
        chunk_index: chunk.index,
        total_chunks: chunk.totalChunks
      });
  }
  
  console.log(`Indexed ${result.totalChunks} chunks`);
}
```

### With Retrieval Pipeline

```typescript
async function queryDocuments(query: string, supabase: any) {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query, 'text-embedding-3-small');
  
  // 2. Search for similar chunks
  const { data } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
    match_threshold: 0.7
  });
  
  // 3. Return chunks with their metadata
  return data.map((result: any) => ({
    content: result.content,
    similarity: result.similarity,
    position: `${result.metadata.startChar}-${result.metadata.endChar}`,
    chunkIndex: result.metadata.chunkIndex
  }));
}
```

## Performance Optimization

### Chunk Size Guidelines

| Document Type | Recommended Size | Reason |
|---------------|-----------------|--------|
| **Short Answers** | 200-300 chars | Precise, focused responses |
| **General Text** | 500-800 chars | Balance of context and precision |
| **Long Context** | 1000-1500 chars | Rich context for complex queries |
| **Documentation** | 800-1200 chars | Keep sections together |

### Processing Speed

Typical processing times (1000 character document):

- Fixed: ~1-2ms
- Sentence: ~2-5ms
- Recursive: ~5-10ms
- Semantic: ~10-20ms
- Markdown: ~15-25ms

### Memory Usage

- Each chunk: ~200 bytes + content length
- 1000 chunks (500 chars each): ~500KB + metadata overhead
- Use batch processing for large document sets

## Best Practices

1. **Choose the Right Strategy**
   - Use `recursive` for mixed content
   - Use `semantic` for quality over speed
   - Use `markdown` for technical docs
   - Use `sentence` for narratives
   - Use `fixed` for speed-critical applications

2. **Optimize Chunk Size**
   - Start with 500 characters
   - Adjust based on use case
   - Test with real queries
   - Monitor retrieval quality

3. **Configure Overlap Wisely**
   - Use 10-20% for most cases
   - Increase for critical applications
   - Reduce for speed-sensitive systems
   - Disable only when chunks are independent

4. **Add Rich Metadata**
   - Include source information
   - Add timestamps
   - Tag by category
   - Enable filtering and attribution

5. **Monitor and Iterate**
   - Track retrieval quality
   - Measure response relevance
   - Adjust parameters based on metrics
   - A/B test different configurations

## API Reference

### DocumentChunker Class

#### Constructor
```typescript
constructor(config?: Partial<ChunkConfig>)
```

#### Methods

**chunk(text: string, metadata?: Record<string, any>): ChunkingResult**
- Chunks a document with the configured strategy
- Returns: ChunkingResult with chunks and statistics

**batchChunk(documents: Array<{text: string, metadata?: Record<string, any>}>): ChunkingResult[]**
- Batch chunks multiple documents
- Returns: Array of ChunkingResult

**getStats(result: ChunkingResult): Statistics**
- Get detailed statistics about chunking result
- Returns: Statistics object

**updateConfig(newConfig: Partial<ChunkConfig>): void**
- Update chunking configuration
- Merges with existing config

**getConfig(): ChunkConfig**
- Get current configuration
- Returns: Copy of current config

### Utility Functions

**createChunker(strategy?, chunkSize?, chunkOverlap?): DocumentChunker**
- Create a chunker with default settings
- Returns: Configured DocumentChunker instance

**chunkText(text, chunkSize?, chunkOverlap?, strategy?): DocumentChunk[]**
- Quick chunk text with default settings
- Returns: Array of DocumentChunk

## Examples

### Example 1: Process Documentation

```typescript
import { DocumentChunker } from '@/lib/documentChunker';

const docs = `
# API Reference

## Authentication
All API requests require authentication...

## Endpoints
### GET /users
Retrieve a list of users...
`;

const chunker = new DocumentChunker({
  strategy: 'markdown',
  chunkSize: 800,
  chunkOverlap: 0
});

const result = chunker.chunk(docs, {
  type: 'documentation',
  version: '1.0'
});

console.log(`Created ${result.totalChunks} documentation chunks`);
```

### Example 2: Process Conversational Text

```typescript
const conversation = `
User: How do I reset my password?
Agent: To reset your password, click "Forgot Password" on the login page.
User: I don't see that option.
Agent: It should be below the login button...
`;

const chunker = new DocumentChunker({
  strategy: 'sentence',
  chunkSize: 200,
  chunkOverlap: 30
});

const result = chunker.chunk(conversation, {
  type: 'conversation',
  date: '2025-01-15'
});
```

### Example 3: Bulk Processing

```typescript
const files = [
  { text: readFile('doc1.txt'), metadata: { source: 'doc1' } },
  { text: readFile('doc2.txt'), metadata: { source: 'doc2' } },
  { text: readFile('doc3.txt'), metadata: { source: 'doc3' } }
];

const chunker = new DocumentChunker({
  strategy: 'recursive',
  chunkSize: 500,
  chunkOverlap: 50
});

const results = chunker.batchChunk(files);

let totalChunks = 0;
results.forEach((result, index) => {
  console.log(`File ${index}: ${result.totalChunks} chunks`);
  totalChunks += result.totalChunks;
});

console.log(`Total chunks across all files: ${totalChunks}`);
```

## Troubleshooting

### Chunks Too Large

**Problem**: Chunks exceed embedding model limits

**Solution**:
```typescript
chunker.updateConfig({ 
  chunkSize: 300,  // Reduce size
  maxChunkSize: 400  // Set hard limit
});
```

### Missing Information at Boundaries

**Problem**: Important context split across chunks

**Solution**:
```typescript
chunker.updateConfig({ 
  chunkOverlap: 100  // Increase overlap
});
```

### Poor Semantic Coherence

**Problem**: Chunks break in the middle of ideas

**Solution**:
```typescript
chunker.updateConfig({ 
  strategy: 'semantic'  // Use semantic chunking
});
```

### Processing Too Slow

**Problem**: Chunking takes too long

**Solution**:
```typescript
chunker.updateConfig({ 
  strategy: 'fixed'  // Use faster strategy
});
```

## License

MIT
