export interface ApiValidationResult {
  success: boolean;
  status: number;
  message: string;
  latency: number;
  details?: {
    modelCount?: number;
    models?: string[];
    error?: string;
    provider?: string;
  };
}

export interface ChatCompletionRequest {
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider?: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const API_ENDPOINTS = {
  openrouter: "https://openrouter.ai/api/v1",
  deepseek: "https://api.deepseek.com",
  xai: "https://api.x.ai/v1",
  nvidia: "https://integrate.api.nvidia.com/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1"
};

const MODELS_ENDPOINTS = {
  openrouter: `${API_ENDPOINTS.openrouter}/models`,
  deepseek: `${API_ENDPOINTS.deepseek}/models`,
  xai: `${API_ENDPOINTS.xai}/models`,
  nvidia: `${API_ENDPOINTS.nvidia}/models`,
  openai: `${API_ENDPOINTS.openai}/models`,
  anthropic: `${API_ENDPOINTS.anthropic}/v1/models`
};

export async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<ApiValidationResult> {
  const startTime = Date.now();

  try {
    const endpoint = MODELS_ENDPOINTS[provider as keyof typeof MODELS_ENDPOINTS];
    
    if (!endpoint) {
      return {
        success: false,
        status: 400,
        message: "Invalid provider",
        latency: Date.now() - startTime,
        details: { error: `Provider "${provider}" not supported` }
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (provider === "openrouter") {
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = window.location.origin;
      headers["X-Title"] = "Multimodal AI Integration Platform";
    } else if (provider === "anthropic") {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Authentication failed";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        status: response.status,
        message: errorMessage,
        latency,
        details: { 
          error: `HTTP ${response.status}: ${errorMessage}`,
          provider 
        }
      };
    }

    const data = await response.json();
    const models = data.data || data.models || [];
    
    return {
      success: true,
      status: 200,
      message: "API key validated successfully",
      latency,
      details: {
        modelCount: models.length,
        models: models.slice(0, 5).map((m: any) => m.id || m.name),
        provider
      }
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      success: false,
      status: 0,
      message: "Network error or CORS blocked",
      latency,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        provider
      }
    };
  }
}

export async function testChatCompletion(
  request: ChatCompletionRequest,
  apiKey: string
): Promise<{ success: boolean; data?: ChatCompletionResponse; error?: string; latency: number }> {
  const startTime = Date.now();

  try {
    const endpoint = `${API_ENDPOINTS[request.provider as keyof typeof API_ENDPOINTS]}/chat/completions`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (request.provider === "openrouter") {
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = window.location.origin;
      headers["X-Title"] = "Multimodal AI Integration Platform";
    } else if (request.provider === "anthropic") {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const body: any = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7
    };

    if (request.max_tokens) {
      body.max_tokens = request.max_tokens;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Request failed";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${errorMessage}`,
        latency
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        ...data,
        provider: request.provider
      },
      latency
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      latency
    };
  }
}

export function getProviderFromModel(model: string): string {
  if (model.startsWith("deepseek/") || model.includes("deepseek")) {
    return "deepseek";
  }
  if (model.startsWith("grok") || model.startsWith("x-ai/") || model.includes("grok")) {
    return "xai";
  }
  if (model.startsWith("nvidia/") || model.includes("nemotron")) {
    return "nvidia";
  }
  if (model.startsWith("openai/") || model.includes("gpt-")) {
    return "openai";
  }
  if (model.startsWith("anthropic/") || model.includes("claude")) {
    return "anthropic";
  }
  return "openrouter";
}

export function getModelDisplayName(model: string): string {
  const parts = model.split("/");
  return parts[parts.length - 1];
}
