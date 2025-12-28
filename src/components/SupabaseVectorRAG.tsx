import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/sep
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@
import { 
  MagnifyingGlass,
  ArrowsClockwise,
  FileText,
  XCircle,
  Brain
import { 
import { Cod
interface Document
  content: stri
  embedding?: numb
}
interface S
}
interface 
  name: stri
  provi
}
const EMBEDDING_MODELS: Embeddi
  { id: "text-embedding-3-small", name: "Ope
];

  const [supabaseKey
  
  const [documentT
  const [topK, setTopK] = useSta
  
  const [searchResult
 

  const generateEmbedding = async (text: 
    
 

          "Authorization":
        body:
          input
      });
      if (!response
      }
 

        method: "POST",
          "Content-Type": "application/json",
        },
      });
  

      return await response.json();

  };
  const storeDocument = async () => {
  
    }
    if (!supabaseUrl || !supabaseKey) {
      return;

      toast.error("Please enter OpenAI API key");
  
    setProcessing(true);

  
      
      const response = await fetch(`${supabaseUrl}/r
        headers: {

          "Prefer": "return=representation"
        body: JSON.stringify({
    
          metadata: {
            timestamp: new Date().toISOString(),
          }
      });
      if (!response.ok) {
      }
      cons
      
      setDocumentText("")
    } catch (error) {
    } fina
      });

  const semanticSearch = 
      toast.error("Please enter a search query");
      }

      return;


      const queryEmbedding = await generateEmbedding(searchQuery, selectedModel);
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        },
          match_count: topK
      });

      }
      const results = await response.json();
      

      return await response.json();
    }

    if (!supabaseUrl || !supabaseKey) return;
  };

  const storeDocument = async () => {
      });
      if (response.ok) {
        setDo
    }

    if (!supabaseUrl || !supabaseKey) {
    loadDocuments();
      return;


        <CardHeader>
      toast.error("Please enter OpenAI API key");
            <
     

    setProcessing(true);
        </CardHeade

         
                  <Dat
                </CardTitle>
      
                  Post
              </CardContent>

        headers: {
                  <Sparkle size={16} />
                </CardTitle>
              <CardContent>
          "Prefer": "return=representation"
          
        body: JSON.stringify({
              <CardHeader classN
                  <M
                </CardTitle>
          metadata: {
                  Find relevant docu
            timestamp: new Date().toISOString(),

          }
          
      });

      if (!response.ok) {
              </CardContent>
      }

          <div className="space-y-4">
            
      
                <Input
                  placehol
                  onCh
    } catch (error) {
              <div className="space-y-2">
               
                  placehold
                  onChange={(e) => setSupaba
     
    

                  placeholder="sk-..."
                  onChange={(e
      toast.error("Please enter a search query");
             
    }

                  <SelectContent>
                      <SelectItem key={model.id} value={mo
      return;
     

                    {se

         
      const queryEmbedding = await generateEmbedding(searchQuery, selectedModel);

        <CardHeader>
          <CardDescript
        headers: {
        <CardContent className="space-y-4">
          "apikey": supabaseKey,
              placeholder="Enter text to store wit
        },
              className="font-
            <div className="flex items-cen
              {documentText.length > 0 && selec
          match_count: topK
          
      });

              <div classN
                  {progress < 40 ? "Generating embedding..." : p
      }

      const results = await response.json();
          <Button 
      
          >
              <>
                Processing...
    } finally {
                <CloudArro
    }
    

              <div className="flex it
    if (!supabaseUrl || !supabaseKey) return;

         
                  <Card key={doc.id} className="p-3">
                  
                        {new Dat
                      <Badge variant="outline" cla
         
      });

      if (response.ok) {
      </Card>
      <Card>
       
            Find rele
        </CardHeader>
    }
    

                val
    loadDocuments();
              <Button onClick={se

                  <MagnifyingGlass size={16} />

          
          <div className="grid 
            
        <CardHeader>
                </SelectTrigger>
                  {[3, 5, 10, 20].map((k) => (
                      {k} results
                  
              </S
              <CardTitle>Supabase pgvector RAG</CardTitle>
              <CardDescription>
                Real-time document storage with semantic search using vector embeddings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database size={16} />
                  pgvector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL vector extension for similarity search
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkle size={16} />
                  Live Embeddings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate embeddings on-the-fly with OpenAI/HuggingFace
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MagnifyingGlass size={16} />
                  Semantic Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find relevant documents by meaning, not keywords
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightning size={16} />
                  Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Instant indexing and sub-second search responses
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Supabase Project URL</Label>
                <Input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Supabase Service Key</Label>
                <Input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Embedding Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMBEDDING_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - ${model.cost_per_1m.toFixed(3)}/1M
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelInfo && (
                  <p className="text-xs text-muted-foreground">
                    {selectedModelInfo.dimensions} dimensions • {selectedModelInfo.provider}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Storage</CardTitle>
          <CardDescription>
            Store documents with automatic embedding generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Content</Label>
            <Textarea
              placeholder="Enter text to store with vector embedding..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{documentText.length} characters</span>
              {documentText.length > 0 && selectedModelInfo && (
                <span>
                  Est. cost: ${((documentText.length / 1000000) * selectedModelInfo.cost_per_1m).toFixed(6)}
                </span>
              )}
            </div>
          </div>

          {processing && progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress < 40 ? "Generating embedding..." : progress < 80 ? "Storing in Supabase..." : "Complete!"}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={storeDocument} 
            disabled={processing || !documentText.trim()}
            className="w-full"
          >
            {processing ? (
              <>
                <ArrowsClockwise className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              <>
                <CloudArrowUp className="mr-2" size={16} />
                Store Document with Embedding
              </>
            )}
          </Button>

          {documents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recent Documents ({documents.length})</Label>
                <Button variant="ghost" size="sm" onClick={loadDocuments}>
                  <ArrowsClockwise size={14} />
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-3">
                    <p className="text-sm line-clamp-2">{doc.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {doc.content.length} chars
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semantic Search</CardTitle>
          <CardDescription>
            Find relevant documents using vector similarity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Query</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && semanticSearch()}
              />
              <Button onClick={semanticSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? (
                  <ArrowsClockwise className="animate-spin" size={16} />
                ) : (
                  <MagnifyingGlass size={16} />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Top K Results</Label>
              <Select value={topK.toString()} onValueChange={(v) => setTopK(Number(v))}>

                  <SelectValue />

                <SelectContent>
                  {[3, 5, 10, 20].map((k) => (
                    <SelectItem key={k} value={k.toString()}>
                      {k} results
                    </SelectItem>

                </SelectContent>

            </div>

            <div className="space-y-2">
              <Label>Similarity Threshold</Label>
              <Select value={similarityThreshold.toString()} onValueChange={(v) => setSimilarityThreshold(Number(v))}>

                  <SelectValue />

                <SelectContent>
                  {[0.5, 0.6, 0.7, 0.8, 0.9].map((t) => (
                    <SelectItem key={t} value={t.toString()}>
                      {t} ({t === 0.5 ? "Relaxed" : t === 0.7 ? "Balanced" : t === 0.9 ? "Strict" : "Custom"})
                    </SelectItem>

                </SelectContent>

            </div>



            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Search Results</Label>

              </div>
              <div className="space-y-3">
                {searchResults.map((result, idx) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">#{idx + 1}</Badge>
                          <Badge 
                            className={
                              result.similarity > 0.9 ? "bg-green-500/20 text-green-400" :
                              result.similarity > 0.8 ? "bg-blue-500/20 text-blue-400" :
                              "bg-yellow-500/20 text-yellow-400"

                          >
                            {(result.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-sm">{result.content}</p>
                        {result.metadata && (
                          <div className="flex items-center gap-2 mt-2">
                            {result.metadata.source && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.source}
                              </Badge>

                            {result.metadata.timestamp && (
                              <Badge variant="outline" className="text-xs">
                                {new Date(result.metadata.timestamp).toLocaleString()}

                            )}

                        )}

                    </div>

                ))}

            </div>



            <Alert>
              <AlertDescription>
                No results found. Try adjusting the similarity threshold or using different search terms.
              </AlertDescription>
            </Alert>

        </CardContent>
      </Card>


        <CardHeader>

          <CardDescription>

          </CardDescription>

        <CardContent>

            language="sql"
            code={`-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vectors table

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  embedding VECTOR(${selectedModelInfo?.dimensions || 1536}),

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster similarity search
CREATE INDEX ON rag_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Semantic search function

  query_embedding VECTOR(${selectedModelInfo?.dimensions || 1536}),

  match_count INT DEFAULT 5

RETURNS TABLE (

  content TEXT,

  similarity FLOAT,

)

AS $$

    id,

    metadata,

    created_at

  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;


-- Enable Row Level Security (optional)
ALTER TABLE rag_vectors ENABLE ROW LEVEL SECURITY;

-- Policy for public access (adjust as needed)
CREATE POLICY "Allow public read access" ON rag_vectors
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON rag_vectors

          />

      </Card>

  );

