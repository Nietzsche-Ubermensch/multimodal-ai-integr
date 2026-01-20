# xAI Grok 4 Comprehensive Endpoint Documentation

## Overview

Complete technical reference for xAI's Grok 4 API endpoints covering all 9 models, capabilities matrix, tool integration, rate limits, and production deployment patterns.

---

## Table of Contents

1. [Base Architecture](#base-architecture)
2. [Complete Model Catalog](#complete-model-catalog)
3. [Capabilities Matrix](#capabilities-matrix)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Tool Integration](#tool-integration)
6. [Streaming & Response Formats](#streaming--response-formats)
7. [Rate Limits & Scaling](#rate-limits--scaling)
8. [Pricing](#pricing)
9. [Production Patterns](#production-patterns)
10. [Code Examples](#code-examples)

---

## Base Architecture

### Two API Domains

#### 1. Primary Inference API
- **Base URL**: `https://api.x.ai/v1`
- **Authentication**: `Authorization: Bearer <API_KEY>`
- **Purpose**: All model inference, chat completions, tool calling
- **Rate Limits**: 4M tokens/min, 480-600 rpm (model-dependent)

#### 2. Management API
- **Base URL**: `https://management-api.x.ai`
- **Authentication**: Separate Management Key required
- **Purpose**: Team/key management, billing, ACL configuration

**Key Management Endpoints**:
```
POST   /auth/teams/{teamId}/api-keys       # Create API keys
GET    /auth/teams/{teamId}/models         # List available models
GET    /auth/teams/{teamId}/endpoints      # List endpoint ACLs
DELETE /auth/teams/{teamId}/api-keys/{id}  # Revoke API key
```

---

## Complete Model Catalog

### All 9 Grok Models

| # | Model Name | Version | Status | Context | Released |
|---|------------|---------|--------|---------|----------|
| 1 | `grok-4-1-fast-reasoning` | 4.1 | ✅ Latest | 2M tokens | Nov 2025 |
| 2 | `grok-4-1-fast-non-reasoning` | 4.1 | ✅ Latest | 2M tokens | Nov 2025 |
| 3 | `grok-4-fast-reasoning` | 4.0 | 🟡 Legacy | 2M tokens | Aug 2025 |
| 4 | `grok-4-fast-non-reasoning` | 4.0 | 🟡 Legacy | 2M tokens | Aug 2025 |
| 5 | `grok-4-0709` | 4.0 | ✅ Stable | 256K tokens | Jul 2025 |
| 6 | `grok-code-fast-1` | Code | ✅ Specialized | 256K tokens | Sep 2025 |
| 7 | `grok-3` | 3.0 | 🟡 Legacy | 131K tokens | Mar 2025 |
| 8 | `grok-3-mini` | 3.0 | 🟡 Legacy | 131K tokens | Mar 2025 |
| 9 | `grok-2-vision-1212` | 2.0 | ✅ Vision | 32K tokens | Dec 2024 |

**Additional Model (Image Generation)**:
- `grok-2-image-1212` - Image generation model (separate endpoint)

---

## Capabilities Matrix

### Comprehensive Feature Support Table

| Model | Context | Reasoning | Tool Use | Vision | Audio | Web Search | JSON Output | Prompt Cache | Streaming |
|-------|---------|-----------|----------|--------|-------|------------|-------------|--------------|-----------|
| **grok-4-1-fast-reasoning** | 2M | ✅ Always On | ✅ Full | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-4-1-fast-non-reasoning** | 2M | ❌ Disabled | ✅ Full | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-4-fast-reasoning** | 2M | ✅ Always On | ✅ Full | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-4-fast-non-reasoning** | 2M | ❌ Disabled | ✅ Full | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-4-0709** | 256K | ✅ Always On | ✅ Full | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-code-fast-1** | 256K | ✅ Code-Optimized | ✅ Enhanced | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **grok-3** | 131K | ✅ Optional* | ✅ Standard | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **grok-3-mini** | 131K | ✅ Optional* | ✅ Standard | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **grok-2-vision-1212** | 32K | ❌ None | ⚠️ Limited | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |

**Notes**:
- ✅ = Fully supported
- ⚠️ = Limited support
- ❌ = Not supported
- `*` = Supports `reasoning_effort` parameter (`low`|`high`)

### Parameter Support Matrix

| Model | max_tokens | temperature | top_p | stop | frequency_penalty | presence_penalty | reasoning_effort |
|-------|-----------|-------------|-------|------|-------------------|------------------|------------------|
| grok-4-1-fast-reasoning | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| grok-4-1-fast-non-reasoning | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| grok-4-fast-* | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| grok-4-0709 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| grok-code-fast-1 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| grok-3 / grok-3-mini | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| grok-2-vision-1212 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Critical Constraints**:
- **Reasoning models** (`grok-4-*-reasoning`) will **error** if you include:
  - `stop` sequences
  - `frequency_penalty`
  - `presence_penalty`
  - `reasoning_effort` (not supported on Grok 4)
- **Grok 3** models support `reasoning_effort` but Grok 4 does **NOT**

---

## API Endpoints Reference

### 1. Chat Completions (Primary Endpoint)

**Single endpoint for all text-based models**:

```
POST https://api.x.ai/v1/chat/completions
```

#### Request Headers
```http
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

#### Request Body Schema

```typescript
interface ChatCompletionRequest {
  model: string;                    // Required: model identifier
  messages: Message[];              // Required: conversation history
  max_tokens?: number;              // Optional: max response tokens (default varies)
  temperature?: number;             // Optional: 0.0-2.0 (default 1.0)
  top_p?: number;                   // Optional: 0.0-1.0 (default 1.0)
  stream?: boolean;                 // Optional: enable streaming (default false)
  tools?: Tool[];                   // Optional: available functions
  tool_choice?: string | object;    // Optional: "auto" | "none" | {type, function}
  response_format?: {               // Optional: structured output
    type: "json_object" | "text"
  };
  
  // Only for non-reasoning models:
  stop?: string | string[];         // Optional: stop sequences
  frequency_penalty?: number;       // Optional: -2.0 to 2.0
  presence_penalty?: number;        // Optional: -2.0 to 2.0
  
  // Only for Grok 3 models:
  reasoning_effort?: "low" | "high"; // Optional: reasoning intensity
}

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ContentPart[];  // Text or multimodal content
  name?: string;                     // Optional: function/tool name
  tool_calls?: ToolCall[];          // For assistant messages with tool use
  tool_call_id?: string;            // For tool response messages
}

interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;                    // Base64 or HTTP URL
    detail?: "low" | "high" | "auto";
  };
}
```

#### Response Schema

```typescript
interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;                  // Unix timestamp
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number;      // Only for reasoning models
  };
}

interface Choice {
  index: number;
  message: {
    role: "assistant";
    content: string | null;
    tool_calls?: ToolCall[];
    reasoning_content?: string;     // Only for reasoning models
  };
  finish_reason: "stop" | "length" | "tool_calls" | "content_filter";
}
```

### 2. Vision Endpoint (Image Input)

**Same endpoint with multimodal content**:

```
POST https://api.x.ai/v1/chat/completions
```

**Model**: `grok-2-vision-1212`

#### Example Request
```json
{
  "model": "grok-2-vision-1212",
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "image_url",
        "image_url": {
          "url": "https://example.com/image.jpg",
          "detail": "high"
        }
      },
      {
        "type": "text",
        "text": "What's in this image?"
      }
    ]
  }],
  "max_tokens": 500
}
```

**Regional Endpoints** (Vision-specific):
- US East: `https://us-east-1.api.x.ai/v1`
- EU West: `https://eu-west-1.api.x.ai/v1`

