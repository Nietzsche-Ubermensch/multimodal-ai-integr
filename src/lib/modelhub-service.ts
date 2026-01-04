/**
 * ModelHub Service
 * Core business logic for the AI Integration Platform
 */

import type {
  AIProvider,
  AIModel,
  APIKeyConfig,
  ModelResponse,
  TokenUsage,
  CostEntry,
  SessionCosts,
  PromptTemplate,
  TemplateCategory,
} from '@/types/modelhub';

// ============================================================================
// Model Registry
// ============================================================================

export const AI_MODELS: AIModel[] = [
  // OpenRouter Models
  {
    id: 'openrouter/anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'openrouter/openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    contextWindow: 128000,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function_calling'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'openrouter/google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'openrouter',
    contextWindow: 1000000,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'openrouter/deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'openrouter',
    contextWindow: 64000,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    capabilities: ['chat', 'code', 'reasoning'],
    supportsStreaming: true,
    supportsVision: false,
  },
  // Direct Provider Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Direct)',
    provider: 'openai',
    contextWindow: 128000,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function_calling', 'json_mode'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    capabilities: ['chat', 'code', 'function_calling', 'json_mode'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Direct)',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    capabilities: ['chat', 'code'],
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat (Direct)',
    provider: 'deepseek',
    contextWindow: 64000,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    capabilities: ['chat', 'code', 'reasoning'],
    supportsStreaming: true,
    supportsVision: false,
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    contextWindow: 64000,
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    capabilities: ['chat', 'code', 'reasoning'],
    supportsStreaming: true,
    supportsVision: false,
  },
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xai',
    contextWindow: 128000,
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'code', 'reasoning'],
    supportsStreaming: true,
    supportsVision: false,
  },
  {
    id: 'grok-2-vision',
    name: 'Grok 2 Vision',
    provider: 'xai',
    contextWindow: 32000,
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'vision'],
    supportsStreaming: true,
    supportsVision: true,
  },
];

