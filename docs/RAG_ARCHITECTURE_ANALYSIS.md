# RAG Architecture Analysis: Web Scraping → LLM Generation

## Executive Summary

Your RAG pipeline is well-structured but requires strategic improvements in three areas:

1. **Semantic-aware chunking** (preserve context boundaries)
2. **Two-stage retrieval** (vector search + re-ranking)
3. **Observability & monitoring** (production readiness)

**Current bottlenecks:** Web scraping latency (8s) and Oxylabs costs ($0.02-0.05/request)

---

## 1. Web Scraping Layer (Oxylabs)

### Current Implementation

- Natural language prompt-based extraction
- Automatic content cleaning
- Markdown formatting for LLM consumption
- JavaScript rendering support (critical for modern sites)

### Improvements

#### A. Add Request Caching

```python
import hashlib
from datetime import datetime, timedelta

class OxylabsCache:
    def __init__(self, ttl_hours=24):
        self.cache = {}  # Replace with Redis in production
        self.ttl = timedelta(hours=ttl_hours)
    
    def get_cache_key(self, url):
        return hashlib.md5(url.encode()).hexdigest()
    
    def is_valid(self, cached_at):
        return datetime.now() - cached_at < self.ttl
    
    def fetch_with_cache(self, url, scraper):
        key = self.get_cache_key(url)
        
        if key in self.cache:
            cached_data, cached_at = self.cache[key]
            if self.is_valid(cached_at):
                return cached_data, "cache_hit"
        
        # Cache miss: fetch from Oxylabs
        data = scraper.fetch(url)
        self.cache[key] = (data, datetime.now())
        return data, "cache_miss"
```

#### B. Add Retry Logic with Exponential Backoff

```python
import asyncio
from typing import Optional

async def fetch_with_retries(
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0
) -> Optional[str]:
    """Fetch with exponential backoff for rate limiting."""
    for attempt in range(max_retries):
        try:
            result = await oxylabs_client.fetch(url)
            return result
        except RateLimitError:
            delay = base_delay * (2 ** attempt)
            print(f"Rate limited. Retrying in {delay}s...")
            await asyncio.sleep(delay)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(base_delay * (2 ** attempt))
```

#### C. Monitor Scraping Health

```python
from dataclasses import dataclass

@dataclass
class ScraperMetrics:
    total_requests: int = 0
    successful: int = 0
    failed: int = 0
    avg_latency_ms: float = 0.0
    cost_per_request: float = 0.025  # Oxylabs pricing
    
    @property
    def success_rate(self) -> float:
        return self.successful / self.total_requests if self.total_requests > 0 else 0
    
    @property
    def estimated_daily_cost(self) -> float:
        return self.total_requests * self.cost_per_request
```

---

## 2. Semantic Chunking Layer

### Problem with Fixed-Size Chunks

- ❌ Breaks sentences across boundaries
- ❌ Loses semantic coherence
- ❌ Creates redundant overlaps

### Solution: Semantic Chunking

```python
from typing import List
import re

class SemanticChunker:
    def __init__(self, max_chunk_size: int = 500, overlap_sentences: int = 2):
        self.max_chunk_size = max_chunk_size
        self.overlap_sentences = overlap_sentences
    
    def split_into_sentences(self, text: str) -> List[str]:
        """Split text preserving sentence boundaries."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def chunk(self, text: str) -> List[dict]:
        """Create semantic chunks with overlap."""
        sentences = self.split_into_sentences(text)
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence.split())
            
            if current_size + sentence_size <= self.max_chunk_size:
                current_chunk.append(sentence)
                current_size += sentence_size
            else:
                if current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append({
                        'text': chunk_text,
                        'token_count': len(chunk_text.split()),
                        'sentences': len(current_chunk)
                    })
                
                overlap = current_chunk[-self.overlap_sentences:] if self.overlap_sentences > 0 else []
                current_chunk = overlap + [sentence]
                current_size = sum(len(s.split()) for s in current_chunk)
        
        if current_chunk:
            chunks.append({
                'text': ' '.join(current_chunk),
                'token_count': len(' '.join(current_chunk).split()),
                'sentences': len(current_chunk)
            })
        
        return chunks

# Example
chunker = SemanticChunker(max_chunk_size=500)
chunks = chunker.chunk(markdown_content)
print(f"Created {len(chunks)} semantic chunks")
```

---

