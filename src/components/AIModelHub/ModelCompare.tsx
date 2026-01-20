// Model Comparison Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  X,
  Plus,
  ChartBar,
  Brain,
  Code,
  Globe,
  Eye,
  ChatCircle,
  Database,
  Lightning,
  Check,
  Minus,
} from '@phosphor-icons/react';
import { AIModel, LANGUAGE_FLAGS, PROVIDER_COLORS, ModelCapabilityType } from './types';

interface ModelCompareProps {
  models: AIModel[];
  onRemoveModel: (modelId: string) => void;
  onAddModel: () => void;
  onClear: () => void;
}

const CAPABILITY_ICONS: Record<ModelCapabilityType, React.ReactNode> = {
  text: <ChatCircle size={16} />,
  reasoning: <Brain size={16} />,
  code: <Code size={16} />,
  multilingual: <Globe size={16} />,
  vision: <Eye size={16} />,
  embedding: <Database size={16} />,
};

export function ModelCompare({ models, onRemoveModel, onAddModel, onClear }: ModelCompareProps) {
  const maxContext = Math.max(...models.map(m => m.contextWindow), 200000);
  
  // Get all unique capabilities
  const allCapabilities = Array.from(
    new Set(models.flatMap(m => m.capabilities.filter(c => c.supported).map(c => c.type)))
  );

  // Get all unique benchmarks
  const allBenchmarks = Array.from(
    new Set(models.flatMap(m => m.benchmarks.map(b => b.benchmark)))
  );

  if (models.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBar size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Compare Models</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add up to 3 models to compare their specifications, capabilities, and benchmarks side by side.
          </p>
          <Button onClick={onAddModel} className="gap-2">
            <Plus size={16} />
            Add Model
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ChartBar size={24} />
          Model Comparison
          <Badge variant="outline">{models.length}/3</Badge>
        </h2>
        <div className="flex gap-2">
          {models.length < 3 && (
            <Button variant="outline" size="sm" onClick={onAddModel} className="gap-1">
              <Plus size={14} />
              Add
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-muted-foreground">
            <X size={14} />
            Clear
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-border w-40"></th>
              {models.map(model => (
                <th key={model.id} className="p-3 border-b border-border min-w-[200px]">
                  <Card className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onRemoveModel(model.id)}
                    >
                      <X size={12} />
                    </Button>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl block mb-2">
                        {model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}
                      </span>
                      <h3 className="font-semibold">{model.name}</h3>
                      <Badge className={`${PROVIDER_COLORS[model.provider]} text-white mt-2`}>
                        {model.provider}
                      </Badge>
                    </CardContent>
                  </Card>
                </th>
              ))}
              {models.length < 3 && (
                <th className="p-3 border-b border-border min-w-[200px]">
                  <Card 
                    className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={onAddModel}
                  >
                    <CardContent className="p-4 text-center text-muted-foreground">
                      <Plus size={32} className="mx-auto mb-2" />
                      <span className="text-sm">Add Model</span>
                    </CardContent>
                  </Card>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Parameters */}
            <tr className="bg-muted/30">
              <td className="p-3 border-b border-border font-medium">Parameters</td>
              {models.map(model => (
                <td key={model.id} className="p-3 border-b border-border text-center">
                  <Badge variant="outline" className="font-mono">
                    {model.parameters || 'N/A'}
                  </Badge>
                </td>
              ))}
              {models.length < 3 && <td className="border-b border-border"></td>}
            </tr>

            {/* Context Window */}
            <tr>
              <td className="p-3 border-b border-border font-medium">Context Window</td>
              {models.map(model => (
                <td key={model.id} className="p-3 border-b border-border">
                  <div className="space-y-1">
                    <div className="text-center font-mono text-sm">
                      {(model.contextWindow / 1000).toFixed(0)}K tokens
                    </div>
                    <Progress 
                      value={(model.contextWindow / maxContext) * 100} 
                      className="h-2"
                    />
                  </div>
                </td>
              ))}
              {models.length < 3 && <td className="border-b border-border"></td>}
            </tr>

            {/* Language */}
            <tr className="bg-muted/30">
              <td className="p-3 border-b border-border font-medium">Language</td>
              {models.map(model => (
                <td key={model.id} className="p-3 border-b border-border text-center">
                  <span className="text-lg mr-2">
                    {model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}
                  </span>
                  <span className="capitalize">{model.languageOptimization}</span>
                </td>
              ))}
              {models.length < 3 && <td className="border-b border-border"></td>}
            </tr>

            {/* Pricing */}
            <tr>
              <td className="p-3 border-b border-border font-medium">Pricing (per 1M)</td>
              {models.map(model => (
                <td key={model.id} className="p-3 border-b border-border text-center">
                  {model.freeTier ? (
                    <Badge className="bg-green-500 text-white">FREE</Badge>
                  ) : (
                    <div className="font-mono text-sm">
                      <div>In: ${model.inputCostPer1M?.toFixed(2) || 'N/A'}</div>
                      <div>Out: ${model.outputCostPer1M?.toFixed(2) || 'N/A'}</div>
                    </div>
                  )}
                </td>
              ))}
              {models.length < 3 && <td className="border-b border-border"></td>}
            </tr>

            {/* Capabilities */}
            {allCapabilities.map(cap => (
              <tr key={cap} className="bg-muted/30">
                <td className="p-3 border-b border-border font-medium">
                  <div className="flex items-center gap-2">
                    {CAPABILITY_ICONS[cap]}
                    <span className="capitalize">{cap}</span>
                  </div>
                </td>
                {models.map(model => {
                  const hasCapability = model.capabilities.some(
                    c => c.type === cap && c.supported
                  );
                  return (
                    <td key={model.id} className="p-3 border-b border-border text-center">
                      {hasCapability ? (
                        <Check size={20} className="mx-auto text-green-500" weight="bold" />
                      ) : (
                        <Minus size={20} className="mx-auto text-muted-foreground" />
                      )}
                    </td>
                  );
                })}
                {models.length < 3 && <td className="border-b border-border"></td>}
              </tr>
            ))}

            {/* Benchmarks */}
            {allBenchmarks.slice(0, 5).map(benchmark => (
              <tr key={benchmark}>
                <td className="p-3 border-b border-border font-medium text-sm">
                  {benchmark}
                </td>
                {models.map(model => {
                  const bench = model.benchmarks.find(b => b.benchmark === benchmark);
                  const maxScore = Math.max(
                    ...models
                      .map(m => m.benchmarks.find(b => b.benchmark === benchmark)?.score || 0)
                  );
                  const isHighest = bench?.score === maxScore && maxScore > 0;
                  
                  return (
                    <td key={model.id} className="p-3 border-b border-border text-center">
                      {bench ? (
                        <Badge 
                          variant={isHighest ? 'default' : 'outline'}
                          className={isHighest ? 'bg-green-500' : ''}
                        >
                          {bench.score.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
                {models.length < 3 && <td className="border-b border-border"></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
