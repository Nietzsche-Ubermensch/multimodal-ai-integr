// Model Card Component with Language Flags and Benchmark Display

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Code,
  ChatCircle,
  Eye,
  Lightning,
  Database,
  Globe,
  Cloud,
  DownloadSimple,
  Play,
  Info,
  Star,
  Sparkle,
  ChartBar,
  Terminal,
  CurrencyDollar,
} from '@phosphor-icons/react';
import { 
  AIModel, 
  LANGUAGE_FLAGS, 
  PROVIDER_COLORS, 
  CAPABILITY_COLORS,
  ModelCapabilityType,
  DeploymentMethod 
} from './types';

interface ModelCardProps {
  model: AIModel;
  onSelectModel: (model: AIModel) => void;
  onChatWithModel: (model: AIModel) => void;
}

const CAPABILITY_ICONS: Record<ModelCapabilityType, React.ReactNode> = {
  text: <ChatCircle size={14} />,
  reasoning: <Brain size={14} />,
  code: <Code size={14} />,
  multilingual: <Globe size={14} />,
  vision: <Eye size={14} />,
  embedding: <Database size={14} />,
};

const DEPLOYMENT_ICONS: Record<DeploymentMethod, React.ReactNode> = {
  api: <Cloud size={14} />,
  ollama: <Terminal size={14} />,
  download: <DownloadSimple size={14} />,
  'supabase-ai': <Lightning size={14} />,
  'edge-function': <Lightning size={14} />,
};

export function ModelCard({ model, onSelectModel, onChatWithModel }: ModelCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const maxContext = 200000; // For progress bar normalization
  const contextPercent = Math.min((model.contextWindow / maxContext) * 100, 100);

  const providerColor = PROVIDER_COLORS[model.provider] || 'bg-gray-500';

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Language Flag */}
              <span className="text-2xl" title={model.languageOptimization}>
                {model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}
              </span>
              
              {/* Model Name */}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {model.name}
                  {model.isNew && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                      <Sparkle size={10} className="mr-1" weight="fill" />
                      NEW
                    </Badge>
                  )}
                  {model.featured && (
                    <Star size={16} weight="fill" className="text-amber-500" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {model.providerDisplayName} • {model.parameters || 'N/A'}
                </CardDescription>
              </div>
            </div>

            {/* Provider Badge */}
            <Badge className={`${providerColor} text-white text-xs`}>
              {model.provider}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {model.description}
          </p>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-1.5">
            {model.capabilities
              .filter(c => c.supported)
              .map(cap => (
                <Badge
                  key={cap.type}
                  variant="outline"
                  className={`text-xs gap-1 ${CAPABILITY_COLORS[cap.type]} bg-opacity-10 border-opacity-30`}
                >
                  {CAPABILITY_ICONS[cap.type]}
                  {cap.type}
                </Badge>
              ))}
          </div>

          {/* Context Window */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Context Window</span>
              <span className="font-mono font-medium">
                {model.contextWindow >= 1000 
                  ? `${(model.contextWindow / 1000).toFixed(0)}K` 
                  : model.contextWindow}
              </span>
            </div>
            <Progress value={contextPercent} className="h-1.5" />
          </div>

          {/* Deployment Options */}
          <div className="flex flex-wrap gap-1">
            {model.deploymentOptions
              .filter(d => d.available)
              .map(dep => (
                <Badge
                  key={dep.method}
                  variant="secondary"
                  className="text-xs gap-1"
                >
                  {DEPLOYMENT_ICONS[dep.method]}
                  {dep.method}
                </Badge>
              ))}
          </div>

          {/* Pricing */}
          {(model.inputCostPer1M !== undefined || model.freeTier) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CurrencyDollar size={12} />
                Pricing
              </span>
              {model.freeTier ? (
                <Badge className="bg-green-500 text-white">FREE</Badge>
              ) : (
                <span className="font-mono">
                  ${model.inputCostPer1M?.toFixed(2)} / ${model.outputCostPer1M?.toFixed(2)} per 1M
                </span>
              )}
            </div>
          )}

          {/* Top Benchmark (if available) */}
          {model.benchmarks.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <ChartBar size={12} />
                {model.benchmarks[0].benchmark}
              </span>
              <Badge variant="outline" className="font-mono">
                {model.benchmarks[0].score.toFixed(1)}%
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setShowDetails(true)}
            >
              <Info size={14} />
              Details
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onChatWithModel(model)}
            >
              <Play size={14} />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <ModelDetailsDialog
        model={model}
        open={showDetails}
        onOpenChange={setShowDetails}
        onChatWithModel={onChatWithModel}
      />
    </>
  );
}

