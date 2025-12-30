// wrappers/index.ts
// Unified AI Gateway + RPC Wrapper for Supabase Edge Functions
//
// Routes:
//   GET  /wrappers/health        → Health check (public)
//   GET  /wrappers/health/deps   → Upstream availability check (auth required)
//   POST /wrappers/ai/:provider  → AI gateway (openrouter, deepseek, xai, anthropic, gemini, perplexity)
//   POST /wrappers/rpc/:fn       → Postgres RPC wrapper
//
// Required secrets (set via `supabase secrets set`):
//   OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.46.2";

// =============================================================================
// CONFIGURATION - Edit these allowlists for your deployment
// =============================================================================

// Allowed RPC functions (security allowlist)
const ALLOWED_RPC_FUNCTIONS = new Set([
  // Vector search
  "match_documents",
  "search_rag_vectors",
  // User profile
  "get_user_profile",
  "get_profile",
  // Public data
  "search_items",
  "get_public_data",
]);

// RPC functions that can use anon key (public read-only)
const ANON_ALLOWED_RPC = new Set([
  "get_public_data",
  "search_items",
]);

// Allowed origins for CORS
const ALLOWED_ORIGINS = new Set([
  "https://ccjdctnmgrweserduxhi.supabase.co",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:19006", // Expo web
]);

// Provider-specific configuration with token caps
const PROVIDER_LIMITS: Record<string, { maxTokens: number; defaultTokens: number; blockedModels?: Set<string> }> = {
  openrouter: { maxTokens: 16384, defaultTokens: 2048 },
  deepseek: { maxTokens: 8192, defaultTokens: 2048 },
  xai: { maxTokens: 8192, defaultTokens: 2048 },
  anthropic: { maxTokens: 8192, defaultTokens: 1024 },
  gemini: { maxTokens: 8192, defaultTokens: 2048 },
  perplexity: { maxTokens: 4096, defaultTokens: 1024 },
};

// Rate limiting config (requests per window)
const RATE_LIMIT = {
  windowMs: 60_000,      // 1 minute
  maxRequests: 60,       // 60 req/min for authenticated users
  maxAnonRequests: 30,   // 30 req/min for anonymous (IP-based)
};

// =============================================================================
// TYPES
// =============================================================================

interface RpcBody {
  args?: Record<string, unknown>;
  useAnon?: boolean;
}

interface AiBody {
  model: string;
  messages?: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>;
  input?: unknown;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  [key: string]: unknown;
}

type Provider = "openrouter" | "deepseek" | "xai" | "anthropic" | "gemini" | "perplexity";