### 3. Image Generation

```
POST https://api.x.ai/v1/images/generations
```

**Model**: `grok-2-image-1212`

#### Request Schema
```json
{
  "model": "grok-2-image-1212",
  "prompt": "A futuristic cityscape at sunset",
  "n": 1,
  "size": "1024x1024"
}
```

#### Response
```json
{
  "created": 1234567890,
  "data": [{
    "url": "https://cdn.x.ai/generated/image-abc123.png"
  }]
}
```

**Pricing**: $0.07 per image

### 4. Embeddings Endpoint

```
POST https://api.x.ai/v1/embeddings
```

**Status**: Not yet available (check latest docs)

### 5. Management Endpoints

#### Create API Key
```
POST https://management-api.x.ai/auth/teams/{teamId}/api-keys
```

#### List Models
```
GET https://management-api.x.ai/auth/teams/{teamId}/models
```

#### Validate Key
```
GET https://management-api.x.ai/auth/management-keys/validation
```

---

## Tool Integration

### Tool Definition Format (OpenAI-Compatible)

Tools are **NOT separate endpoints**—they're parameters in the chat completion request.

```typescript
interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}
```

### Example: Web Search Tool

```json
{
  "model": "grok-4-1-fast-reasoning",
  "messages": [
    {"role": "user", "content": "What are the latest AI developments?"}
  ],
  "tools": [{
    "type": "function",
    "function": {
      "name": "web_search",
      "description": "Search the internet for current information",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query"
          },
          "num_results": {
            "type": "integer",
            "description": "Number of results to return",
            "default": 5
          }
        },
        "required": ["query"]
      }
    }
  }],
  "tool_choice": "auto"
}
```