// ============================================================================
// Template Library
// ============================================================================

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Code Review Templates
  {
    id: 'code-review-general',
    name: 'General Code Review',
    description: 'Comprehensive code review for any programming language',
    category: 'code_review',
    systemPrompt: 'You are an expert code reviewer. Provide constructive, actionable feedback.',
    userPromptTemplate: `Please review the following code and provide feedback on:
1. Code quality and readability
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Best practices and improvements

\`\`\`{{language}}
{{code}}
\`\`\``,
    variables: [
      { name: 'language', description: 'Programming language', required: true },
      { name: 'code', description: 'Code to review', required: true },
    ],
    tags: ['code', 'review', 'quality'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'code-review-security',
    name: 'Security-Focused Code Review',
    description: 'Review code with emphasis on security vulnerabilities',
    category: 'code_review',
    systemPrompt: 'You are a security expert. Focus on identifying vulnerabilities and security best practices.',
    userPromptTemplate: `Perform a security-focused code review:

\`\`\`{{language}}
{{code}}
\`\`\`

Analyze for:
- SQL injection
- XSS vulnerabilities
- Authentication/authorization issues
- Input validation
- Sensitive data exposure
- OWASP Top 10 concerns`,
    variables: [
      { name: 'language', description: 'Programming language', required: true },
      { name: 'code', description: 'Code to review', required: true },
    ],
    tags: ['code', 'security', 'owasp'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Document Summarization Templates
  {
    id: 'summarize-document',
    name: 'Document Summarization',
    description: 'Summarize any document or article',
    category: 'summarization',
    systemPrompt: 'You are an expert at distilling information. Provide clear, concise summaries.',
    userPromptTemplate: `Summarize the following document in {{length}} format:

{{document}}

Include:
- Key points and main arguments
- Important facts and figures
- Conclusions or recommendations`,
    variables: [
      { name: 'document', description: 'Document to summarize', required: true },
      { name: 'length', description: 'Summary length (brief/detailed)', defaultValue: 'detailed', required: false },
    ],
    tags: ['summary', 'document', 'analysis'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'summarize-meeting',
    name: 'Meeting Notes Summary',
    description: 'Summarize meeting transcripts or notes',
    category: 'summarization',
    systemPrompt: 'You are a professional assistant skilled at extracting key information from meetings.',
    userPromptTemplate: `Summarize these meeting notes:

{{notes}}

Provide:
1. **Key Decisions Made**
2. **Action Items** (with owners if mentioned)
3. **Discussion Points**
4. **Next Steps**
5. **Follow-up Required**`,
    variables: [
      { name: 'notes', description: 'Meeting notes or transcript', required: true },
    ],
    tags: ['meeting', 'summary', 'action-items'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Data Analysis Templates
  {
    id: 'data-analysis-csv',
    name: 'CSV Data Analysis',
    description: 'Analyze CSV data and provide insights',
    category: 'data_analysis',
    systemPrompt: 'You are a data analyst. Provide clear insights and visualizations suggestions.',
    userPromptTemplate: `Analyze this CSV data:

\`\`\`csv
{{data}}
\`\`\`

Provide:
1. Data overview and statistics
2. Key patterns and trends
3. Anomalies or outliers
4. Recommendations for visualization
5. Potential insights for {{context}}`,
    variables: [
      { name: 'data', description: 'CSV data to analyze', required: true },
      { name: 'context', description: 'Business context or goal', defaultValue: 'general analysis', required: false },
    ],
    tags: ['data', 'analysis', 'csv', 'insights'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'data-analysis-sql',
    name: 'SQL Query Generator',
    description: 'Generate SQL queries from natural language',
    category: 'data_analysis',
    systemPrompt: 'You are a SQL expert. Generate efficient, well-formatted SQL queries.',
    userPromptTemplate: `Given this database schema:

\`\`\`sql
{{schema}}
\`\`\`

Write a SQL query to: {{request}}

Requirements:
- Use appropriate JOINs
- Include comments explaining the logic
- Optimize for performance
- Handle NULL values appropriately`,
    variables: [
      { name: 'schema', description: 'Database schema (CREATE TABLE statements)', required: true },
      { name: 'request', description: 'What you want to query', required: true },
    ],
    tags: ['sql', 'database', 'query'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Creative Writing Templates
  {
    id: 'creative-blog-post',
    name: 'Blog Post Writer',
    description: 'Generate engaging blog posts',
    category: 'creative_writing',
    systemPrompt: 'You are a skilled content writer. Create engaging, SEO-friendly content.',
    userPromptTemplate: `Write a blog post about: {{topic}}

Target audience: {{audience}}
Tone: {{tone}}
Length: {{length}} words

Include:
- Engaging headline
- Introduction with hook
- Subheadings for readability
- Practical examples
- Call to action`,
    variables: [
      { name: 'topic', description: 'Blog post topic', required: true },
      { name: 'audience', description: 'Target audience', defaultValue: 'general readers', required: false },
      { name: 'tone', description: 'Writing tone', defaultValue: 'professional yet friendly', required: false },
      { name: 'length', description: 'Word count', defaultValue: '800', required: false },
    ],
    tags: ['blog', 'content', 'writing', 'seo'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'creative-email',
    name: 'Professional Email Writer',
    description: 'Draft professional emails for various purposes',
    category: 'creative_writing',
    systemPrompt: 'You are a professional communication specialist. Write clear, effective emails.',
    userPromptTemplate: `Write a {{type}} email:

Purpose: {{purpose}}
Recipient: {{recipient}}
Key points to include: {{points}}
Tone: {{tone}}

Format with:
- Clear subject line
- Professional greeting
- Concise body
- Appropriate closing`,
    variables: [
      { name: 'type', description: 'Email type (follow-up, request, announcement, etc.)', required: true },
      { name: 'purpose', description: 'Main purpose of the email', required: true },
      { name: 'recipient', description: 'Who is receiving this', required: true },
      { name: 'points', description: 'Key points to cover', required: true },
      { name: 'tone', description: 'Email tone', defaultValue: 'professional', required: false },
    ],
    tags: ['email', 'professional', 'communication'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Extraction Templates
  {
    id: 'extract-entities',
    name: 'Entity Extraction',
    description: 'Extract named entities from text',
    category: 'extraction',
    systemPrompt: 'You are an NLP expert. Extract entities accurately and categorize them properly.',
    userPromptTemplate: `Extract all named entities from this text:

{{text}}

Categorize into:
- **People**: Names of individuals
- **Organizations**: Companies, institutions
- **Locations**: Places, addresses
- **Dates**: Dates, times, durations
- **Money**: Monetary values
- **Products**: Product names
- **Other**: Any other significant entities

Format as JSON.`,
    variables: [
      { name: 'text', description: 'Text to analyze', required: true },
    ],
    tags: ['nlp', 'entities', 'extraction'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// Cost Calculator
// ============================================================================

export function calculateCost(model: AIModel, tokens: TokenUsage): number {
  const inputCost = (tokens.input / 1_000_000) * model.inputCostPer1M;
  const outputCost = (tokens.output / 1_000_000) * model.outputCostPer1M;
  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function createCostEntry(
  model: AIModel,
  tokens: TokenUsage
): CostEntry {
  return {
    id: crypto.randomUUID(),
    model: model.id,
    provider: model.provider,
    tokens,
    cost: calculateCost(model, tokens),
    timestamp: new Date().toISOString(),
  };
}

export function aggregateSessionCosts(entries: CostEntry[]): SessionCosts {
  const byProvider: Record<AIProvider, number> = {
    openrouter: 0,
    openai: 0,
    anthropic: 0,
    deepseek: 0,
    xai: 0,
    google: 0,
  };
  
  const byModel: Record<string, number> = {};
  let totalCost = 0;
  let totalTokens = 0;

  for (const entry of entries) {
    totalCost += entry.cost;
    totalTokens += entry.tokens.total;
    byProvider[entry.provider] += entry.cost;
    byModel[entry.model] = (byModel[entry.model] || 0) + entry.cost;
  }

  return {
    entries,
    totalCost,
    totalTokens,
    byProvider,
    byModel,
    sessionStart: entries[0]?.timestamp || new Date().toISOString(),
  };
}

// ============================================================================
// API Key Validation
// ============================================================================

export async function validateAPIKey(
  provider: AIProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (provider) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { valid: response.ok };
      }
      
      case 'anthropic': {
        // Use a lightweight validation approach - check API key format and make a minimal request
        // Anthropic keys start with 'sk-ant-'
        if (!apiKey.startsWith('sk-ant-')) {
          return { valid: false, error: 'Invalid Anthropic key format (should start with sk-ant-)' };
        }
        // Make a request that will fail fast if key is invalid
        // Using a very minimal request to reduce cost
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: '.' }],
          }),
        });
        // 401/403 = invalid key, 200/400 = valid key (400 might be rate limit or other error but key is valid)
        return { valid: response.status !== 401 && response.status !== 403 };
      }
      
      case 'openrouter': {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { valid: response.ok };
      }
      
      case 'deepseek': {
        const response = await fetch('https://api.deepseek.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { valid: response.ok };
      }
      
      case 'xai': {
        const response = await fetch('https://api.x.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { valid: response.ok };
      }
      
      default:
        return { valid: false, error: 'Unknown provider' };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

// ============================================================================
// Model Invocation
// ============================================================================

export async function invokeModel(
  model: AIModel,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<ModelResponse> {
  const startTime = Date.now();
  const id = crypto.randomUUID();

  try {
    let response: Response;
    let endpoint: string;
    let headers: Record<string, string>;
    let body: Record<string, unknown>;

    // Build request based on provider
    switch (model.provider) {
      case 'openai':
        endpoint = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        body = {
          model: model.id,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        };
        break;

      case 'anthropic':
        endpoint = 'https://api.anthropic.com/v1/messages';
        headers = {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        };
        const systemMsg = messages.find(m => m.role === 'system');
        const userMsgs = messages.filter(m => m.role !== 'system');
        body = {
          model: model.id,
          system: systemMsg?.content,
          messages: userMsgs,
          max_tokens: options?.maxTokens ?? 2048,
        };
        break;

      case 'openrouter':
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        };
        body = {
          model: model.id.replace('openrouter/', ''),
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        };
        break;

      case 'deepseek':
        endpoint = 'https://api.deepseek.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        body = {
          model: model.id,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        };
        break;

      case 'xai':
        endpoint = 'https://api.x.ai/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        body = {
          model: model.id,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        };
        break;

      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }

    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response based on provider
    let content: string;
    let tokens: TokenUsage;

    if (model.provider === 'anthropic') {
      content = data.content?.[0]?.text || '';
      tokens = {
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      };
    } else {
      content = data.choices?.[0]?.message?.content || '';
      tokens = {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      };
    }

    const cost = calculateCost(model, tokens);

    return {
      id,
      model: model.id,
      provider: model.provider,
      prompt: messages.find(m => m.role === 'user')?.content || '',
      systemPrompt: messages.find(m => m.role === 'system')?.content,
      response: content,
      tokens,
      latencyMs,
      timestamp: new Date().toISOString(),
      status: 'success',
      cost,
    };
  } catch (error) {
    return {
      id,
      model: model.id,
      provider: model.provider,
      prompt: messages.find(m => m.role === 'user')?.content || '',
      systemPrompt: messages.find(m => m.role === 'system')?.content,
      response: '',
      tokens: { input: 0, output: 0, total: 0 },
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      cost: 0,
    };
  }
}

// ============================================================================
// Batch Testing
// ============================================================================

export async function runBatchTest(
  prompt: string,
  systemPrompt: string | undefined,
  modelIds: string[],
  apiKeys: Record<AIProvider, string>
): Promise<ModelResponse[]> {
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: prompt },
  ];

  const promises = modelIds.map(async (modelId) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) {
      return {
        id: crypto.randomUUID(),
        model: modelId,
        provider: 'openrouter' as AIProvider,
        prompt,
        systemPrompt,
        response: '',
        tokens: { input: 0, output: 0, total: 0 },
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: `Model ${modelId} not found`,
        cost: 0,
      };
    }

    const apiKey = apiKeys[model.provider];
    if (!apiKey) {
      return {
        id: crypto.randomUUID(),
        model: modelId,
        provider: model.provider,
        prompt,
        systemPrompt,
        response: '',
        tokens: { input: 0, output: 0, total: 0 },
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: `No API key configured for ${model.provider}`,
        cost: 0,
      };
    }

    return invokeModel(model, apiKey, messages);
  });

  return Promise.all(promises);
}

// ============================================================================
// Export Functions
// ============================================================================

export function exportToMarkdown(
  responses: ModelResponse[],
  prompt: string,
  systemPrompt?: string
): string {
  const timestamp = new Date().toISOString();
  let md = `# Model Comparison Report

**Generated:** ${timestamp}

## Prompt

${systemPrompt ? `**System:** ${systemPrompt}\n\n` : ''}**User:** ${prompt}

## Results

| Model | Provider | Tokens | Latency | Cost |
|-------|----------|--------|---------|------|
${responses.map(r => `| ${r.model} | ${r.provider} | ${r.tokens.total} | ${r.latencyMs}ms | $${r.cost.toFixed(6)} |`).join('\n')}

## Responses

${responses.map(r => `### ${r.model}

**Status:** ${r.status}
**Latency:** ${r.latencyMs}ms
**Tokens:** ${r.tokens.input} input, ${r.tokens.output} output
**Cost:** $${r.cost.toFixed(6)}

${r.status === 'success' ? r.response : `**Error:** ${r.error}`}

---
`).join('\n')}

## Summary

- **Total Cost:** $${responses.reduce((sum, r) => sum + r.cost, 0).toFixed(6)}
- **Total Tokens:** ${responses.reduce((sum, r) => sum + r.tokens.total, 0)}
- **Avg Latency:** ${Math.round(responses.reduce((sum, r) => sum + r.latencyMs, 0) / responses.length)}ms
`;

  return md;
}

export function exportToJSON(
  responses: ModelResponse[],
  prompt: string,
  systemPrompt?: string
): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    prompt,
    systemPrompt,
    responses,
    summary: {
      totalCost: responses.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: responses.reduce((sum, r) => sum + r.tokens.total, 0),
      avgLatency: responses.reduce((sum, r) => sum + r.latencyMs, 0) / responses.length,
    },
  }, null, 2);
}

// ============================================================================
// Helper to get model by ID
// ============================================================================

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id);
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter(m => m.provider === provider);
}

export function getTemplatesByCategory(category: TemplateCategory): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.category === category);
}
