# LiteLLM Integration Guide
## Seamless Backend Integration with OpenRouter and Multi-Provider AI Systems

### Executive Summary
This guide provides a comprehensive integration strategy for implementing BerriAI/litellm into your existing backend infrastructure, with specific focus on OpenRouter connectivity, endpoint coordination, and production-grade deployment patterns.

---

## 1. Repository Setup & Configuration

### Clone and Install LiteLLM
```bash
# Clone the official repository
git clone https://github.com/BerriAI/litellm.git
cd litellm

# Install core dependencies
pip install litellm

# For advanced features (proxy server, database logging, caching)
pip install 'litellm[proxy]'
pip install 'litellm[extra]'

# Verify installation
litellm --version
```

### Environment Variable Management
LiteLLM automatically reads API keys from environment variables following provider-specific patterns:

```bash
# Core AI Providers
export OPENROUTER_API_KEY="sk-or-v1-..."
export ANTHROPIC_API_KEY="sk-ant-api03-..."
export OPENAI_API_KEY="sk-proj-..."
export DEEPSEEK_API_KEY="sk-..."
export XAI_API_KEY="xai-..."
export NVIDIA_NIM_API_KEY="nvapi-..."

# Optional: Redis for caching
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export REDIS_PASSWORD="your-password"

# Optional: Database for logging
export DATABASE_URL="postgresql://user:pass@host:5432/litellm"

# LiteLLM Proxy Configuration
export LITELLM_MASTER_KEY="sk-1234"  # For authentication
export LITELLM_SALT_KEY="your-salt-key"  # For key encryption
```

### Dependency Installation
```txt
# requirements.txt
litellm>=1.30.0
redis>=5.0.0
python-dotenv>=1.0.0
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
pydantic>=2.6.0
sqlalchemy>=2.0.25
psycopg2-binary>=2.9.9
```

---

## 2. Integration Architecture

### Architectural Overview
```
┌─────────────────┐
│   Frontend      │
│  (React/Next)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │
│  /api/chat      │
│  /api/embed     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   LiteLLM Integration Layer     │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Request Router          │  │
│  │  - Model selection       │  │
│  │  - Load balancing        │  │
│  │  - Fallback handling     │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │  LiteLLM Core            │  │
│  │  - completion()          │  │
│  │  - embedding()           │  │
│  │  - Retry logic           │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │  Caching Layer (Redis)   │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
    ┌────▼─────┐
    │          │
┌───▼───┐  ┌──▼─────┐  ┌──▼──────┐
│OpenR. │  │DeepSeek│  │ xAI     │
│       │  │        │  │ Grok    │
└───────┘  └────────┘  └─────────┘
```