### Tool Response Flow

1. **Model decides to call tool** → Returns `tool_calls` in response
2. **You execute the function** → Get real data
3. **Send results back** → Add tool message to conversation
4. **Model generates final answer** → Uses tool results

```typescript
// Step 1: Model response with tool call
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "web_search",
          "arguments": "{\"query\":\"AI news 2025\"}"
        }
      }]
    }
  }]
}

// Step 2: Execute function (your code)
const searchResults = await performWebSearch("AI news 2025");

// Step 3: Send results back
{
  "model": "grok-4-1-fast-reasoning",
  "messages": [
    {"role": "user", "content": "What are the latest AI developments?"},
    {
      "role": "assistant",
      "content": null,
      "tool_calls": [/* from step 1 */]
    },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": JSON.stringify(searchResults)
    }
  ]
}

// Step 4: Model uses results to generate answer
```

### Built-in Tools

xAI provides managed tools (no server-side execution needed):

| Tool | Function | Cost | Availability |
|------|----------|------|--------------|
| `web_search` | Internet search | $5/1k calls | All models |
| `x_search` | X/Twitter search | $5/1k calls | All models |

**Usage**:
```json
{
  "tools": [{
    "type": "function",
    "function": {"name": "web_search"}
  }],
  "tool_choice": {"type": "function", "function": {"name": "web_search"}}
}
```

---

## Streaming & Response Formats

### Server-Sent Events (SSE)

Enable streaming with `"stream": true`:

```json
{
  "model": "grok-4-1-fast-non-reasoning",
  "messages": [...],
  "stream": true
}
```

### Stream Response Format

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"grok-4-1-fast-non-reasoning","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"grok-4-1-fast-non-reasoning","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"grok-4-1-fast-non-reasoning","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"grok-4-1-fast-non-reasoning","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### Reasoning Token Stream (Reasoning Models Only)

```
data: {"choices":[{"delta":{"reasoning_content":"Let me think about this..."}}]}
data: {"choices":[{"delta":{"reasoning_content":" First, I need to..."}}]}
data: {"choices":[{"delta":{"content":"Based on my analysis:"}}]}
```

---

## Rate Limits & Scaling

### Per-Model Rate Limits

