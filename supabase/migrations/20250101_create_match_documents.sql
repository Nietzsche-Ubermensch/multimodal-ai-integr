-- Create match_documents function as an alias to search_rag_vectors
-- This provides backward compatibility for frontend code expecting match_documents

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delegate to the existing search_rag_vectors function
  RETURN QUERY
  SELECT * FROM search_rag_vectors(query_embedding, match_threshold, match_count);
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION public.match_documents IS 'Alias for search_rag_vectors function. Performs vector similarity search on document embeddings.';
