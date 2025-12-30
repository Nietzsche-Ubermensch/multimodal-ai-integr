// wrappers/index.ts
// Unified AI Gateway + RPC Wrapper for Supabase Edge Functions
//
// Routes:
//   GET  /wrappers/health        → Health check (public)
//   POST /wrappers/ai/:provider  → AI gateway (openrouter, deepseek, xai, anthropic, gemini)
//   POST /wrappers/rpc/:fn       → Postgres RPC wrapper
//
// Required secrets (set via `supabase secrets set`):
//   OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.46.2";

// Types
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

// Allowed RPC functions (security allowlist)
const ALLOWED_RPC_FUNCTIONS = new Set([
  "get_user_profile",
  "search_items",
  "get_public_data",
  // Add your allowed RPC functions here
]);

// Allowed origins for CORS (set to your domains)
const ALLOWED_ORIGINS = new Set([
  "https://ccjdctnmgrweserduxhi.supabase.co",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:19006", // Expo web
]);

// Cached Supabase clients
const clients: { anon: SupabaseClient | null; service: SupabaseClient | null } = {
  anon: null,
  service: null,
};

// Utilities
const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    ...init,
  });

const error = (status: number, message: string, details?: unknown) =>
  json({ ok: false, error: { message, details } }, { status });

const ok = (data: unknown, init: ResponseInit = {}) => json({ ok: true, data }, init);

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
  if (provider === "anthropic") {
    return {
      model: body.model,
      messages: body.messages ?? [],
      max_tokens: body.max_tokens ?? 1024,
      temperature: body.temperature,
    };
  }
  if (provider === "gemini") {
    const contents = (body.messages ?? []).map((m) => ({
      // Gemini: assistant→model, system→user (Gemini doesn't support system role directly)
      role: m.role === "assistant" ? "model" : m.role === "system" ? "user" : m.role,
      parts: Array.isArray(m.content)
        ? m.content
        : [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
    }));
    return { contents, generationConfig: { temperature: body.temperature, maxOutputTokens: body.max_tokens } };
  }
  // OpenAI-compatible providers (openrouter, deepseek, xai, perplexity)
  return {
    model: body.model,
    messages: body.messages ?? [],
    stream: body.stream ?? false,
    temperature: body.temperature,
    max_tokens: body.max_tokens,
    top_p: body.top_p,
  };
}

async function callProvider(provider: Provider, body: AiBody, signal?: AbortSignal): Promise<Response> {
  const key = getProviderKey(provider);
  if (!key) return error(400, `Missing API key for provider '${provider}'. Set ${PROVIDER_ENV[provider]} secret.`);

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

// Validate JWT token with Supabase Auth
async function validateAuth(req: Request): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !/^bearer\s+.+/i.test(auth)) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const token = auth.replace(/^bearer\s+/i, "");

  try {
    const supabase = getSupabase(true); // Use anon client for auth validation
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return { valid: false, error: authError?.message ?? "Invalid token" };
    }

    return { valid: true, userId: user.id };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health: public
    if (path === "/wrappers/health" && req.method === "GET") {
      return ok({ status: "ok", time: new Date().toISOString() });
    }

    // AI Gateway
    if (path.startsWith("/wrappers/ai/") && req.method === "POST") {
      const auth = await validateAuth(req);
      if (!auth.valid) return error(401, auth.error ?? "Unauthorized");

      const provider = path.split("/")[3];
      if (!provider || !VALID_PROVIDERS.has(provider)) {
        return error(400, `Unsupported provider. Valid: ${[...VALID_PROVIDERS].join(", ")}`);
      }

      const body = (await req.json().catch(() => ({}))) as AiBody;
      if (!body.model) {
        return error(400, "Missing required field: model");
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000); // 55s (under Edge Function limit)

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
          headers: { "Content-Type": "text/event-stream", ...corsHeaders },
          status: resp.status,
        });
      }

      // Clone response before consuming body to handle parse failures
      const clonedResp = resp.clone();
      const data = await resp.json().catch(async () => ({ raw: await clonedResp.text() }));

      return json({ ok: resp.ok, status: resp.status, data }, { status: resp.status, headers: corsHeaders });
    }

    // RPC Wrapper
    if (path.startsWith("/wrappers/rpc/") && req.method === "POST") {
      const auth = await validateAuth(req);
      if (!auth.valid) return error(401, auth.error ?? "Unauthorized");

      const fn = decodeURIComponent(path.split("/")[3] || "");
      if (!fn) return error(400, "Function name required");

      // Security: Check allowlist
      if (!ALLOWED_RPC_FUNCTIONS.has(fn)) {
        return error(403, `RPC function '${fn}' not allowed. Contact admin to allowlist.`);
      }

      const body = (await req.json().catch(() => ({}))) as RpcBody;
      const useAnon = body.useAnon === true;
      const args = body.args ?? {};

      const supabase = getSupabase(useAnon);
      const rpcRes = await supabase.rpc(fn, args);

      if (rpcRes.error) {
        return error(400, rpcRes.error.message, rpcRes.error);
      }
      return ok({ result: rpcRes.data }, { headers: corsHeaders });
    }

    return error(404, "Not found");
  } catch (e) {
    return error(500, "Unhandled error", { message: (e as Error)?.message });
  }
});
