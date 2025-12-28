# Supabase pgvector RAG Integration Guide

## 🚀 Overview

The Supabase Vector RAG integration provides **real-time document storage and semantic search** using PostgreSQL's pgvector extension. This enables you to build production-ready Retrieval-Augmented Generation (RAG) systems with:

- **Live Embedding Generation**: Generate embeddings on-the-fly using OpenAI or HuggingFace models
- **Vector Similarity Search**: Find relevant documents using cosine similarity
- **Real-time Indexing**: Instant document storage with sub-second search
- **Scalable Storage**: PostgreSQL with pgvector handles millions of vectors efficiently
- **Cost-Effective**: Choose from free (HuggingFace) or low-cost (OpenAI) embedding models

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE VECTOR RAG SYSTEM                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   Frontend   │───▶│  Embedding   │───▶│  Supabase   │  │
│   │   (React)    │    │   Provider   │    │  pgvector   │  │
│   │              │    │              │    │             │  │
│   │ • Upload doc │    │ • OpenAI     │    │ • Store     │  │
│   │ • Search     │    │ • HuggingFace│    │ • Index     │  │
│   └──────────────┘    └──────────────┘    └─────────────┘  │
│                              │                    │         │
│                              ▼                    ▼         │
│                       ┌─────────────┐    ┌─────────────┐   │
│                       │  Generate   │    │   Vector    │   │
│                       │  Embedding  │    │   Search    │   │
│                       │  (1536-3072d)│   │  (Cosine)   │   │
│                       └─────────────┘    └─────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Setup Instructions

### 1. Enable pgvector Extension

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Create Vector Table

Choose your embedding dimensions based on the model:

```sql
-- For OpenAI text-embedding-3-small (1536 dimensions)
CREATE TABLE rag_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  embedding_model VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For OpenAI text-embedding-3-large (3072 dimensions)
-- Change VECTOR(1536) to VECTOR(3072)

-- For HuggingFace BGE-large (1024 dimensions)
-- Change VECTOR(1536) to VECTOR(1024)
```

### 3. Create Vector Index

**IMPORTANT**: Choose the right index type based on your data size:

