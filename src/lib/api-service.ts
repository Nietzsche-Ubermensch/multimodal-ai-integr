export interface ApiValidationResult {
  success: boolean;
  message: string;
  latency: number;
  details?: {
    modelCount?: number;
    error?: string;
    endpoint?: string;
    provider?: string;
  };
}

const PROVIDER_ENDPOINTS: Record<string, { url: string; method: string; headers: (key: string) => Record<string, string> }> = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  xai: {
    url: "https://api.x.ai/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    })
  },
  openai: {
    url: "https://api.openai.com/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  perplexity: {
    url: "https://api.perplexity.ai/models",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    })
  },
  huggingface: {
    url: "https://huggingface.co/api/whoami",
    method: "GET",
    headers: (key: string) => ({
      "Authorization": `Bearer ${key}`
    })
  }
};

export async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<ApiValidationResult> {
  const startTime = performance.now();
  
  const providerConfig = PROVIDER_ENDPOINTS[provider];
  
  if (!providerConfig) {
    return {
      success: false,
      message: "Provider not supported",
      latency: Math.round(performance.now() - startTime),
      details: {
        error: `No validation endpoint configured for ${provider}`
      }
    };
  }

  try {
    const response = await fetch(providerConfig.url, {
      method: providerConfig.method,
      headers: providerConfig.headers(apiKey),
      mode: "cors"
    });

    const latency = Math.round(performance.now() - startTime);

    if (response.ok) {
      let modelCount = 0;
      
      try {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          modelCount = data.data.length;
        } else if (Array.isArray(data)) {
          modelCount = data.length;
        }
      } catch {
        
      }

      return {
        success: true,
        message: "API key validated successfully",
        latency,
        details: {
          modelCount,
          endpoint: providerConfig.url,
          provider
        }
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Invalid API key",
        latency,
        details: {
          error: "Authentication failed - please check your API key",
          endpoint: providerConfig.url
        }
      };
    } else {
      return {
        success: false,
        message: `HTTP ${response.status}`,
        latency,
        details: {
          error: `Server returned ${response.status}: ${response.statusText}`,
          endpoint: providerConfig.url
        }
      };
    }
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    
    if (error instanceof TypeError && error.message.includes("CORS")) {
      return {
        success: false,
        message: "CORS error - validation blocked",
        latency,
        details: {
          error: "Browser security policy blocked the request. Consider using a backend proxy for production validation.",
          endpoint: providerConfig.url
        }
      };
    }
    
    return {
      success: false,
      message: "Network error",
      latency,
      details: {
        error: error instanceof Error ? error.message : "Unknown network error",
        endpoint: providerConfig.url
      }
    };
  }
}

export async function batchValidateApiKeys(
  keys: Record<string, string>,
  onProgress?: (completed: number, total: number) => void
): Promise<Record<string, ApiValidationResult>> {
  const providers = Object.keys(keys);
  const results: Record<string, ApiValidationResult> = {};
  
  const validationPromises = providers.map(async (provider, index) => {
    const result = await validateApiKey(provider, keys[provider]);
    results[provider] = result;
    
    if (onProgress) {
      onProgress(index + 1, providers.length);
    }
    
    return { provider, result };
  });
  
  await Promise.allSettled(validationPromises);
  
  return results;
}

export function getProviderStatus(validation?: ApiValidationResult): "valid" | "invalid" | "error" | "idle" {
  if (!validation) return "idle";
  if (validation.success) return "valid";
  if (validation.message.includes("Invalid")) return "invalid";
  return "error";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  provider: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  success: boolean;
  response?: string;
  error?: string;
  latency: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function testChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const startTime = performance.now();
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const latency = Math.round(performance.now() - startTime);
    
    const mockResponse = `This is a simulated response from ${request.provider}/${request.model}. ` +
      `Your message was: "${request.messages[request.messages.length - 1].content}". ` +
      `In a real implementation, this would make an actual API call to the provider.`;
    
    return {
      success: true,
      response: mockResponse,
      latency,
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
      }
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      latency
    };
  }
}