### Core Integration Module
```python
# litellm_integration.py
from litellm import completion, embedding, Router
from typing import List, Dict, Optional
import os
import logging
from redis import Redis

logger = logging.getLogger(__name__)

class LiteLLMIntegration:
    """
    Central integration layer for all AI provider calls using LiteLLM.
    Handles routing, caching, retries, and fallback logic.
    """
    
    def __init__(
        self,
        enable_caching: bool = True,
        redis_host: str = "localhost",
        redis_port: int = 6379
    ):
        self.enable_caching = enable_caching
        
        # Initialize Redis for caching
        if enable_caching:
            self.cache = Redis(
                host=redis_host,
                port=redis_port,
                db=0,
                decode_responses=True
            )
            
        # Configure LiteLLM router with fallback models
        self.router = Router(
            model_list=[
                {
                    "model_name": "primary-chat",
                    "litellm_params": {
                        "model": "openrouter/anthropic/claude-3.5-sonnet",
                        "api_key": os.getenv("OPENROUTER_API_KEY"),
                    },
                    "tpm": 100000,  # tokens per minute limit
                    "rpm": 1000,    # requests per minute limit
                },
                {
                    "model_name": "fallback-chat",
                    "litellm_params": {
                        "model": "deepseek/deepseek-chat",
                        "api_key": os.getenv("DEEPSEEK_API_KEY"),
                    },
                    "tpm": 200000,
                    "rpm": 2000,
                },
                {
                    "model_name": "reasoning-chat",
                    "litellm_params": {
                        "model": "deepseek/deepseek-reasoner",
                        "api_key": os.getenv("DEEPSEEK_API_KEY"),
                    },
                },
            ],
            fallbacks=[
                {"primary-chat": ["fallback-chat"]}
            ],
            set_verbose=True,
        )
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "primary-chat",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
        **kwargs
    ):
        """
        Unified chat completion interface with automatic fallback.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier (maps to router config)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Enable streaming responses
            
        Returns:
            Completion response object or generator (if streaming)
        """
        try:
            # Check cache first (if enabled and not streaming)
            if self.enable_caching and not stream:
                cache_key = self._generate_cache_key(messages, model, temperature)
                cached = self.cache.get(cache_key)
                if cached:
                    logger.info(f"Cache hit for key: {cache_key}")
                    return cached
            
            # Make LiteLLM request through router
            response = self.router.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )
            
            # Cache response (if enabled and not streaming)
            if self.enable_caching and not stream:
                self.cache.setex(
                    cache_key,
                    3600,  # 1 hour TTL
                    response.choices[0].message.content
                )
            
            return response
            
        except Exception as e:
            logger.error(f"LiteLLM completion error: {str(e)}")
            raise
    
    def generate_embeddings(
        self,
        input_text: str | List[str],
        model: str = "text-embedding-3-large"
    ):
        """
        Generate embeddings using OpenAI or other providers.
        
        Args:
            input_text: Text or list of texts to embed
            model: Embedding model to use
            
        Returns:
            List of embedding vectors
        """
        try:
            response = embedding(
                model=f"openai/{model}",
                input=input_text
            )
            return response.data
            
        except Exception as e:
            logger.error(f"Embedding generation error: {str(e)}")
            raise
    
    def _generate_cache_key(
        self,
        messages: List[Dict],
        model: str,
        temperature: float
    ) -> str:
        """Generate deterministic cache key from request parameters."""
        import hashlib
        import json
        
        key_data = {
            "messages": messages,
            "model": model,
            "temperature": temperature
        }
        key_string = json.dumps(key_data, sort_keys=True)
        return f"litellm:cache:{hashlib.sha256(key_string.encode()).hexdigest()}"
    
    def health_check(self) -> Dict[str, bool]:
        """Check connectivity to all configured providers."""
        health_status = {}
        
        providers = {
            "openrouter": "openrouter/openai/gpt-3.5-turbo",
            "deepseek": "deepseek/deepseek-chat",
            "anthropic": "anthropic/claude-3-haiku-20240307",
            "xai": "xai/grok-beta"
        }
        
        for provider_name, model in providers.items():
            try:
                response = completion(
                    model=model,
                    messages=[{"role": "user", "content": "test"}],
                    max_tokens=5,
                    timeout=5
                )
                health_status[provider_name] = True
            except Exception as e:
                logger.warning(f"Provider {provider_name} health check failed: {e}")
                health_status[provider_name] = False
        
        return health_status


# Singleton instance
litellm_integration = LiteLLMIntegration()
```

---

## 3. OpenRouter Connectivity