// =============================================================================
// RATE LIMITING (In-memory, resets on cold start)
// =============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, isAnonymous: boolean): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const maxReqs = isAnonymous ? RATE_LIMIT.maxAnonRequests : RATE_LIMIT.maxRequests;
  const key = isAnonymous ? `anon:${identifier}` : `user:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: maxReqs - 1, resetIn: RATE_LIMIT.windowMs };
  }

  if (entry.count >= maxReqs) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxReqs - entry.count, resetIn: entry.resetAt - now };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) rateLimitStore.delete(key);
  }
}, 60_000);

// =============================================================================
// SUPABASE CLIENTS (Cached)
// =============================================================================

const clients: { anon: SupabaseClient | null; service: SupabaseClient | null } = {
  anon: null,
  service: null,
};

const getSupabase = (useAnon = false): SupabaseClient => {
  const key = useAnon ? "anon" : "service";
  if (!clients[key]) {
    const url = Deno.env.get("SUPABASE_URL");
    const apiKey = useAnon
      ? Deno.env.get("SUPABASE_ANON_KEY")
      : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !apiKey) throw new Error("Missing Supabase credentials");
    clients[key] = createClient(url, apiKey, { auth: { persistSession: false } });
  }
  return clients[key]!;
};

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

const PROVIDER_CFG: Record<Provider, { base: string; authHeader: (key: string) => [string, string]; path: string }> = {
  openrouter: {
    base: "https://openrouter.ai/api",
    path: "/v1/chat/completions",
    authHeader: (k) => ["Authorization", `Bearer ${k}`],
  },
  deepseek: {
    base: "https://api.deepseek.com",
    path: "/chat/completions",
    authHeader: (k) => ["Authorization", `Bearer ${k}`],
  },
  xai: {
    base: "https://api.x.ai",
    path: "/v1/chat/completions",
    authHeader: (k) => ["Authorization", `Bearer ${k}`],
  },
  anthropic: {
    base: "https://api.anthropic.com",
    path: "/v1/messages",
    authHeader: (k) => ["x-api-key", k],
  },
  gemini: {
    base: "https://generativelanguage.googleapis.com",
    path: "/v1beta/models/UNSET:generateContent",
    authHeader: (k) => ["x-goog-api-key", k],
  },
  perplexity: {
    base: "https://api.perplexity.ai",
    path: "/chat/completions",
    authHeader: (k) => ["Authorization", `Bearer ${k}`],
  },
};

const PROVIDER_ENV: Record<Provider, string> = {
  openrouter: "OPENROUTER_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  xai: "XAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
};

const VALID_PROVIDERS = new Set(Object.keys(PROVIDER_CFG));

// =============================================================================
// UTILITIES
// =============================================================================

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    ...init,
  });

const error = (status: number, message: string, details?: unknown, headers?: Record<string, string>) =>
  json({ ok: false, error: { message, details } }, { status, headers });

const ok = (data: unknown, init: ResponseInit = {}) => json({ ok: true, data }, init);

function getProviderKey(provider: Provider): string | undefined {
  const envName = PROVIDER_ENV[provider];
  return Deno.env.get(envName);
}

function providerUrl(provider: Provider, model?: string) {
  const cfg = PROVIDER_CFG[provider];
  if (provider === "gemini") {
    const m = model ?? "gemini-1.5-flash";
    return `${cfg.base}/v1beta/models/${encodeURIComponent(m)}:generateContent`;
  }
  return `${cfg.base}${cfg.path}`;
}

function normalizePayload(provider: Provider, body: AiBody): Record<string, unknown> {
  const limits = PROVIDER_LIMITS[provider] || { maxTokens: 4096, defaultTokens: 1024 };
  const maxTokens = Math.min(body.max_tokens ?? limits.defaultTokens, limits.maxTokens);

  if (provider === "anthropic") {
    return {
      model: body.model,
      messages: body.messages ?? [],
      max_tokens: maxTokens,
      temperature: body.temperature,
    };
  }
  if (provider === "gemini") {
    const contents = (body.messages ?? []).map((m) => ({
      role: m.role === "assistant" ? "model" : m.role === "system" ? "user" : m.role,
      parts: Array.isArray(m.content)
        ? m.content
        : [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
    }));
    return { contents, generationConfig: { temperature: body.temperature, maxOutputTokens: maxTokens } };
  }
  // OpenAI-compatible providers (openrouter, deepseek, xai, perplexity)
  return {
    model: body.model,
    messages: body.messages ?? [],
    stream: body.stream ?? false,
    temperature: body.temperature,
    max_tokens: maxTokens,
    top_p: body.top_p,
  };
}

async function callProvider(provider: Provider, body: AiBody, signal?: AbortSignal): Promise<Response> {
  const key = getProviderKey(provider);
  if (!key) return error(400, `Missing API key for provider '${provider}'. Set ${PROVIDER_ENV[provider]} secret.`);

  // Check for blocked models
  const limits = PROVIDER_LIMITS[provider];
  if (limits?.blockedModels?.has(body.model)) {
    return error(403, `Model '${body.model}' is not allowed for provider '${provider}'.`);
  }

  const url = providerUrl(provider, body.model);
  const cfg = PROVIDER_CFG[provider];
  const [hName, hVal] = cfg.authHeader(key);

  const payload = normalizePayload(provider, body);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers[hName] = hVal;
  if (provider === "anthropic") headers["anthropic-version"] = "2023-06-01";

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });
}

// =============================================================================
// AUTH VALIDATION
// =============================================================================

interface AuthResult {
  valid: boolean;
  userId?: string;
  isAnonymous: boolean;
  clientIp?: string;
  error?: string;
}

function getClientIp(req: Request): string {
  // Supabase Edge Functions provide client IP in headers
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

async function validateAuth(req: Request): Promise<AuthResult> {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const clientIp = getClientIp(req);

  if (!auth || !/^bearer\s+.+/i.test(auth)) {
    return { valid: false, isAnonymous: false, clientIp, error: "Missing or invalid Authorization header" };
  }

  const token = auth.replace(/^bearer\s+/i, "");

  try {
    const supabase = getSupabase(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      // Token didn't resolve to a user - might be anon key
      // Check if it's the anon key by verifying it's a valid JWT with "anon" role
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "anon" && payload.ref) {
          // Valid anon key - allow with IP-based rate limiting
          return { valid: true, isAnonymous: true, clientIp };
        }
      } catch {
        // Not a valid JWT
      }
      return { valid: false, isAnonymous: false, clientIp, error: authError?.message ?? "Invalid token" };
    }

    return { valid: true, userId: user.id, isAnonymous: false, clientIp };
  } catch (e) {
    return { valid: false, isAnonymous: false, clientIp, error: (e as Error).message };
  }
}

// =============================================================================
// CORS
// =============================================================================

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Request-Id",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Reset",
  };
}

// =============================================================================
// HEALTH CHECK UTILITIES
// =============================================================================

async function checkProviderHealth(provider: Provider): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const key = getProviderKey(provider);
  if (!key) return { ok: false, error: "No API key configured" };

  const start = Date.now();
  try {
    // Quick HEAD/GET to base URL (most providers don't have dedicated health endpoints)
    const cfg = PROVIDER_CFG[provider];
    const resp = await fetch(cfg.base, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return { ok: resp.status < 500, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: (e as Error).message };
  }
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health: public
    if (path === "/wrappers/health" && req.method === "GET") {
      return ok({ status: "ok", time: new Date().toISOString(), version: "2.0.0" }, { headers: corsHeaders });
    }

    // Health/deps: check upstream availability (auth required)
    if (path === "/wrappers/health/deps" && req.method === "GET") {
      const auth = await validateAuth(req);
      if (!auth.valid) return error(401, auth.error ?? "Unauthorized", undefined, corsHeaders);

      const checks = await Promise.all(
        (Object.keys(PROVIDER_CFG) as Provider[]).map(async (p) => ({
          provider: p,
          ...(await checkProviderHealth(p)),
        }))
      );
      return ok({ providers: checks, time: new Date().toISOString() }, { headers: corsHeaders });
    }

    // AI Gateway
    if (path.startsWith("/wrappers/ai/") && req.method === "POST") {
      const auth = await validateAuth(req);
      if (!auth.valid) return error(401, auth.error ?? "Unauthorized", undefined, corsHeaders);

      // Rate limiting - use userId for authenticated, clientIp for anonymous
      const rateLimitId = auth.isAnonymous ? auth.clientIp! : auth.userId!;
      const rateCheck = checkRateLimit(rateLimitId, auth.isAnonymous);
      const rateLimitHeaders = {
        ...corsHeaders,
        "X-RateLimit-Remaining": String(rateCheck.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetIn / 1000)),
        "X-RateLimit-Type": auth.isAnonymous ? "anonymous" : "authenticated",
      };

      if (!rateCheck.allowed) {
        return error(429, "Rate limit exceeded. Try again later.", { resetIn: rateCheck.resetIn }, rateLimitHeaders);
      }

      const provider = path.split("/")[3];
      if (!provider || !VALID_PROVIDERS.has(provider)) {
        return error(400, `Unsupported provider. Valid: ${[...VALID_PROVIDERS].join(", ")}`, undefined, rateLimitHeaders);
      }

      const body = (await req.json().catch(() => ({}))) as AiBody;
      if (!body.model) {
        return error(400, "Missing required field: model", undefined, rateLimitHeaders);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      const resp = await callProvider(provider as Provider, body, controller.signal).catch((e) => {
        if (e.name === "AbortError") {
          return new Response(JSON.stringify({ ok: false, error: "Request timeout" }), { status: 504 });
        }
        return new Response(JSON.stringify({ ok: false, error: e?.message || "provider_error" }), { status: 502 });
      });
      clearTimeout(timeout);

      const contentType = resp.headers.get("content-type") || "";

      // Handle streaming response
      if (body.stream && contentType.includes("text/event-stream")) {
        return new Response(resp.body, {
          headers: { "Content-Type": "text/event-stream", ...rateLimitHeaders },
          status: resp.status,
        });
      }

      // Clone response before consuming body
      const clonedResp = resp.clone();
      const data = await resp.json().catch(async () => ({ raw: await clonedResp.text() }));

      return json(
        { ok: resp.ok, status: resp.status, data, provider, model: body.model },
        { status: resp.status, headers: rateLimitHeaders }
      );
    }

    // RPC Wrapper
    if (path.startsWith("/wrappers/rpc/") && req.method === "POST") {
      const auth = await validateAuth(req);
      if (!auth.valid) return error(401, auth.error ?? "Unauthorized", undefined, corsHeaders);

      const fn = decodeURIComponent(path.split("/")[3] || "");
      if (!fn) return error(400, "Function name required", undefined, corsHeaders);

      // Security: Check allowlist
      if (!ALLOWED_RPC_FUNCTIONS.has(fn)) {
        return error(403, `RPC function '${fn}' not allowed. Contact admin to allowlist.`, undefined, corsHeaders);
      }

      const body = (await req.json().catch(() => ({}))) as RpcBody;

      // Only allow anon for specific functions
      const useAnon = body.useAnon === true && ANON_ALLOWED_RPC.has(fn);
      const args = body.args ?? {};

      const supabase = getSupabase(useAnon);
      const rpcRes = await supabase.rpc(fn, args);

      if (rpcRes.error) {
        return error(400, rpcRes.error.message, rpcRes.error, corsHeaders);
      }
      return ok({ result: rpcRes.data }, { headers: corsHeaders });
    }

    return error(404, "Not found", undefined, corsHeaders);
  } catch (e) {
    return error(500, "Unhandled error", { message: (e as Error)?.message }, corsHeaders);
  }
});