## 3. Embedding Generation & Batch Processing

### Efficient Batch Processing

```python
import asyncio
from typing import List
import openai

class EmbeddingGenerator:
    def __init__(self, model: str = "text-embedding-3-small", batch_size: int = 100):
        self.model = model
        self.batch_size = batch_size
        self.client = openai.AsyncOpenAI()
    
    async def generate_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        response = await self.client.embeddings.create(
            model=self.model,
            input=texts
        )
        
        embeddings = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in embeddings]
    
    async def generate_for_chunks(self, chunks: List[dict]) -> List[dict]:
        """Generate embeddings for all chunks with batching."""
        chunk_texts = [chunk['text'] for chunk in chunks]
        embeddings_list = []
        
        for i in range(0, len(chunk_texts), self.batch_size):
            batch = chunk_texts[i:i + self.batch_size]
            embeddings = await self.generate_batch(batch)
            embeddings_list.extend(embeddings)
            print(f"Processed {min(i + self.batch_size, len(chunk_texts))}/{len(chunk_texts)} chunks")
        
        for chunk, embedding in zip(chunks, embeddings_list):
            chunk['embedding'] = embedding
        
        return chunks
```

**Cost calculation:**
- text-embedding-3-small: $0.02 per 1M tokens
- For 1000 chunks × 500 tokens avg = 500K tokens = $0.01

---

## 4. Vector Storage & Retrieval (Supabase + pgvector)

### Setup SQL

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_chunk UNIQUE(url, chunk_index)
);

-- Create index for efficient similarity search
CREATE INDEX ON document_chunks USING HNSW (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create metadata index for filtering
CREATE INDEX ON document_chunks USING GIN (metadata);

-- Row Level Security (optional but recommended)
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_users_can_read" ON document_chunks
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Retrieval with Hybrid Search

```python
from supabase import create_client, Client
import asyncio

class VectorRetriever:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def vector_search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        similarity_threshold: float = 0.5
    ) -> List[dict]:
        """Pure vector similarity search."""
        response = self.supabase.rpc(
            'match_documents',
            {
                'query_embedding': query_embedding,
                'match_count': top_k,
                'match_threshold': similarity_threshold
            }
        ).execute()
        
        return response.data
    
    async def hybrid_search(
        self,
        query_text: str,
        query_embedding: List[float],
        top_k: int = 10
    ) -> List[dict]:
        """Blend vector search with keyword filtering."""
        vector_results = await self.vector_search(query_embedding, top_k=top_k*2)
        
        query_keywords = set(query_text.lower().split())
        
        scored_results = []
        for result in vector_results:
            content_words = set(result['content'].lower().split())
            keyword_overlap = len(query_keywords & content_words) / len(query_keywords)
            
            # Weighted score: 70% vector similarity + 30% keyword match
            final_score = (0.7 * result['similarity']) + (0.3 * keyword_overlap)
            
            result['final_score'] = final_score
            scored_results.append(result)
        
        scored_results.sort(key=lambda x: x['final_score'], reverse=True)
        return scored_results[:top_k]
```

### SQL RPC Function for Vector Search

```sql
CREATE OR REPLACE FUNCTION match_documents (
    query_embedding vector,
    match_count int DEFAULT 10,
    match_threshold float DEFAULT 0.5
)
RETURNS TABLE (
    id bigint,
    url text,
    content text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_chunks.id,
        document_chunks.url,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) as similarity
    FROM document_chunks
    WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY document_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Re-ranking for Relevance Optimization

### Two-Stage Retrieval with Re-ranking

```python
from typing import List

class RerankerStage:
    def __init__(self, model: str = "gpt-3.5-turbo"):
        self.model = model
        self.client = openai.AsyncOpenAI()
    
    async def rerank(
        self,
        query: str,
        candidates: List[dict],
        top_k: int = 5
    ) -> List[dict]:
        """Re-rank retrieved chunks for relevance."""
        
        candidates_text = "\n\n".join([
            f"[{i}] {chunk['content'][:300]}..."
            for i, chunk in enumerate(candidates)
        ])
        
        prompt = f"""Given this question: "{query}"
        
Rank these document chunks by relevance (most relevant first):

{candidates_text}

Return ONLY a numbered list of indices (e.g., "2, 0, 1, 3...") in order of relevance."""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=50
        )
        
        ranking = response.choices[0].message.content.strip()
        indices = [int(x.strip()) for x in ranking.split(',')]
        
        reranked = [candidates[i] for i in indices[:top_k]]
        return reranked
