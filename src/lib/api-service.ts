interface ValidationResult {
  success: boolean;
  message: string;
  latency: number;
  details?: {
    modelCount?: number;
    error?: string;
    models?: string[];
    quota?: {
      remaining?: number;
      limit?: number;
    };
  };
}

const VALIDATION_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function validateApiKey(provider: string, apiKey: string): Promise<ValidationResult> {
  const startTime = performance.now();

  try {
    let result: ValidationResult;

    switch (provider) {
      case "openrouter":
        result = await validateOpenRouter(apiKey);
        break;
      case "deepseek":
        result = await validateDeepSeek(apiKey);
        break;
      case "xai":
        result = await validateXAI(apiKey);
        break;
      case "nvidia":
        result = await validateNvidia(apiKey);
        break;
      case "openai":
        result = await validateOpenAI(apiKey);
        break;
      case "anthropic":
        result = await validateAnthropic(apiKey);
        break;
      default:
        result = {
          success: false,
          message: "Unknown provider",
          latency: 0,
        };
    }

    result.latency = Math.round(performance.now() - startTime);
    return result;
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        message: "Request timeout",
        latency,
        details: { error: "API request timed out after 10s" },
      };
    }

    return {
      success: false,
      message: "Validation error",
      latency,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

async function validateOpenRouter(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Integration Platform",
        },
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          modelCount,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed - check your API key" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

async function validateDeepSeek(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://api.deepseek.com/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          modelCount,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

async function validateXAI(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://api.x.ai/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          modelCount,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

async function validateNvidia(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://integrate.api.nvidia.com/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          modelCount,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

async function validateOpenAI(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          modelCount,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

async function validateAnthropic(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetchWithTimeout(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
      },
      VALIDATION_TIMEOUT
    );

    if (response.ok || response.status === 400) {
      return {
        success: true,
        message: "Key validated",
        latency: 0,
        details: {
          models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
        },
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid API key",
        latency: 0,
        details: { error: "Authentication failed" },
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}`,
      latency: 0,
      details: { error: await response.text().catch(() => "Unknown error") },
    };
  } catch (error) {
    throw error;
  }
}

export async function validateAllKeys(keys: Record<string, string>): Promise<Record<string, ValidationResult>> {
  const results: Record<string, ValidationResult> = {};

  const validationPromises = Object.entries(keys).map(async ([provider, apiKey]) => {
    if (!apiKey) return;
    
    const providerKey = provider.replace(/_API_KEY$/, "").toLowerCase();
    const result = await validateApiKey(providerKey, apiKey);
    results[provider] = result;
  });

  await Promise.allSettled(validationPromises);

  return results;
}

export function getProviderStatus(validation?: ValidationResult): {
  status: "online" | "offline" | "degraded" | "unknown";
  color: string;
  icon: string;
} {
  if (!validation) {
    return { status: "unknown", color: "gray", icon: "●" };
  }

  if (validation.success) {
    if (validation.latency && validation.latency > 2000) {
      return { status: "degraded", color: "yellow", icon: "◐" };
    }
    return { status: "online", color: "green", icon: "●" };
  }

  return { status: "offline", color: "red", icon: "●" };
}

export interface ChatCompletionRequest {
  provider: string;
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
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
  request: ChatCompletionRequest,
  apiKey: string
): Promise<ChatCompletionResponse> {
  const startTime = performance.now();

  try {
    const endpoint = getProviderEndpoint(request.provider);
    
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(request.provider === "openrouter" && {
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Integration Platform",
          }),
          ...(request.provider === "anthropic" && {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          }),
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens ?? 1024,
          stream: false,
        }),
      },
      30000
    );

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
      };
    }

    const data = await response.json();
    
    let responseText = "";
    if (data.choices && data.choices[0]) {
      responseText = data.choices[0].message?.content || data.choices[0].text || "";
    } else if (data.content && Array.isArray(data.content)) {
      responseText = data.content[0]?.text || "";
    }

    return {
      success: true,
      response: responseText,
      latency,
      usage: data.usage,
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      latency,
    };
  }
}

function getProviderEndpoint(provider: string): string {
  const endpoints: Record<string, string> = {
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    deepseek: "https://api.deepseek.com/v1/chat/completions",
    xai: "https://api.x.ai/v1/chat/completions",
    nvidia: "https://integrate.api.nvidia.com/v1/chat/completions",
    openai: "https://api.openai.com/v1/chat/completions",
    anthropic: "https://api.anthropic.com/v1/messages",
  };

  return endpoints[provider] || endpoints.openrouter;
}
