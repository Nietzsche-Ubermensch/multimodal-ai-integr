# Complete Integration Guide - Making Everything Work Together

This guide shows you how to use ALL the platform's features in a cohesive workflow, from testing APIs to building production applications.

## 🎯 Integration Scenarios

### Scenario 1: Building a Production RAG Application

**Goal**: Create an AI assistant that answers questions using fresh web data

**Steps:**

1. **Test Web Scraping (Firecrawl/Oxylabs)**
   ```typescript
   // Navigate to Firecrawl tab
   // Test scraping your target website
   // Copy the generated code
   
   import Firecrawl from '@mendable/firecrawl-js';
   
   const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
   const result = await app.scrape('https://docs.example.com', {
     formats: ['markdown'],
   });
   ```

2. **Generate Embeddings (HuggingFace/NVIDIA)**
   ```typescript
   // Navigate to Embeddings tab
   // Test embedding generation
   // Copy the code
   
   import { HfInference } from '@huggingface/inference';
   
   const hf = new HfInference(process.env.HF_TOKEN);
   const embeddings = await hf.featureExtraction({
     model: 'intfloat/multilingual-e5-large',
     inputs: result.markdown,
   });
   ```

3. **Store in Supabase Vector DB**
   ```typescript
   // Navigate to Supabase tab
   // Review vector storage setup
   // Copy schema creation code
   
   import { createClient } from '@supabase/supabase-js';
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   );
   
   await supabase.from('documents').insert({
     content: result.markdown,
     embedding: embeddings,
     metadata: { url: 'https://docs.example.com' }
   });
   ```

4. **Query with LLM (via API Gateway)**
   ```typescript
   // Use the API Gateway for secure backend calls
   
   // Query vector DB for relevant docs
   const { data: matches } = await supabase.rpc('match_documents', {
     query_embedding: userQuestionEmbedding,
     match_count: 5
   });
   
   // Send to LLM with context
   const response = await fetch('http://localhost:3000/api/chat', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${jwt}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       provider: 'anthropic',
       model: 'claude-3-5-sonnet-20241022',
       messages: [
         {
           role: 'user',
           content: `Answer this question using the following context:\n\n${matches.map(m => m.content).join('\n\n')}\n\nQuestion: ${userQuestion}`
         }
       ]
     })
   });
   ```

5. **Test Everything in RAG Demo Tab**
   - Navigate to RAG Demo tab
   - Enter your URL and question
   - Watch the complete pipeline execute
   - Copy the generated production code

---

### Scenario 2: Multi-Provider AI Chat with Fallbacks

**Goal**: Build a resilient chat app that falls back if one provider fails

**Steps:**

1. **Validate All Provider Keys (Security Tab)**
   - Go to Security → API Status Dashboard
   - Enter keys for Anthropic, OpenRouter, DeepSeek
   - Validate all keys
   - Note which providers are working

2. **Set Up API Gateway with Fallbacks**
   ```typescript
   // api-gateway/src/routes/chat.ts
   
   const PROVIDER_PRIORITY = [
     { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
     { provider: 'openrouter', model: 'anthropic/claude-3-opus' },
     { provider: 'deepseek', model: 'deepseek-chat' }
   ];
   
   async function chatWithFallback(messages: Message[]) {
     for (const config of PROVIDER_PRIORITY) {
       try {
         return await callProvider(config.provider, config.model, messages);
       } catch (error) {
         console.log(`${config.provider} failed, trying next...`);
         continue;
       }
     }
     throw new Error('All providers failed');
   }
   ```

3. **Test Each Provider Individually**
   - Anthropic tab → Test Claude models
   - OpenRouter tab → Test multi-model access
   - DeepSeek tab → Test reasoning models
   - Copy working code from each

4. **Monitor with Status Dashboard**
   - Security tab → API Status Dashboard
   - Enable auto-refresh (30s)
   - Watch latency metrics
   - Get alerted to failures

---

### Scenario 3: Building a Semantic Search Engine

**Goal**: Create a search system that finds relevant content by meaning, not keywords

**Steps:**

1. **Collect Documents (Firecrawl Crawl)**
   ```typescript
   // Navigate to Firecrawl tab → Test Crawl endpoint
   
   const crawlResult = await app.crawl('https://docs.mysite.com', {
     limit: 100,
     scrapeOptions: { formats: ['markdown'] }
   });
   
   const documents = crawlResult.data.map(page => ({
     url: page.url,
     content: page.markdown,
     title: page.metadata.title
   }));
   ```

