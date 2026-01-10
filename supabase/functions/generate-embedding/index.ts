import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.28.0";

/**
 * Supabase Edge Function: generate-embedding
 * 
 * Generates embeddings using Together AI's BGE-large model via OpenRouter
 * and stores them in Supabase's pgvector database.
 * 
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
 * - OPENROUTER_API_KEY: Your OpenRouter API key (with Together AI connected)
 * 
 * Request Body:
 * {
 *   "content": "Text content to embed and store"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "id": "uuid-of-stored-record"
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Setup Clients
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Use OpenRouter (which will route to Together AI via your BYOK)
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENROUTER_API_KEY"),
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": Deno.env.get("SUPABASE_URL") ?? "https://your-app.com",
        "X-Title": "Supabase Vector App",
      },
    });

    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required and must be a string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Generate Embedding using Together AI model via OpenRouter
    // BGE-Large is excellent and uses 1024 dimensions
    const embeddingResp = await openai.embeddings.create({
      model: "together/baai/bge-large-en-v1.5",
      input: content,
    });

    const embedding = embeddingResp.data[0].embedding;

    // 3. Insert into Database
    const { data, error } = await supabase
      .from("rag_vectors")
      .insert({
        content: content,
        embedding: embedding,
        embedding_model: "together/baai/bge-large-en-v1.5",
        metadata: {
          source: "edge-function",
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