```sql
-- For <100K vectors: Use IVFFlat (faster queries)
CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For >100K vectors: Use HNSW (better scalability)
CREATE INDEX ON rag_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Index Comparison**:

| Index Type | Best For | Query Speed | Memory | Build Time |
|------------|----------|-------------|--------|------------|
| IVFFlat    | <100K vectors | Fast | Low | Fast |
| HNSW       | >100K vectors | Very Fast | High | Slower |

### 4. Create Search Function

```sql
CREATE OR REPLACE FUNCTION vector_search(
  query_embedding VECTOR(1536),  -- Match your dimension
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity,
    created_at
  FROM rag_vectors
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### 5. Enable Row Level Security (Optional)

```sql
-- Enable RLS
ALTER TABLE rag_vectors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access" ON rag_vectors
  FOR SELECT USING (true);

-- Public insert access
CREATE POLICY "Allow public insert access" ON rag_vectors
  FOR INSERT WITH CHECK (true);

-- User-specific access (if using Supabase Auth)
CREATE POLICY "Users can read own vectors" ON rag_vectors
  FOR SELECT USING (auth.uid() = (metadata->>'user_id')::uuid);
```

---

## 🔑 API Keys Required

### Required Keys

1. **Supabase URL**: `https://your-project.supabase.co`
2. **Supabase Service Role Key**: From Supabase Dashboard → Settings → API

### Embedding Provider Keys (choose one)

**Option 1: OpenAI (Recommended)**
- **API Key**: Get from https://platform.openai.com/api-keys
- **Models**:
  - `text-embedding-3-small` (1536d) - $0.02/1M tokens
  - `text-embedding-3-large` (3072d) - $0.13/1M tokens

**Option 2: HuggingFace (Free)**
- **Token**: Get from https://huggingface.co/settings/tokens
- **Models**:
  - `BAAI/bge-large-en-v1.5` (1024d) - Free via Inference API

---

## 📝 Usage Examples

### Store a Document

```typescript
// 1. Generate embedding
const embedding = await generateEmbedding(
  "Your document text here",
  "text-embedding-3-small"
);

// 2. Store in Supabase
const { data, error } = await supabase
  .from('rag_vectors')
  .insert({
    content: "Your document text here",
    embedding,
    embedding_model: "text-embedding-3-small",
    metadata: {
      source: "manual_upload",
      timestamp: new Date().toISOString()
    }
  });
```

### Semantic Search

```typescript
// 1. Generate query embedding
const queryEmbedding = await generateEmbedding(
  "What is RAG?",
  "text-embedding-3-small"
);

// 2. Search vectors
const { data, error } = await supabase
  .rpc('vector_search', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5
  });

// Results sorted by similarity (highest first)
data.forEach((result) => {
  console.log(`${(result.similarity * 100).toFixed(1)}% - ${result.content}`);
});
```

---

## 🎯 Embedding Model Selection

| Model | Dimensions | Cost/1M | Provider | Best For |
|-------|-----------|---------|----------|----------|
| text-embedding-3-large | 3072 | $0.13 | OpenAI | High precision, long documents |
| text-embedding-3-small | 1536 | $0.02 | OpenAI | **Recommended** - Best balance |
| bge-large-en-v1.5 | 1024 | Free | HuggingFace | Budget-friendly, English only |

**Recommendations**:
- **Production**: `text-embedding-3-small` (best cost/quality ratio)
- **Research**: `text-embedding-3-large` (highest quality)
- **Development**: `bge-large-en-v1.5` (free tier)

---

## 🔍 Search Parameters

### `match_threshold` (Similarity Score)

Controls how strict the matching is:

| Threshold | Description | Use Case |
|-----------|-------------|----------|
| 0.5 | Relaxed | Broad exploration, high recall |
| **0.7** | **Balanced** | **Recommended default** |
| 0.8 | Strict | High precision, low recall |
| 0.9 | Very strict | Only near-exact matches |

### `match_count` (Top K)

Number of results to return:

| Count | Use Case |
|-------|----------|
| 3-5 | Quick answers, focused context |
| 10-20 | Comprehensive research |
| 50+ | Data analysis, clustering |

---

## 📊 Performance Optimization

### Index Tuning

**IVFFlat** (lists parameter):
```sql
-- Small dataset (<10K vectors): lists = 10
-- Medium dataset (10K-100K): lists = 100
-- Large dataset (>100K): lists = sqrt(total_vectors)

CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**HNSW** (m and ef_construction):
```sql
-- Faster queries, more memory: m = 32, ef_construction = 128
-- Balanced: m = 16, ef_construction = 64
-- Lower memory: m = 8, ef_construction = 32

CREATE INDEX ON rag_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Query Optimization

```sql
-- Add GIN index for metadata filtering
CREATE INDEX ON rag_vectors USING GIN(metadata);

-- Filtered search example
SELECT * FROM vector_search(
  query_embedding := $1,
  match_threshold := 0.7,
  match_count := 5
)
WHERE metadata->>'source' = 'trusted_docs';
```

---

## 💰 Cost Estimation

### Embedding Costs

**Example**: Storing 1,000 documents (avg 500 words each)

| Model | Tokens | Cost | Total |
|-------|--------|------|-------|
| text-embedding-3-small | ~666K | $0.02/1M | **$0.01** |
| text-embedding-3-large | ~666K | $0.13/1M | **$0.09** |
| bge-large-en-v1.5 | ~666K | Free | **$0.00** |

### Storage Costs

**Supabase Database Storage**:
- Free tier: 500MB (enough for ~100K vectors)
- Pro tier: $0.125/GB/month

**Example**: 10,000 documents with 1536d embeddings
- Storage: ~60MB
- Cost: **Free tier** ✅

---

## 🔐 Security Best Practices

### 1. Never Expose Service Role Key in Frontend

```typescript
// ❌ WRONG - Don't do this
const supabase = createClient(
  "https://your-project.supabase.co",
  "your-service-role-key" // NEVER in frontend!
);

// ✅ CORRECT - Use environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

### 2. Use Row Level Security (RLS)

```sql
-- Restrict access to user's own vectors
CREATE POLICY "Users read own vectors" ON rag_vectors
  FOR SELECT USING (
    auth.uid() = (metadata->>'user_id')::uuid
  );
```

### 3. Validate Inputs

```typescript
// Sanitize user input before embedding
function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .slice(0, 8191); // OpenAI max tokens
}
```

---

## 🐛 Troubleshooting

### Error: "extension vector does not exist"

**Solution**: Enable the pgvector extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "operator does not exist: vector <=> vector"

**Solution**: Create operator class
```sql
CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops);
```

### Slow Search Queries

**Solutions**:
1. Rebuild index with more lists:
   ```sql
   DROP INDEX IF EXISTS rag_vectors_embedding_idx;
   CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops)
   WITH (lists = 200);
   ```

2. Switch to HNSW for >100K vectors:
   ```sql
   CREATE INDEX ON rag_vectors USING hnsw (embedding vector_cosine_ops);
   ```

### Out of Memory Errors

**Solutions**:
1. Reduce `lists` parameter in IVFFlat
2. Use dimension reduction (e.g., 1536d → 768d with PCA)
3. Upgrade Supabase plan for more RAM

---

## 📚 Advanced Patterns

### Hybrid Search (Vector + Keyword)

```sql
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding VECTOR(1536),
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  keyword_rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.content,
    1 - (v.embedding <=> query_embedding) AS similarity,
    ts_rank(to_tsvector('english', v.content), plainto_tsquery('english', query_text)) AS keyword_rank
  FROM rag_vectors v
  WHERE 
    1 - (v.embedding <=> query_embedding) > match_threshold
    OR to_tsvector('english', v.content) @@ plainto_tsquery('english', query_text)
  ORDER BY 
    (similarity * 0.7 + keyword_rank * 0.3) DESC
  LIMIT match_count;