| Model | Tokens/Minute | Requests/Minute | Concurrent Requests |
|-------|---------------|-----------------|---------------------|
| grok-4-1-fast-* | 4,000,000 | 480 | 100 |
| grok-4-0709 | 2,000,000 | 480 | 100 |
| grok-code-fast-1 | 4,000,000 | 480 | 100 |
| grok-3 | 131,000 | 600 | 50 |
| grok-3-mini | 131,000 | 480 | 50 |
| grok-2-vision-1212 | 1,000,000 | 300 | 50 |

### Rate Limit Headers

```http
X-RateLimit-Limit-Requests: 480
X-RateLimit-Limit-Tokens: 4000000
X-RateLimit-Remaining-Requests: 479
X-RateLimit-Remaining-Tokens: 3998500
X-RateLimit-Reset-Requests: 2025-01-15T12:35:00Z
X-RateLimit-Reset-Tokens: 2025-01-15T12:35:00Z
```

### Scaling Strategies

1. **Request Batching**: Combine multiple queries in conversation history
2. **Prompt Caching**: Reuse system prompts (Grok 4 models only)
3. **Model Fallback**: Downgrade to faster models during peak load
4. **Token Budgeting**: Monitor `usage.total_tokens` per request

---

## Pricing

### Input/Output Token Pricing

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context | Best For |
|-------|---------------------|----------------------|---------|----------|
| **grok-4-1-fast-reasoning** | $2.00 | $10.00 | 2M | Deep analysis, research |
| **grok-4-1-fast-non-reasoning** | $2.00 | $10.00 | 2M | Fast responses, chat |
| **grok-4-fast-reasoning** | $2.00 | $10.00 | 2M | Legacy reasoning |
| **grok-4-fast-non-reasoning** | $2.00 | $10.00 | 2M | Legacy chat |
| **grok-4-0709** | $5.00 | $15.00 | 256K | Highest quality |
| **grok-code-fast-1** | $0.20 | $1.50 | 256K | Code generation |
| **grok-3** | $1.00 | $3.00 | 131K | General purpose |
| **grok-3-mini** | $0.50 | $1.50 | 131K | Fast, cheap |
| **grok-2-vision-1212** | $2.00 | $10.00 | 32K | Image analysis |

### Tool Costs

| Tool | Cost | Unit |
|------|------|------|
| web_search | $5.00 | per 1,000 calls |
| x_search | $5.00 | per 1,000 calls |
| Image generation | $0.07 | per image |

### Reasoning Token Pricing

For reasoning models, **reasoning tokens** are counted separately:

```
Total Cost = (input_tokens × input_price) + 
             (output_tokens × output_price) + 
             (reasoning_tokens × output_price)
```

**Example**:
- Prompt: 1,000 tokens
- Reasoning: 5,000 tokens
- Output: 500 tokens
- Model: `grok-4-1-fast-reasoning`

```
Cost = (1,000 × $2/1M) + (500 × $10/1M) + (5,000 × $10/1M)
     = $0.002 + $0.005 + $0.050
     = $0.057
```

---

## Production Patterns

### 1. Model Selection Strategy

```typescript
// Route by use case
function selectModel(useCase: string): string {
  const modelMap = {
    'deep-research': 'grok-4-1-fast-reasoning',
    'fast-chat': 'grok-4-1-fast-non-reasoning',
    'code-gen': 'grok-code-fast-1',
    'vision': 'grok-2-vision-1212',
    'budget': 'grok-3-mini'
  };
  return modelMap[useCase] || 'grok-4-1-fast-non-reasoning';
}
```

### 2. Automatic Model Versioning

```typescript
// Use latest patch automatically
const model = "grok-4-1-fast-reasoning"; // Gets latest patches

// Or pin for consistency
const model = "grok-4-1-fast-reasoning-2025-11"; // Specific version
```

### 3. Tool Cost Management

```typescript
// Cache tool results
const cacheKey = `${toolName}:${JSON.stringify(args)}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const result = await executeTool(toolName, args);
cache.set(cacheKey, result, { ttl: 3600 }); // 1 hour
return result;
```

### 4. Token Budget Enforcement

```typescript
interface TokenBudget {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxTotalCost: number;
}