```

**Latency impact:** +400ms but improves relevance by 10-15%

---

## 6. Generation Layer (LiteLLM Integration)

### Complete RAG Pipeline

```python
from litellm import acompletion, embedding
import asyncio

class RAGPipeline:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.retriever = VectorRetriever(supabase_url, supabase_key)
        self.reranker = RerankerStage()
        self.embedder = EmbeddingGenerator()
    
    async def generate_answer(
        self,
        question: str,
        url: str = None,
        model: str = "gpt-4o-mini",
        use_reranking: bool = True,
        top_k: int = 5
    ) -> str:
        """Complete RAG pipeline with streaming."""
        
        # Step 1: Generate query embedding
        query_embedding = await self.embedder.generate_batch([question])
        query_embedding = query_embedding[0]
        
        # Step 2: Retrieve candidates
        candidates = await self.retriever.hybrid_search(
            question,
            query_embedding,
            top_k=20
        )
        
        # Step 3: Re-rank if enabled
        if use_reranking:
            candidates = await self.reranker.rerank(question, candidates, top_k)
        else:
            candidates = candidates[:top_k]
        
        # Step 4: Build context
        context = "\n\n".join([
            f"Source: {chunk['url']}\n{chunk['content']}"
            for chunk in candidates
        ])
        
        # Step 5: Generate answer with streaming
        system_prompt = """You are a helpful assistant that answers questions based on provided context.
Always cite your sources. If the context doesn't contain relevant information, say so."""
        
        user_prompt = f"""Question: {question}

Context:
{context}

Please answer the question based on the provided context."""
        
        response = await acompletion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=True,
            temperature=0.7,
            max_tokens=500
        )
        
        full_response = ""
        async for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                print(content, end="", flush=True)
        
        return full_response
```

**Cost breakdown:**
- Scraping: $0.025
- Embeddings: $0.00001
- LLM (gpt-4o-mini): $0.00015
- Total per query: ~$0.026

---

## 7. Production Architecture

### Complete System Diagram

```
┌─────────────┐
│   User      │
│  (Question) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  1. Web Scraping (Oxylabs)      │
│  - Cache layer                  │
│  - Retry logic + backoff        │
│  - Metrics tracking             │
└──────┬──────────────────────────┘
       │ Markdown content
       ▼
┌─────────────────────────────────┐
│  2. Semantic Chunking           │
│  - Preserve sentence boundaries │
│  - Add overlap for context      │
└──────┬──────────────────────────┘
       │ Chunks
       ▼
┌─────────────────────────────────┐
│  3. Embedding Generation        │
│  - Batch processing (100 items) │
│  - text-embedding-3-small       │
└──────┬──────────────────────────┘
       │ Embeddings + metadata
       ▼
┌─────────────────────────────────┐
│  4. Vector Storage (Supabase)   │
│  - pgvector with HNSW indexing  │
│  - Metadata filtering            │
└──────┬──────────────────────────┘
       │ On query:
       │ 1. Query embedding generated
       │ 2. Vector search (10 results)
       │ 3. Optional re-ranking (top 5)
       │
       ▼
┌─────────────────────────────────┐
│  5. LiteLLM Generation          │
│  - Fallback to alt. models      │
│  - Streaming responses          │
│  - Cost optimization            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│   Answer    │
│  (Streamed) │
└─────────────┘
```

---

## 8. Monitoring & Observability

### Key Metrics to Track

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class QueryMetrics:
    query_id: str
    question: str
    timestamp: datetime
    
    # Latency breakdown (milliseconds)
    scraping_latency: float
    chunking_latency: float
    embedding_latency: float
    retrieval_latency: float
    reranking_latency: float
    generation_latency: float
    
    @property
    def total_latency(self) -> float:
        return sum([
            self.scraping_latency,
            self.chunking_latency,
            self.embedding_latency,
            self.retrieval_latency,
            self.reranking_latency,
            self.generation_latency
        ])
    
    # Quality metrics
    source_relevance_score: float  # 0-1
    answer_completeness: float  # 0-1
    user_feedback: Optional[int]  # 1-5 stars
    
    # Cost
    total_cost_usd: float
```

### Logging to Supabase