2. **Generate All Embeddings (HuggingFace)**
   ```typescript
   // Navigate to Embeddings tab → Test batch generation
   
   const embeddings = await Promise.all(
     documents.map(async (doc) => ({
       ...doc,
       embedding: await hf.featureExtraction({
         model: 'sentence-transformers/all-MiniLM-L6-v2',
         inputs: doc.content
       })
     }))
   );
   ```

3. **Store in Supabase with HNSW Index**
   ```sql
   -- Copy from Supabase tab → SQL schema
   
   CREATE TABLE documents (
     id BIGSERIAL PRIMARY KEY,
     url TEXT,
     title TEXT,
     content TEXT,
     embedding VECTOR(384)
   );
   
   CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
   ```

4. **Implement Search Function**
   ```typescript
   async function semanticSearch(query: string, topK: number = 10) {
     // Generate query embedding
     const queryEmbedding = await hf.featureExtraction({
       model: 'sentence-transformers/all-MiniLM-L6-v2',
       inputs: query
     });
     
     // Search with cosine similarity
     const { data } = await supabase.rpc('match_documents', {
       query_embedding: queryEmbedding,
       match_count: topK
     });
     
     return data;
   }
   ```

5. **Add Reranking for Precision (HuggingFace Rerank)**
   ```typescript
   // Navigate to Rerank tab → Test reranking
   
   const searchResults = await semanticSearch(query, 50); // Get 50 candidates
   
   // Rerank top 50 to get best 10
   const reranked = await hf.rerank({
     model: 'BAAI/bge-reranker-base',
     query: query,
     documents: searchResults.map(r => r.content),
     topN: 10
   });
   ```

---

### Scenario 4: Building a Code Review Bot

**Goal**: Automated code review using multiple AI models for different aspects

**Steps:**

1. **Test Models for Different Tasks**
   - DeepSeek Coder → Code-specific analysis
   - Claude → Natural language explanations
   - GPT-4 (via OpenRouter) → General code quality

2. **Set Up API Gateway Routes**
   ```typescript
   // Dedicated endpoints for each review type
   
   app.post('/api/review/security', async (req, res) => {
     // Use Claude for security analysis
     const result = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       messages: [{
         role: 'user',
         content: `Review this code for security vulnerabilities:\n\n${req.body.code}`
       }]
     });
     res.json(result);
   });
   
   app.post('/api/review/performance', async (req, res) => {
     // Use DeepSeek for performance analysis
     const result = await deepseek.chat.completions.create({
       model: 'deepseek-coder',
       messages: [{
         role: 'user',
         content: `Analyze performance of:\n\n${req.body.code}`
       }]
     });
     res.json(result);
   });
   ```

3. **Combine Results**
   ```typescript
   async function comprehensiveReview(code: string) {
     const [security, performance, style] = await Promise.all([
       fetch('/api/review/security', { method: 'POST', body: JSON.stringify({ code }) }),
       fetch('/api/review/performance', { method: 'POST', body: JSON.stringify({ code }) }),
       fetch('/api/review/style', { method: 'POST', body: JSON.stringify({ code }) })
     ]);
     
     return {
       security: await security.json(),
       performance: await performance.json(),
       style: await style.json()
     };
   }
   ```

---

### Scenario 5: Production Deployment with Monitoring

**Goal**: Deploy the entire platform to production with monitoring

**Steps:**

1. **Choose Deployment Strategy**
   - Navigate to Deploy tab
   - Review platform options
   - Choose Docker + Redis for production

2. **Set Up Environment Variables**
   ```bash
   # Copy from Environment Setup tab
   
   # API Keys (required)
   ANTHROPIC_API_KEY=sk-ant-api03-xxx
   OPENROUTER_API_KEY=sk-or-v1-xxx
   DEEPSEEK_API_KEY=sk-xxx
   XAI_API_KEY=xai-xxx
   
   # Services
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxx
   REDIS_URL=redis://redis:6379
   
   # Security
   JWT_SECRET=your-secure-random-string
   JWT_EXPIRES_IN=24h
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=15m
   ```

3. **Deploy with Docker Compose**
   ```yaml
   # docker-compose.yml (copy from api-gateway/)
   
   services:
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
     
     api-gateway:
       build: ./api-gateway
       ports:
         - "3000:3000"
       environment:
         - REDIS_URL=redis://redis:6379
       depends_on:
         - redis
     
     frontend:
       build: .
       ports:
         - "80:80"
       environment:
         - VITE_API_URL=http://api-gateway:3000
   ```