async function makeRequest(
  messages: Message[], 
  budget: TokenBudget
): Promise<ChatCompletionResponse> {
  const estimatedInputTokens = estimateTokens(messages);
  
  if (estimatedInputTokens > budget.maxInputTokens) {
    throw new Error('Input exceeds token budget');
  }
  
  return await client.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages,
    max_tokens: Math.min(4096, budget.maxOutputTokens)
  });
}
```

### 5. Streaming with Tool Monitoring

```typescript
async function* streamWithTools(
  messages: Message[],
  tools: Tool[]
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages,
    tools,
    stream: true
  });
  
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    
    // Monitor tool calls
    if (delta?.tool_calls) {
      console.log('Tool called:', delta.tool_calls[0].function.name);
    }
    
    // Stream content
    if (delta?.content) {
      yield delta.content;
    }
  }
}
```

### 6. Error Handling & Retries

```typescript
async function robustRequest(
  messages: Message[],
  retries = 3
): Promise<ChatCompletionResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      return await client.chat.completions.create({
        model: 'grok-4-1-fast-reasoning',
        messages
      });
    } catch (error: any) {
      // Retry on rate limit or server errors
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error; // Don't retry client errors
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Code Examples

### Example 1: Basic Chat Completion

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

async function chat(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'grok-4-1-fast-non-reasoning',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  });
  
  return response.choices[0].message.content || '';
}

// Usage
const answer = await chat('Explain quantum computing in simple terms');
console.log(answer);
```

### Example 2: Streaming Response

```typescript
async function streamChat(prompt: string): Promise<void> {
  const stream = await client.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}

await streamChat('Write a short poem about AI');
```

### Example 3: Tool Use with Web Search

```typescript
async function researchQuery(question: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [
      { role: 'user', content: question }
    ],
    tools: [{
      type: 'function',
      function: {
        name: 'web_search',
        description: 'Search the web for current information',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      }
    }],
    tool_choice: 'auto'
  });
  
  return response.choices[0].message.content || '';
}

const answer = await researchQuery('Latest developments in quantum computing');
```

### Example 4: Vision Analysis

```typescript
async function analyzeImage(imageUrl: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'grok-2-vision-1212',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: imageUrl, detail: 'high' }
        },
        {
          type: 'text',
          text: 'Describe this image in detail'
        }
      ]
    }],
    max_tokens: 500
  });
  
  return response.choices[0].message.content || '';
}

const description = await analyzeImage('https://example.com/photo.jpg');
```

### Example 5: Code Generation

```typescript
async function generateCode(spec: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'grok-code-fast-1',
    messages: [
      {
        role: 'system',
        content: 'You are an expert programmer. Generate clean, production-ready code.'
      },
      {
        role: 'user',
        content: spec
      }
    ],
    temperature: 0.2, // Lower for more deterministic code
    max_tokens: 2000
  });
  
  return response.choices[0].message.content || '';
}

const code = await generateCode('Create a TypeScript function to calculate Fibonacci numbers with memoization');
```

### Example 6: JSON Structured Output

```typescript
interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  key_points: string[];
}

async function analyzeText(text: string): Promise<AnalysisResult> {
  const response = await client.chat.completions.create({
    model: 'grok-4-1-fast-non-reasoning',
    messages: [
      {
        role: 'system',
        content: 'Extract sentiment and key points. Return valid JSON only.'
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });
  
  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content) as AnalysisResult;
}

const analysis = await analyzeText('This product exceeded my expectations!');
console.log(analysis);
// { sentiment: 'positive', confidence: 0.95, key_points: [...] }
```

### Example 7: Multi-Turn Conversation

```typescript
class ChatSession {
  private messages: OpenAI.ChatCompletionMessageParam[] = [];
  
  constructor(systemPrompt: string) {
    this.messages.push({ role: 'system', content: systemPrompt });
  }
  
  async send(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });
    
    const response = await client.chat.completions.create({
      model: 'grok-4-1-fast-non-reasoning',
      messages: this.messages,
      max_tokens: 500
    });
    
    const assistantMessage = response.choices[0].message.content || '';
    this.messages.push({ role: 'assistant', content: assistantMessage });
    
    return assistantMessage;
  }
  
  getHistory(): typeof this.messages {
    return this.messages;
  }
}