### Direct Integration Pattern
```python
# openrouter_integration.py
from litellm import completion
import os

def openrouter_completion(
    messages: list,
    model: str = "anthropic/claude-3.5-sonnet",
    **kwargs
):
    """
    Direct OpenRouter integration using LiteLLM.
    OpenRouter provides access to 100+ models through a single API.
    """
    response = completion(
        model=f"openrouter/{model}",
        messages=messages,
        api_key=os.getenv("OPENROUTER_API_KEY"),
        api_base="https://openrouter.ai/api/v1",
        extra_headers={
            "HTTP-Referer": os.getenv("APP_URL", "https://localhost"),
            "X-Title": "LiteLLM Integration Platform"
        },
        **kwargs
    )
    
    return response

# Example usage with multiple OpenRouter models
def test_openrouter_models():
    """Test various models available through OpenRouter."""
    
    models_to_test = [
        "anthropic/claude-3.5-sonnet",
        "openai/gpt-4-turbo",
        "meta-llama/llama-3.1-70b-instruct",
        "google/gemini-pro-1.5",
        "deepseek/deepseek-chat"
    ]
    
    test_prompt = [{"role": "user", "content": "Explain quantum computing in one sentence."}]
    
    results = {}
    for model in models_to_test:
        try:
            response = openrouter_completion(
                messages=test_prompt,
                model=model,
                max_tokens=100
            )
            results[model] = {
                "success": True,
                "response": response.choices[0].message.content,
                "tokens": response.usage.total_tokens
            }
        except Exception as e:
            results[model] = {
                "success": False,
                "error": str(e)
            }
    
    return results
```

### Authentication & Request Routing
```python
# Secure authentication middleware
from fastapi import FastAPI, HTTPException, Depends, Header
from typing import Optional
import secrets

app = FastAPI()

# Store API keys securely (use database in production)
VALID_API_KEYS = {
    os.getenv("LITELLM_MASTER_KEY"): "admin",
    # Add more keys from database
}

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Verify API key for incoming requests."""
    if not x_api_key or x_api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    return VALID_API_KEYS[x_api_key]

@app.post("/v1/chat/completions")
async def proxy_chat_completion(
    request: dict,
    user: str = Depends(verify_api_key)
):
    """
    OpenAI-compatible proxy endpoint that routes through LiteLLM.
    Handles authentication and routes to OpenRouter or other providers.
    """
    try:
        # Extract request parameters
        messages = request.get("messages", [])
        model = request.get("model", "primary-chat")
        temperature = request.get("temperature", 0.7)
        max_tokens = request.get("max_tokens", 2048)
        stream = request.get("stream", False)
        
        # Use LiteLLM integration
        response = litellm_integration.chat_completion(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=stream
        )
        
        # Log usage for billing
        logger.info(f"User {user} used {response.usage.total_tokens} tokens")
        
        return response
        
    except Exception as e:
        logger.error(f"Proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 4. Endpoint Coordination

### Unified API Design
```python
# api_endpoints.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal

app = FastAPI(title="LiteLLM Integration API")

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = "primary-chat"
    messages: List[ChatMessage]
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = False
    provider: Optional[str] = None  # Force specific provider

class EmbeddingRequest(BaseModel):
    input: str | List[str]
    model: str = "text-embedding-3-large"