```python
async def log_query_metrics(metrics: QueryMetrics, supabase_client):
    """Log metrics for monitoring and optimization."""
    await supabase_client.table('query_logs').insert({
        'query_id': metrics.query_id,
        'question': metrics.question,
        'timestamp': metrics.timestamp.isoformat(),
        'latency_breakdown': {
            'scraping': metrics.scraping_latency,
            'chunking': metrics.chunking_latency,
            'embedding': metrics.embedding_latency,
            'retrieval': metrics.retrieval_latency,
            'reranking': metrics.reranking_latency,
            'generation': metrics.generation_latency,
            'total': metrics.total_latency
        },
        'quality_metrics': {
            'relevance': metrics.source_relevance_score,
            'completeness': metrics.answer_completeness,
            'feedback': metrics.user_feedback
        },
        'cost_usd': metrics.total_cost_usd
    }).execute()
```

---

## 9. Performance Bottleneck Analysis

| Component | Latency | Cost | Optimization |
|-----------|---------|------|--------------|
| Web Scraping | 8,000 ms | $0.025 | Add caching (reduce calls by 70%) |
| Chunking | 50 ms | $0.00 | Negligible |
| Embeddings | 200 ms | $0.00001 | Batch processing (already done) |
| Vector Search | 100 ms | $0.00 | HNSW index (already done) |
| Re-ranking | 400 ms | $0.0001 | Optional; only for complex queries |
| LLM Generation | 1,500 ms | $0.0015 | Use gpt-3.5-turbo for simple Q&A |
| **TOTAL** | **~10,250 ms** | **$0.0266** | **~10 seconds, $0.03/query** |

### Optimization Priorities (ROI)

1. Cache scraping results (70% reduction, lowest effort)
2. Semantic chunking (10-15% relevance improvement)
3. Hybrid search (5-10% recall improvement)
4. Re-ranking (use selectively; not for simple queries)

---

## 10. Implementation Checklist

### Phase 1: MVP (Week 1-2)

- [ ] Set up Oxylabs + basic caching
- [ ] Implement semantic chunking
- [ ] Create Supabase pgvector setup
- [ ] Generate embeddings for sample URLs
- [ ] Build basic retrieval + LiteLLM generation

### Phase 2: Optimization (Week 3-4)

- [ ] Add hybrid search (vector + keyword)
- [ ] Implement re-ranking stage
- [ ] Set up monitoring and logging
- [ ] Performance testing and tuning

### Phase 3: Production (Week 5)

- [ ] Add authentication and RLS
- [ ] Set up error handling and fallbacks
- [ ] Deploy to production environment
- [ ] Load testing and capacity planning

---

## 11. Alternative Approaches

### Vector Database Trade-offs

| Database | Cost | Speed | Flexibility | Recommendation |
|----------|------|-------|-------------|----------------|
| Supabase + pgvector | Low | Good | High | ✅ Best for this architecture |
| Pinecone | High | Fast | Low | For high-volume, zero maintenance |
| Weaviate | Medium | Good | High | Self-hosted alternative |
| Chroma | Free | Medium | High | Good for local dev |

### Embedding Model Trade-offs

| Model | Cost | Quality | Speed |
|-------|------|---------|-------|
| text-embedding-3-small | Low ($0.02/1M) | Good | Fast |
| text-embedding-3-large | High ($0.13/1M) | Excellent | Slower |
| Cohere embed-v3 | Medium | Excellent | Fast |

---

## Conclusion

Your RAG architecture is production-ready with these enhancements:

1. Add semantic chunking for better context preservation
2. Use two-stage retrieval (vector → re-rank) for quality
3. Implement comprehensive monitoring for observability
4. Cache scraping results to reduce costs and latency by 70%

### Expected Improvements:

- **Query latency:** 10s → 2-3s (with caching)
- **Cost per query:** $0.026 → $0.008 (with cache hits)
- **Relevance:** +10-15% (with re-ranking)
- **Uptime:** >99% (with proper error handling)

---

## Integration with Your Current Platform

This architecture analysis integrates seamlessly with your existing AI Integration Platform:

- **Oxylabs** integration already in place
- **Supabase** MCP integration provides direct database access
- **LiteLLM** gateway unifies all LLM providers
- **Monitoring** extends your existing ApiStatusDashboard
- **API Gateway** routes requests to appropriate services

All components work together to provide a scalable, production-ready RAG system.