// Usage
const chat = new ChatSession('You are a helpful coding assistant.');
await chat.send('How do I reverse a string in Python?');
await chat.send('Can you show me a more efficient way?');
```

### Example 8: Token Usage Tracking

```typescript
interface UsageStats {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}

class TrackedClient {
  private stats: UsageStats = {
    totalCost: 0,
    totalTokens: 0,
    requestCount: 0
  };
  
  async complete(
    messages: OpenAI.ChatCompletionMessageParam[],
    model = 'grok-4-1-fast-non-reasoning'
  ): Promise<string> {
    const response = await client.chat.completions.create({
      model,
      messages
    });
    
    // Calculate cost (example for grok-4-1-fast-*)
    const inputCost = (response.usage?.prompt_tokens || 0) * 2 / 1_000_000;
    const outputCost = (response.usage?.completion_tokens || 0) * 10 / 1_000_000;
    const reasoningCost = (response.usage?.reasoning_tokens || 0) * 10 / 1_000_000;
    
    this.stats.totalCost += inputCost + outputCost + reasoningCost;
    this.stats.totalTokens += response.usage?.total_tokens || 0;
    this.stats.requestCount += 1;
    
    return response.choices[0].message.content || '';
  }
  
  getStats(): UsageStats {
    return { ...this.stats };
  }
}

// Usage
const trackedClient = new TrackedClient();
await trackedClient.complete([{ role: 'user', content: 'Hello!' }]);
console.log(trackedClient.getStats());
```

---

## Quick Reference

### Model Selection Cheat Sheet

```typescript
const USE_CASE_TO_MODEL = {
  // Production recommendations
  'deep-analysis': 'grok-4-1-fast-reasoning',      // Research, planning
  'fast-chat': 'grok-4-1-fast-non-reasoning',       // Chatbots, Q&A
  'code-generation': 'grok-code-fast-1',            // Programming
  'vision': 'grok-2-vision-1212',                   // Image analysis
  'budget-conscious': 'grok-3-mini',                // Cost-sensitive
  'highest-quality': 'grok-4-0709',                 // Premium quality
  
  // Special cases
  'legacy-reasoning': 'grok-3',                     // Old reasoning API
  'image-generation': 'grok-2-image-1212'           // Create images
};
```

### Critical Parameter Rules

```typescript
// ✅ Safe for all models
const safeParams = {
  max_tokens: 4096,
  temperature: 0.7,
  top_p: 0.9
};

// ⚠️ Only for NON-reasoning models
const extendedParams = {
  ...safeParams,
  stop: ['\n\n'],
  frequency_penalty: 0.1,
  presence_penalty: 0.1
};

// ⚠️ Only for Grok 3 models
const grok3Params = {
  ...extendedParams,
  reasoning_effort: 'high'
};
```

### Rate Limit Quick Reference

```bash
# Grok 4 Fast models
Tokens/min:  4,000,000
Requests/min: 480

# Grok 4 0709
Tokens/min:  2,000,000
Requests/min: 480

# Grok 3 models
Tokens/min:  131,000
Requests/min: 600 (grok-3), 480 (grok-3-mini)
```

---

## Resources

- **Official API Docs**: https://docs.x.ai/api
- **Playground**: https://console.x.ai
- **Status Page**: https://status.x.ai
- **Pricing**: https://x.ai/api/pricing
- **Model Cards**: https://x.ai/blog (announcements)
- **grok-cli**: https://github.com/superagent-ai/grok-cli - AI terminal assistant powered by Grok

---

**Last Updated**: January 2025  
**API Version**: v1  
**Document Version**: 1.0
