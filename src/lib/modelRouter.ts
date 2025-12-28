export interface ModelRequest {
  prompt: string;
  model?: string;
  task?: 'chat' | 'code' | 'reasoning' | 'vision' | 'rag';
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  messages?: Array<{ role: string; content: string }>;
}

export interface ModelRouterConfig {
  defaultModel: {
    chat: string;
    code: string;
    reasoning: string;
    vision: string;
    rag: string;
  };
  fallbackChain: string[];
  routingStrategy: 'cost' | 'speed' | 'quality' | 'auto';
}

export interface ModelResponse {
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
  reasoning?: string;
}

export class ModelRouter {
  private config: ModelRouterConfig;
  
  constructor() {
    this.config = {
      defaultModel: {
        chat: 'anthropic/claude-sonnet-4-5',
        code: 'xai/grok-code-fast-1',
        reasoning: 'xai/grok-4-1-fast-reasoning',
        vision: 'anthropic/claude-opus-4-5',
        rag: 'deepseek/deepseek-chat'
      },
      fallbackChain: [
        'anthropic/claude-sonnet-4-5',
        'xai/grok-4-1-fast-non-reasoning',
        'deepseek/deepseek-chat',
        'openrouter/openai/gpt-4o-mini'
      ],
      routingStrategy: 'auto'
    };
  }

  async route(request: ModelRequest): Promise<ModelResponse> {
    const selectedModel = this.selectModel(request);
    
    for (const model of [selectedModel, ...this.config.fallbackChain]) {
      try {
        return await this.executeWithModel(model, request);
      } catch (error) {
        console.warn(`Model ${model} failed, trying fallback...`, error);
      }
    }
    
    throw new Error('All models failed');
  }

  private selectModel(request: ModelRequest): string {
    if (request.model) return request.model;
    if (request.task) return this.config.defaultModel[request.task];
    
    if (request.prompt.includes('```')) return this.config.defaultModel.code;
    if (request.prompt.length > 1000) return this.config.defaultModel.rag;
    if (request.prompt.toLowerCase().includes('image')) return this.config.defaultModel.vision;
    
    return this.config.defaultModel.chat;
  }

  private async executeWithModel(model: string, request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    
    const [provider, ...modelParts] = model.split('/');
    const modelId = modelParts.join('/');
    
    const apiKey = this.getApiKey(provider);
    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    const messages = request.messages || [{ role: 'user', content: request.prompt }];
    
    let response;
    
    switch (provider) {
      case 'xai':
        response = await this.callXAI(modelId, messages, apiKey, request);
        break;
      case 'deepseek':
        response = await this.callDeepSeek(modelId, messages, apiKey, request);
        break;
      case 'anthropic':
        response = await this.callAnthropic(modelId, messages, apiKey, request);
        break;
      case 'openrouter':
        response = await this.callOpenRouter(modelId, messages, apiKey, request);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    const latency = Date.now() - startTime;
    
    return {
      ...response,
      latency
    };
  }

  private async callXAI(model: string, messages: any[], apiKey: string, request: ModelRequest) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`xAI API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      cost: this.calculateCost('xai', model, data.usage),
      reasoning: data.choices[0].message.reasoning_content,
    };
  }

  private async callDeepSeek(model: string, messages: any[], apiKey: string, request: ModelRequest) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      cost: this.calculateCost('deepseek', model, data.usage),
    };
  }

  private async callAnthropic(model: string, messages: any[], apiKey: string, request: ModelRequest) {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens || 4096,
        messages: userMessages,
        system: systemMessage?.content,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      tokens: {
        input: data.usage.input_tokens,
        output: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens,
      },
      cost: this.calculateCost('anthropic', model, data.usage),
    };
  }

  private async callOpenRouter(model: string, messages: any[], apiKey: string, request: ModelRequest) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ModelHub',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokens: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      cost: {
        input: 0,
        output: 0,
        total: 0,
      },
    };
  }

  private getApiKey(provider: string): string | null {
    const keyMap: Record<string, string> = {
      'xai': 'XAI_API_KEY',
      'deepseek': 'DEEPSEEK_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'openrouter': 'OPENROUTER_API_KEY',
      'openai': 'OPENAI_API_KEY',
    };
    
    const keyName = keyMap[provider];
    if (!keyName) return null;
    
    return localStorage.getItem(keyName);
  }

  private calculateCost(provider: string, model: string, usage: any): { input: number; output: number; total: number } {
    const pricing: Record<string, { input: number; output: number }> = {
      'xai/grok-4-1-fast-reasoning': { input: 15, output: 30 },
      'xai/grok-4-1-fast-non-reasoning': { input: 8, output: 16 },
      'xai/grok-code-fast-1': { input: 12, output: 24 },
      'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },
      'deepseek/deepseek-reasoner': { input: 0.55, output: 2.19 },
      'anthropic/claude-opus-4-5': { input: 15, output: 75 },
      'anthropic/claude-sonnet-4-5': { input: 3, output: 15 },
    };
    
    const key = `${provider}/${model}`;
    const price = pricing[key] || { input: 0, output: 0 };
    
    const inputCost = (usage.prompt_tokens || usage.input_tokens || 0) * price.input / 1_000_000;
    const outputCost = (usage.completion_tokens || usage.output_tokens || 0) * price.output / 1_000_000;
    
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost,
    };
  }

  updateConfig(updates: Partial<ModelRouterConfig>) {
    this.config = { ...this.config, ...updates };
  }
}

export const modelRouter = new ModelRouter();