END;
$$;
```

### Chunking Large Documents

```typescript
function chunkDocument(text: string, chunkSize: number = 512, overlap: number = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

// Store chunks with parent reference
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk, model);
  await supabase.from('rag_vectors').insert({
    content: chunk,
    embedding,
    metadata: {
      parent_doc_id: documentId,
      chunk_index: chunks.indexOf(chunk)
    }
  });
}
```

### Re-ranking Results

```typescript
async function rerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
  // Use a cross-encoder model for precise ranking
  const scores = await fetch('https://api-inference.huggingface.co/models/cross-encoder/ms-marco-MiniLM-L-6-v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: results.map(r => [query, r.content])
    })
  }).then(r => r.json());
  
  return results
    .map((r, i) => ({ ...r, rerank_score: scores[i] }))
    .sort((a, b) => b.rerank_score - a.rerank_score);
}
```

---

## 🚀 Production Checklist

- [ ] pgvector extension enabled
- [ ] Vector table created with correct dimensions
- [ ] Vector index created (IVFFlat or HNSW)
- [ ] Search function deployed
- [ ] Row Level Security enabled
- [ ] API keys stored in environment variables
- [ ] Input validation implemented
- [ ] Error handling added
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] Cost tracking enabled

---

## 📖 Additional Resources

- **Supabase pgvector Docs**: https://supabase.com/docs/guides/ai/vector-columns
- **OpenAI Embeddings Guide**: https://platform.openai.com/docs/guides/embeddings
- **pgvector GitHub**: https://github.com/pgvector/pgvector
- **HuggingFace Models**: https://huggingface.co/models?pipeline_tag=feature-extraction

---

## 🎓 Next Steps

1. **Test the Integration**: Use the Vector RAG tab to store and search documents
2. **Optimize Indexing**: Tune index parameters for your dataset size
3. **Implement Chunking**: Split large documents for better retrieval
4. **Add Metadata Filtering**: Filter results by source, date, tags, etc.
5. **Build RAG Pipeline**: Combine with LLM for question-answering
6. **Monitor Performance**: Track search latency and relevance scores
7. **Scale Up**: Migrate to HNSW index when you hit 100K+ vectors

---

**Ready to build production RAG systems!** 🚀