interface ModelDetailsDialogProps {
  model: AIModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatWithModel: (model: AIModel) => void;
}

function ModelDetailsDialog({ model, open, onOpenChange, onChatWithModel }: ModelDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}</span>
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                {model.name}
                {model.isNew && (
                  <Badge className="bg-green-500 text-white">NEW</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {model.providerDisplayName} • {model.parameters} • {model.version && `v${model.version}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{model.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Context Window</h4>
                <p className="text-2xl font-bold font-mono">
                  {model.contextWindow >= 1000 
                    ? `${(model.contextWindow / 1000).toFixed(0)}K` 
                    : model.contextWindow}
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Parameters</h4>
                <p className="text-2xl font-bold font-mono">{model.parameters || 'N/A'}</p>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {model.capabilities.map(cap => (
                  <Badge
                    key={cap.type}
                    variant={cap.supported ? 'default' : 'secondary'}
                    className={`gap-1 ${cap.supported ? CAPABILITY_COLORS[cap.type] : 'opacity-50'}`}
                  >
                    {CAPABILITY_ICONS[cap.type]}
                    {cap.type}
                    {cap.description && (
                      <span className="text-xs opacity-70">- {cap.description}</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">License</h4>
              <Badge variant="outline">{model.license}</Badge>
              {model.licenseUrl && (
                <a 
                  href={model.licenseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary ml-2 hover:underline"
                >
                  View License →
                </a>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Pricing</h4>
              {model.freeTier ? (
                <Badge className="bg-green-500 text-white">FREE TIER AVAILABLE</Badge>
              ) : model.inputCostPer1M !== undefined ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">Input:</span>{' '}
                  <span className="font-mono">${model.inputCostPer1M?.toFixed(2)}/1M tokens</span>
                  {' • '}
                  <span className="text-muted-foreground">Output:</span>{' '}
                  <span className="font-mono">${model.outputCostPer1M?.toFixed(2)}/1M tokens</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Contact provider for pricing</span>
              )}
            </div>
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-4">
            {model.benchmarks.length > 0 ? (
              <div className="space-y-3">
                {model.benchmarks.map((benchmark, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{benchmark.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {benchmark.benchmark} • {benchmark.category}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg font-mono">
                        {benchmark.score.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={benchmark.score} className="h-2" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartBar size={48} className="mx-auto mb-2 opacity-50" />
                <p>No benchmark data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="deployment" className="mt-4">
            <div className="space-y-3">
              {model.deploymentOptions.map((dep, idx) => (
                <Card key={idx} className={`p-4 ${!dep.available && 'opacity-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {DEPLOYMENT_ICONS[dep.method]}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{dep.method.replace('-', ' ')}</h4>
                        {dep.endpoint && (
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                            {dep.endpoint}
                          </p>
                        )}
                        {dep.instructions && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {dep.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={dep.available ? 'default' : 'secondary'}>
                      {dep.available ? 'Available' : 'Coming Soon'}
                    </Badge>
                  </div>
                  {dep.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => window.open(dep.downloadUrl, '_blank')}
                    >
                      <DownloadSimple size={14} className="mr-2" />
                      Download Model
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Language Optimization</h4>
                <Badge className="text-lg gap-2 px-4 py-2">
                  <span className="text-xl">{model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}</span>
                  {model.languageOptimization.charAt(0).toUpperCase() + model.languageOptimization.slice(1)}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Supported Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {model.supportedLanguages.map(lang => (
                    <Badge key={lang} variant="outline" className="font-mono uppercase">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            onClick={() => {
              onChatWithModel(model);
              onOpenChange(false);
            }}
          >
            <Play size={16} className="mr-2" />
            Chat with {model.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
