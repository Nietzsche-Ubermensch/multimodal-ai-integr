import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MagnifyingGlass,
  Cpu,
  CurrencyDollar,
  Lightning,
  Code,
  Eye,
  ChatText,
  Brain,
  Gauge
} from "@phosphor-icons/react";
import { UNIFIED_MODEL_CATALOG, type Model } from "@/data/models";

const PROVIDER_COLORS: Record<Model["provider"], string> = {
  xai: "bg-black text-white",
  deepseek: "bg-blue-600 text-white",
  anthropic: "bg-orange-500 text-white",
  huggingface: "bg-yellow-500 text-black",
  openrouter: "bg-purple-600 text-white",
  openai: "bg-green-600 text-white",
  nvidia: "bg-emerald-600 text-white",
};

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  reasoning: <Brain size={16} />,
  code: <Code size={16} />,
  vision: <Eye size={16} />,
  chat: <ChatText size={16} />,
  embedding: <Cpu size={16} />,
};

export function ModelExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "context">("name");

  const filteredModels = useMemo(() => {
    let models = [...UNIFIED_MODEL_CATALOG];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.description.toLowerCase().includes(term) ||
          m.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    if (selectedProvider !== "all") {
      models = models.filter((m) => m.provider === selectedProvider);
    }

    if (selectedType !== "all") {
      models = models.filter((m) => m.modelType === selectedType);
    }

    models.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cost") return a.inputCostPer1M - b.inputCostPer1M;
      if (sortBy === "context") return b.contextWindow - a.contextWindow;
      return 0;
    });

    return models;
  }, [searchTerm, selectedProvider, selectedType, sortBy]);

  const providers = Array.from(new Set(UNIFIED_MODEL_CATALOG.map((m) => m.provider)));
  const types = Array.from(new Set(UNIFIED_MODEL_CATALOG.map((m) => m.modelType)));

  return (
    <div className="space-y-6">
      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Model Explorer</h2>
            <p className="text-lg text-muted-foreground">
              {filteredModels.length} models from {providers.length} providers
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <MagnifyingGlass 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="cost">Cost (Low to High)</SelectItem>
                <SelectItem value="context">Context (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <Card 
              key={model.id} 
              className="hover:shadow-lg transition-all hover:scale-[1.02] border-border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base leading-tight">
                    {model.name}
                  </CardTitle>
                  <Badge 
                    className={`${PROVIDER_COLORS[model.provider]} shrink-0 ml-2`}
                  >
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {model.id}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {model.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {model.contextWindow.toLocaleString()} tokens
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CurrencyDollar size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      ${model.inputCostPer1M.toFixed(2)} / ${model.outputCostPer1M.toFixed(2)} per 1M
                    </span>
                  </div>

                  {model.supportsStreaming && (
                    <div className="flex items-center gap-2 text-sm">
                      <Lightning size={16} className="text-success shrink-0" />
                      <span className="text-success">Streaming support</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {model.capabilities.slice(0, 3).map((cap) => (
                    <Badge 
                      key={cap.name} 
                      variant="outline" 
                      className="text-xs gap-1"
                    >
                      {CAPABILITY_ICONS[cap.name]}
                      {cap.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {model.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs bg-muted px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button className="w-full gap-2" variant="outline" size="sm">
                  <Gauge size={16} />
                  Test Model
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No models found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedProvider("all");
                setSelectedType("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