@app.post("/api/chat")
async def chat_endpoint(request: ChatCompletionRequest):
    """
    Unified chat endpoint supporting all providers through LiteLLM.
    Compatible with OpenAI SDK clients.
    """
    try:
        # Override model if provider specified
        if request.provider:
            model_map = {
                "openrouter": "openrouter/anthropic/claude-3.5-sonnet",
                "deepseek": "deepseek/deepseek-chat",
                "anthropic": "anthropic/claude-3-5-sonnet-20241022",
                "xai": "xai/grok-beta",
                "openai": "openai/gpt-4-turbo"
            }
            model = model_map.get(request.provider, request.model)
        else:
            model = request.model
        
        response = litellm_integration.chat_completion(
            messages=[msg.dict() for msg in request.messages],
            model=model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=request.stream
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/embeddings")
async def embedding_endpoint(request: EmbeddingRequest):
    """Generate embeddings for semantic search and RAG applications."""
    try:
        response = litellm_integration.generate_embeddings(
            input_text=request.input,
            model=request.model
        )
        return {"data": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_endpoint():
    """Check health of all AI providers."""
    health = litellm_integration.health_check()
    all_healthy = all(health.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "providers": health
    }

@app.get("/api/models")
async def models_endpoint():
    """List all available models across providers."""
    return {
        "data": [
            {
                "id": "primary-chat",
                "provider": "openrouter",
                "underlying_model": "anthropic/claude-3.5-sonnet"
            },
            {
                "id": "fallback-chat",
                "provider": "deepseek",
                "underlying_model": "deepseek-chat"
            },
            {
                "id": "reasoning-chat",
                "provider": "deepseek",
                "underlying_model": "deepseek-reasoner"
            }
        ]
    }
```

### Error Handling & Retries
```python
# error_handling.py
from litellm import completion
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
def robust_completion(messages: list, model: str, **kwargs):
    """
    Completion with automatic retry logic for transient failures.
    """
    try:
        response = completion(
            model=model,
            messages=messages,
            **kwargs
        )
        return response
        
    except Exception as e:
        logger.warning(f"Attempt failed: {str(e)}")
        raise

def multi_provider_fallback(messages: list, **kwargs):
    """
    Try multiple providers in sequence until one succeeds.
    """
    providers = [
        "openrouter/anthropic/claude-3.5-sonnet",
        "deepseek/deepseek-chat",
        "openai/gpt-4-turbo",
        "xai/grok-beta"
    ]
    
    last_error = None
    
    for provider in providers:
        try:
            logger.info(f"Attempting provider: {provider}")
            response = completion(
                model=provider,
                messages=messages,
                timeout=30,
                **kwargs
            )
            logger.info(f"Success with provider: {provider}")
            return response
            
        except Exception as e:
            logger.warning(f"Provider {provider} failed: {str(e)}")
            last_error = e
            continue
    
    raise Exception(f"All providers failed. Last error: {last_error}")
```

---

## 5. Performance & Reliability

### Caching Strategy
```python
# caching.py
from redis import Redis
from typing import Optional
import hashlib
import json

class SmartCache:
    """Intelligent caching layer for AI responses."""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour
    
    def get(self, messages: list, model: str, temperature: float) -> Optional[str]:
        """Get cached response if available."""
        key = self._generate_key(messages, model, temperature)
        cached = self.redis.get(key)
        
        if cached:
            # Update access count for analytics
            self.redis.incr(f"{key}:hits")
            return cached
        
        return None
    
    def set(self, messages: list, model: str, temperature: float, response: str):
        """Cache a response with smart TTL based on content."""
        key = self._generate_key(messages, model, temperature)
        
        # Longer TTL for deterministic responses (low temperature)
        ttl = self.default_ttl * (2 if temperature < 0.3 else 1)
        
        self.redis.setex(key, ttl, response)
        self.redis.set(f"{key}:hits", 0, ex=ttl)
    
    def _generate_key(self, messages: list, model: str, temperature: float) -> str:
        """Generate deterministic cache key."""
        data = {
            "messages": messages,
            "model": model,
            "temperature": round(temperature, 2)
        }
        key_str = json.dumps(data, sort_keys=True)
        hash_key = hashlib.sha256(key_str.encode()).hexdigest()
        return f"litellm:response:{hash_key}"
    
    def get_stats(self) -> dict:
        """Get cache performance statistics."""
        # Scan for all cache keys (use with caution in production)
        keys = self.redis.keys("litellm:response:*:hits")
        total_hits = sum(int(self.redis.get(key) or 0) for key in keys)
        
        return {
            "total_cached_items": len(keys),
            "total_cache_hits": total_hits,
            "estimated_cost_saved": total_hits * 0.001  # Rough estimate
        }
```

### Load Balancing & Rate Limiting
```python
# load_balancing.py
from litellm import Router
import os

# Advanced router configuration with load balancing
advanced_router = Router(
    model_list=[
        # Primary: OpenRouter with Claude 3.5 Sonnet
        {
            "model_name": "primary",
            "litellm_params": {
                "model": "openrouter/anthropic/claude-3.5-sonnet",
                "api_key": os.getenv("OPENROUTER_API_KEY"),
            },
            "tpm": 80000,  # Conservative limit for primary
            "rpm": 800,
        },
        # Secondary: DeepSeek Chat (high throughput)
        {
            "model_name": "secondary",
            "litellm_params": {
                "model": "deepseek/deepseek-chat",
                "api_key": os.getenv("DEEPSEEK_API_KEY"),
            },
            "tpm": 200000,
            "rpm": 2000,
        },
        # Tertiary: xAI Grok (web search capability)
        {
            "model_name": "tertiary",
            "litellm_params": {
                "model": "xai/grok-beta",
                "api_key": os.getenv("XAI_API_KEY"),
            },
            "tpm": 50000,
            "rpm": 500,
        },
    ],
    
    # Fallback chain: primary → secondary → tertiary
    fallbacks=[
        {"primary": ["secondary", "tertiary"]},
        {"secondary": ["tertiary"]}
    ],
    
    # Timeout settings
    timeout=60,  # 60 second timeout
    
    # Retry configuration
    num_retries=2,
    
    # Routing strategy
    routing_strategy="latency-based-routing",  # Route to fastest provider
    
    # Enable verbose logging
    set_verbose=True
)
```

### Monitoring & Observability
```python
# monitoring.py
from prometheus_client import Counter, Histogram, Gauge
import time
import logging

# Metrics
request_count = Counter(
    'litellm_requests_total',
    'Total number of requests',
    ['model', 'provider', 'status']
)

request_duration = Histogram(
    'litellm_request_duration_seconds',
    'Request duration in seconds',
    ['model', 'provider']
)

token_usage = Counter(
    'litellm_tokens_total',
    'Total tokens consumed',
    ['model', 'provider', 'type']  # type: prompt or completion
)

cache_hit_rate = Gauge(
    'litellm_cache_hit_rate',
    'Cache hit rate percentage'
)

class MonitoredLiteLLM:
    """Wrapper around LiteLLM with monitoring."""
    
    def __init__(self, integration):
        self.integration = integration
        self.logger = logging.getLogger(__name__)
    
    def completion(self, messages, model, **kwargs):
        """Monitored completion with metrics collection."""
        start_time = time.time()
        provider = self._extract_provider(model)
        
        try:
            response = self.integration.chat_completion(
                messages=messages,
                model=model,
                **kwargs
            )
            
            # Record success metrics
            duration = time.time() - start_time
            request_count.labels(
                model=model,
                provider=provider,
                status='success'
            ).inc()
            
            request_duration.labels(
                model=model,
                provider=provider
            ).observe(duration)
            
            # Token usage
            if hasattr(response, 'usage'):
                token_usage.labels(
                    model=model,
                    provider=provider,
                    type='prompt'
                ).inc(response.usage.prompt_tokens)
                
                token_usage.labels(
                    model=model,
                    provider=provider,
                    type='completion'
                ).inc(response.usage.completion_tokens)
            
            return response
            
        except Exception as e:
            request_count.labels(
                model=model,
                provider=provider,
                status='error'
            ).inc()
            self.logger.error(f"Request failed: {str(e)}")
            raise
    
    def _extract_provider(self, model: str) -> str:
        """Extract provider name from model string."""
        if '/' in model:
            return model.split('/')[0]
        return 'unknown'
```

---

## 6. Security Considerations

### Secret Management
```python
# secrets_manager.py
from typing import Optional
import os
import boto3
from functools import lru_cache

class SecretsManager:
    """Secure secret management for API keys."""
    
    def __init__(self, provider: str = "env"):
        """
        Initialize secrets manager.
        
        Args:
            provider: 'env', 'aws', 'gcp', or 'azure'
        """
        self.provider = provider
        if provider == "aws":
            self.client = boto3.client('secretsmanager')
    
    @lru_cache(maxsize=128)
    def get_secret(self, key: str) -> Optional[str]:
        """
        Get secret value with caching.
        
        Args:
            key: Secret key name
            
        Returns:
            Secret value or None
        """
        if self.provider == "env":
            return os.getenv(key)
        
        elif self.provider == "aws":
            try:
                response = self.client.get_secret_value(SecretId=key)
                return response['SecretString']
            except Exception as e:
                logging.error(f"Failed to fetch secret {key}: {e}")
                return None
        
        return None
    
    def rotate_key(self, key_name: str, new_value: str):
        """Rotate API key (production feature)."""
        if self.provider == "aws":
            self.client.put_secret_value(
                SecretId=key_name,
                SecretString=new_value
            )
            # Invalidate cache
            self.get_secret.cache_clear()

# Usage
secrets = SecretsManager(provider="env")
openrouter_key = secrets.get_secret("OPENROUTER_API_KEY")
```

### Input Validation & Sanitization
```python
# validation.py
from pydantic import BaseModel, validator, Field
from typing import List, Literal
import re

class SecureChatRequest(BaseModel):
    """Validated chat request with security checks."""
    
    messages: List[dict] = Field(..., min_items=1, max_items=50)
    model: str = Field(..., regex=r'^[a-zA-Z0-9\-/]+$')
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(2048, ge=1, le=8192)
    
    @validator('messages')
    def validate_messages(cls, v):
        """Validate message structure and content."""
        for msg in v:
            # Check required fields
            if 'role' not in msg or 'content' not in msg:
                raise ValueError("Messages must have 'role' and 'content'")
            
            # Validate role
            if msg['role'] not in ['system', 'user', 'assistant']:
                raise ValueError(f"Invalid role: {msg['role']}")
            
            # Content length check (prevent abuse)
            if len(msg['content']) > 50000:
                raise ValueError("Message content too long (max 50k chars)")
            
            # Detect potential prompt injection
            if cls._detect_injection(msg['content']):
                raise ValueError("Potential prompt injection detected")
        
        return v
    
    @staticmethod
    def _detect_injection(content: str) -> bool:
        """Basic prompt injection detection."""
        injection_patterns = [
            r'ignore previous instructions',
            r'system:',
            r'</system>',
            r'<script>',
            r'{{.*}}',  # Template injection
        ]
        
        content_lower = content.lower()
        return any(re.search(pattern, content_lower) for pattern in injection_patterns)

# Usage in endpoint
@app.post("/api/secure/chat")
async def secure_chat(request: SecureChatRequest):
    """Endpoint with input validation."""
    response = litellm_integration.chat_completion(
        messages=request.messages,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    return response
```

### Rate Limiting
```python
# rate_limiting.py
from redis import Redis
from fastapi import HTTPException, Request
from typing import Optional
import time

class RateLimiter:
    """Redis-based rate limiter for API endpoints."""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
    
    def check_rate_limit(
        self,
        identifier: str,
        max_requests: int = 100,
        window_seconds: int = 3600
    ) -> bool:
        """
        Check if request should be rate limited.
        
        Args:
            identifier: User ID, API key, or IP address
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            
        Returns:
            True if within limit, False if rate limited
        """
        key = f"ratelimit:{identifier}"
        current = int(time.time())
        window_start = current - window_seconds
        
        # Remove old entries
        self.redis.zremrangebyscore(key, 0, window_start)
        
        # Count requests in current window
        request_count = self.redis.zcard(key)
        
        if request_count >= max_requests:
            return False
        
        # Add current request
        self.redis.zadd(key, {current: current})
        self.redis.expire(key, window_seconds)
        
        return True
    
    def get_remaining(self, identifier: str, max_requests: int = 100) -> int:
        """Get remaining requests in current window."""
        key = f"ratelimit:{identifier}"
        current_count = self.redis.zcard(key)
        return max(0, max_requests - current_count)

# FastAPI middleware
from fastapi import Request

async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to incoming requests."""
    # Get identifier (API key, user ID, or IP)
    api_key = request.headers.get("X-API-Key")
    identifier = api_key or request.client.host
    
    limiter = RateLimiter(redis_client)
    
    if not limiter.check_rate_limit(identifier, max_requests=100, window_seconds=3600):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again later.",
            headers={"Retry-After": "3600"}
        )
    
    response = await call_next(request)
    
    # Add rate limit headers
    remaining = limiter.get_remaining(identifier)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Limit"] = "100"
    
    return response
```

---

## 7. Production Deployment

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  litellm-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-integration
spec:
  replicas: 3
  selector:
    matchLabels:
      app: litellm-integration
  template:
    metadata:
      labels:
        app: litellm-integration
    spec:
      containers:
      - name: litellm-api
        image: your-registry/litellm-integration:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-provider-secrets
              key: openrouter-key
        - name: REDIS_HOST
          value: redis-service
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: litellm-service
spec:
  selector:
    app: litellm-integration
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

### AWS Lambda Deployment (Serverless)
```python
# lambda_handler.py
import json
import os
from litellm import completion

def lambda_handler(event, context):
    """
    AWS Lambda handler for serverless LiteLLM deployment.
    Optimized for cold start performance.
    """
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        messages = body.get('messages', [])
        model = body.get('model', 'openrouter/anthropic/claude-3.5-sonnet')
        
        # Make completion request
        response = completion(
            model=model,
            messages=messages,
            max_tokens=body.get('max_tokens', 2048),
            temperature=body.get('temperature', 0.7)
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'response': response.choices[0].message.content,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

---

## 8. Testing & Validation

### Integration Tests
```python
# test_litellm_integration.py
import pytest
from litellm_integration import LiteLLMIntegration

@pytest.fixture
def integration():
    """Create integration instance for testing."""
    return LiteLLMIntegration(enable_caching=False)

def test_openrouter_completion(integration):
    """Test OpenRouter integration."""
    messages = [{"role": "user", "content": "Say hello"}]
    
    response = integration.chat_completion(
        messages=messages,
        model="openrouter/anthropic/claude-3-haiku",
        max_tokens=20
    )
    
    assert response.choices[0].message.content
    assert response.usage.total_tokens > 0

def test_fallback_mechanism(integration):
    """Test provider fallback."""
    messages = [{"role": "user", "content": "Test"}]
    
    # This should fall back to secondary provider if primary fails
    response = integration.chat_completion(
        messages=messages,
        model="primary-chat",
        max_tokens=10
    )
    
    assert response is not None

def test_embedding_generation(integration):
    """Test embedding generation."""
    embeddings = integration.generate_embeddings(
        input_text="Test embedding",
        model="text-embedding-3-small"
    )
    
    assert len(embeddings) > 0
    assert len(embeddings[0].embedding) == 1536  # Dimension check

def test_health_check(integration):
    """Test provider health checks."""
    health = integration.health_check()
    
    assert isinstance(health, dict)
    assert 'openrouter' in health or 'deepseek' in health

@pytest.mark.asyncio
async def test_concurrent_requests(integration):
    """Test concurrent request handling."""
    import asyncio
    
    messages = [{"role": "user", "content": f"Request {i}"} for i in range(10)]
    
    tasks = [
        integration.chat_completion(
            messages=[msg],
            model="openrouter/openai/gpt-3.5-turbo",
            max_tokens=10
        )
        for msg in messages
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # At least 80% should succeed
    successes = sum(1 for r in results if not isinstance(r, Exception))
    assert successes >= 8
```

---

## Summary

This integration guide provides a production-ready implementation of LiteLLM with OpenRouter and multi-provider AI systems. Key achievements:

✅ **Repository Setup**: Complete installation and dependency management
✅ **Architecture**: Modular, scalable integration layer with caching and routing
✅ **OpenRouter Connectivity**: Secure authentication and request handling
✅ **Endpoint Coordination**: Unified API design with error handling
✅ **Performance**: Caching, load balancing, and monitoring
✅ **Security**: Secret management, input validation, and rate limiting
✅ **Deployment**: Docker, Kubernetes, and serverless options
✅ **Testing**: Comprehensive integration test suite

**Next Steps:**
1. Deploy using Docker Compose for local testing
2. Configure monitoring with Prometheus/Grafana
3. Set up CI/CD pipeline for automated deployments
4. Implement usage-based billing and analytics
5. Add more providers as needed (Google Vertex AI, Azure OpenAI, etc.)