4. **Set Up Monitoring**
   ```typescript
   // Add to API Gateway
   
   import * as Sentry from '@sentry/node';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   
   // Track API usage
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log({
         method: req.method,
         path: req.path,
         status: res.statusCode,
         duration,
         provider: req.body?.provider,
         model: req.body?.model
       });
     });
     next();
   });
   ```

5. **Test Production Setup**
   - Use Security → API Status Dashboard
   - Verify all providers are online
   - Check latency metrics
   - Test API Gateway health endpoint
   - Monitor logs for errors

---

## 🔗 Feature Combinations

### Combination 1: RAG + Reranking + Streaming
```typescript
// Get initial results from vector DB
const candidates = await semanticSearch(query, 50);

// Rerank for precision
const reranked = await rerank(query, candidates);

// Stream LLM response with top results
const stream = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: `Using these sources:\n\n${reranked.slice(0, 5).map(r => r.content).join('\n\n')}\n\nAnswer: ${query}`
    }],
    stream: true
  })
});

// Display streaming response
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Combination 2: Multi-Provider + Cost Optimization
```typescript
// Use Security tab to check provider latency
// Route to fastest/cheapest provider

const providerCosts = {
  'deepseek': 0.14,  // per 1M tokens (cheapest)
  'openrouter/llama': 0.18,
  'anthropic': 15.00,  // most expensive
};

async function optimizedChat(messages, budget = 'low') {
  const provider = budget === 'low' 
    ? 'deepseek' 
    : budget === 'medium'
    ? 'openrouter'
    : 'anthropic';
    
  return await callProvider(provider, messages);
}
```

### Combination 3: Embeddings + Clustering + Visualization
```typescript
// Use Embeddings tab to generate vectors
// Use Rerank to find clusters
// Visualize with D3

import * as d3 from 'd3';

// Generate embeddings for all documents
const embeddings = await batchEmbed(documents);

// Use reranking to find document clusters
const clusters = await clusterDocuments(embeddings);

// Visualize in frontend
function visualizeClusters(clusters) {
  const svg = d3.select('#viz').append('svg');
  // D3 visualization code...
}
```

---

## 🚀 Production Checklist

Before deploying your integrated AI application:

### Security ✅
- [ ] All API keys in environment variables (never in code)
- [ ] API Gateway authentication (JWT) enabled
- [ ] Rate limiting configured (tested in Security tab)
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] HTTPS enabled in production

### Performance ✅
- [ ] Redis caching enabled (API Gateway)
- [ ] Vector DB indexes created (HNSW for Supabase)
- [ ] Provider fallbacks configured
- [ ] Streaming enabled for long responses
- [ ] CDN for frontend assets

### Monitoring ✅
- [ ] API Status Dashboard running
- [ ] Log aggregation set up (e.g., Datadog, Sentry)
- [ ] Cost tracking enabled per provider
- [ ] Error alerting configured
- [ ] Health check endpoints tested

### Testing ✅
- [ ] All providers tested in Security tab
- [ ] RAG pipeline tested end-to-end
- [ ] Embedding generation tested
- [ ] Reranking tested
- [ ] Streaming responses tested
- [ ] Fallback logic tested

### Documentation ✅
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Monitoring dashboards shared with team
- [ ] Incident response plan created

---

## 🎓 Best Practices Summary

1. **Always Test First**: Use platform tabs to test before implementing
2. **Use API Gateway**: Never expose API keys to frontend
3. **Monitor Everything**: Use Status Dashboard + logging
4. **Plan for Failure**: Implement fallbacks for all providers
5. **Optimize Costs**: Use cheapest model that meets quality bar
6. **Cache Aggressively**: Cache embeddings, API responses, rerank results
7. **Version Control**: Track prompt versions, model versions
8. **Gradual Rollout**: Test with small traffic before full deployment

---

## 📞 Getting Help

- **Platform Issues**: Check PLATFORM_STATUS.md
- **API Gateway**: See API_GATEWAY.md
- **Architecture**: Review ARCHITECTURE.md
- **Security**: Read SECURITY.md
- **Guides**: Check component-specific docs in /docs

---

**Next Steps:**
1. Pick a scenario above
2. Follow steps in platform UI
3. Copy generated code
4. Test in your app
5. Deploy to production!
