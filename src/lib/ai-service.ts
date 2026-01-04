/**
 * Unified AI Service - Routes all AI requests through Supabase Edge Functions
 * This avoids CORS issues by using the wrappers Edge Function as a proxy
 */

import { WRAPPERS_URL, getAuthToken } from './supabase';

export type Provider = 'openrouter' | 'deepseek' | 'xai' | 'anthropic' | 'gemini' | 'perplexity';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  provider: Provider;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  ok: boolean;
  status: number;
  data: {
    id?: string;
    model?: string;
    choices?: Array<{
      message: { role: string; content: string };
      finish_reason: string;
    }>;
    content?: Array<{ type: string; text: string }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      input_tokens?: number;
      output_tokens?: number;
    };
    error?: { message: string };
  };
}

export interface UnifiedResponse {
  success: boolean;
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  raw?: unknown;
  error?: string;
}

// Pricing per 1M tokens (input/output)
const PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-opus-20240229': { input: 15, output: 75 },
  // DeepSeek
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
  // XAI
  'grok-2': { input: 2, output: 10 },
  'grok-beta': { input: 5, output: 15 },
  // Gemini
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  // Perplexity
  'llama-3.1-sonar-small-128k-online': { input: 0.2, output: 0.2 },
  'llama-3.1-sonar-large-128k-online': { input: 1, output: 1 },
};

function calculateCost(model: string, inputTokens: number, outputTokens: number) {
  const price = PRICING[model] || { input: 1, output: 2 }; // Default pricing
  const inputCost = (inputTokens / 1_000_000) * price.input;
  const outputCost = (outputTokens / 1_000_000) * price.output;
  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost,
  };
}

function extractContent(data: ChatResponse['data'], provider: Provider): string {
  if (provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  }
  if (provider === 'gemini') {
    // Gemini response format
    const candidates = (data as any).candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  // OpenAI-compatible (openrouter, deepseek, xai, perplexity)
  return data.choices?.[0]?.message?.content || '';
}

function extractUsage(data: ChatResponse['data'], provider: Provider) {
  if (provider === 'anthropic') {
    return {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0,
      total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }
  if (provider === 'gemini') {
    const meta = (data as any).usageMetadata;
    return {
      input: meta?.promptTokenCount || 0,
      output: meta?.candidatesTokenCount || 0,
      total: meta?.totalTokenCount || 0,
    };
  }
  return {
    input: data.usage?.prompt_tokens || 0,
    output: data.usage?.completion_tokens || 0,
    total: data.usage?.total_tokens || 0,
  };
}

/**
 * Send a chat request through the Supabase wrappers Edge Function
 */
export async function chat(request: ChatRequest): Promise<UnifiedResponse> {
  const startTime = performance.now();

  try {
    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      // For demo/testing without auth, use anon key directly
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!anonKey) {
        throw new Error('Not authenticated. Please sign in.');
      }
    }

    const response = await fetch(`${WRAPPERS_URL}/ai/${request.provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 1024,
        top_p: request.top_p,
        stream: request.stream ?? false,
      }),
    });

    const latency = Math.round(performance.now() - startTime);
    const result: ChatResponse = await response.json();

    if (!result.ok || result.data?.error) {
      return {
        success: false,
        content: '',
        model: request.model,
        tokens: { input: 0, output: 0, total: 0 },
        cost: { input: 0, output: 0, total: 0 },
        latency,
        error: result.data?.error?.message || `HTTP ${result.status}`,
        raw: result,
      };
    }

    const content = extractContent(result.data, request.provider);
    const tokens = extractUsage(result.data, request.provider);
    const cost = calculateCost(request.model, tokens.input, tokens.output);

    return {
      success: true,
      content,
      model: result.data.model || request.model,
      tokens,
      cost,
      latency,
      raw: result,
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      content: '',
      model: request.model,
      tokens: { input: 0, output: 0, total: 0 },
      cost: { input: 0, output: 0, total: 0 },
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stream a chat response (returns async generator)
 */
export async function* chatStream(request: ChatRequest): AsyncGenerator<string, void, unknown> {
  const token = await getAuthToken();

  const response = await fetch(`${WRAPPERS_URL}/ai/${request.provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stream error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        // Handle different streaming formats:
        // - OpenAI/compatible: choices[0].delta.content
        // - Anthropic: delta.text or content_block_delta with delta.text
        // - Gemini: candidates[0].content.parts[0].text (but usually not streamed this way)
        const content =
          parsed.choices?.[0]?.delta?.content ||  // OpenAI format
          parsed.delta?.text ||                    // Anthropic content_block_delta
          parsed.content_block?.text ||            // Anthropic content_block_start
          '';
        if (content) yield content;
      } catch {
        // Skip unparseable chunks
      }
    }
  }
}

/**
 * Call a Supabase RPC function through wrappers
 */
export async function rpc<T = unknown>(
  functionName: string,
  args?: Record<string, unknown>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${WRAPPERS_URL}/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ args }),
    });

    const result = await response.json();

    if (!result.ok) {
      return { success: false, error: result.error?.message || 'RPC failed' };
    }

    return { success: true, data: result.data?.result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for the wrappers service
 */
export async function healthCheck(): Promise<{ ok: boolean; time?: string; error?: string }> {
  try {
    const response = await fetch(`${WRAPPERS_URL}/health`);
    const data = await response.json();
    return { ok: data.ok, time: data.data?.time };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Health check failed' };
  }
}

// Export singleton for convenience
export const aiService = {
  chat,
  chatStream,
  rpc,
  healthCheck,
};
