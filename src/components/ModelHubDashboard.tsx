import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Key,
  Lightning,
  Robot,
  Brain,
  Database,
  Code,
  Sparkle,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  Copy,
  Download,
  FileText,
  CurrencyDollar,
  Clock,
  GridFour,
  CaretRight,
  Warning,
  PencilSimple,
  BookmarkSimple,
  Play,
  Export,
  Coins,
  Article,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { 
  AIProvider, 
  APIKeyConfig, 
  ModelResponse, 
  SessionCosts,
  PromptTemplate,
} from "@/types/modelhub";
import {
  AI_MODELS,
  PROMPT_TEMPLATES,
  validateAPIKey,
  invokeModel,
  runBatchTest,
  calculateCost,
  estimateTokens,
  aggregateSessionCosts,
  exportToMarkdown,
  exportToJSON,
  getModelById,
  getTemplatesByCategory,
} from "@/lib/modelhub-service";

export function ModelHubDashboard() {
  // API Keys State
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, APIKeyConfig | null>>({
    openrouter: null,
    openai: null,
    anthropic: null,
    deepseek: null,
    xai: null,
    google: null,
  });
  const [validatingKey, setValidatingKey] = useState<AIProvider | null>(null);

  // Prompt State
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Responses State
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cost Tracking State
  const [costEntries, setCostEntries] = useState<SessionCosts['entries']>([]);

  // View State
  const [activeTab, setActiveTab] = useState("setup");
  const [comparisonView, setComparisonView] = useState<"list" | "grid">("grid");

  // Computed Values
  const sessionCosts = useMemo(() => aggregateSessionCosts(costEntries), [costEntries]);
  
  const availableModels = useMemo(() => {
    return AI_MODELS.filter(model => {
      const keyConfig = apiKeys[model.provider];
      return keyConfig?.status === 'valid';
    });
  }, [apiKeys]);

  const estimatedCost = useMemo(() => {
    if (!prompt || selectedModels.length === 0) return 0;
    const inputTokens = estimateTokens(prompt + (systemPrompt || ''));
    const estimatedOutputTokens = 500; // Rough estimate
    
    return selectedModels.reduce((total, modelId) => {
      const model = getModelById(modelId);
      if (!model) return total;
      return total + calculateCost(model, {
        input: inputTokens,
        output: estimatedOutputTokens,
        total: inputTokens + estimatedOutputTokens,
      });
    }, 0);
  }, [prompt, systemPrompt, selectedModels]);

  // API Key Management
  const handleKeyChange = useCallback((provider: AIProvider, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        provider,
        keyValue: value,
        status: value ? 'unchecked' : 'invalid',
      },
    }));
  }, []);

  const handleValidateKey = useCallback(async (provider: AIProvider) => {
    const keyConfig = apiKeys[provider];
    if (!keyConfig?.keyValue) {
      toast.error("Please enter an API key first");
      return;
    }

    setValidatingKey(provider);
    setApiKeys(prev => ({
      ...prev,
      [provider]: { ...prev[provider]!, status: 'checking' },
    }));

    try {
      const result = await validateAPIKey(provider, keyConfig.keyValue);
      
      setApiKeys(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider]!,
          status: result.valid ? 'valid' : 'invalid',
          lastValidated: new Date().toISOString(),
        },
      }));

      if (result.valid) {
        toast.success(`${provider} API key validated successfully`);
      } else {
        toast.error(result.error || `Invalid ${provider} API key`);
      }
    } catch (error) {
      setApiKeys(prev => ({
        ...prev,
        [provider]: { ...prev[provider]!, status: 'invalid' },
      }));
      toast.error(`Failed to validate ${provider} key`);
    } finally {
      setValidatingKey(null);
    }
  }, [apiKeys]);

  // Template Handling
  const handleSelectTemplate = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setSystemPrompt(template.systemPrompt || "");
    
    // Initialize variables with defaults
    const vars: Record<string, string> = {};
    template.variables.forEach(v => {
      vars[v.name] = v.defaultValue || "";
    });
    setTemplateVariables(vars);
  }, []);

  const applyTemplate = useCallback(() => {
    if (!selectedTemplate) return;
    
    let filledPrompt = selectedTemplate.userPromptTemplate;
    Object.entries(templateVariables).forEach(([key, value]) => {
      filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    setPrompt(filledPrompt);
    toast.success("Template applied to prompt");
  }, [selectedTemplate, templateVariables]);

  // Model Execution
  const handleRunModels = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (selectedModels.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResponses([]);

    try {
      const keyMap: Record<AIProvider, string> = {
        openrouter: apiKeys.openrouter?.keyValue || '',
        openai: apiKeys.openai?.keyValue || '',
        anthropic: apiKeys.anthropic?.keyValue || '',
        deepseek: apiKeys.deepseek?.keyValue || '',
        xai: apiKeys.xai?.keyValue || '',
        google: apiKeys.google?.keyValue || '',
      };

      const results = await runBatchTest(prompt, systemPrompt || undefined, selectedModels, keyMap);
      
      setResponses(results);
      setProgress(100);

      // Add to cost tracking
      const newCostEntries = results
        .filter(r => r.status === 'success')
        .map(r => ({
          id: r.id,
          model: r.model,
          provider: r.provider,
          tokens: r.tokens,
          cost: r.cost,
          timestamp: r.timestamp,
        }));
      
      setCostEntries(prev => [...prev, ...newCostEntries]);

      const successCount = results.filter(r => r.status === 'success').length;
      toast.success(`Completed ${successCount}/${selectedModels.length} model calls`);
      
      setActiveTab("compare");
    } catch (error) {
      toast.error("Failed to run models");
    } finally {
      setIsRunning(false);
    }
  }, [prompt, systemPrompt, selectedModels, apiKeys]);

  // Export Functions
  const handleExport = useCallback((format: 'markdown' | 'json') => {
    if (responses.length === 0) {
      toast.error("No responses to export");
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'markdown') {
      content = exportToMarkdown(responses, prompt, systemPrompt);
      filename = `model-comparison-${Date.now()}.md`;
      mimeType = 'text/markdown';
    } else {
      content = exportToJSON(responses, prompt, systemPrompt);
      filename = `model-comparison-${Date.now()}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported as ${format.toUpperCase()}`);
  }, [responses, prompt, systemPrompt]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusIcon = (status: APIKeyConfig['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={16} className="text-green-500" weight="fill" />;
      case 'invalid':
        return <XCircle size={16} className="text-red-500" weight="fill" />;
      case 'checking':
        return <ArrowsClockwise size={16} className="animate-spin text-yellow-500" />;
      default:
        return <Key size={16} className="text-muted-foreground" />;
    }
  };

  const getProviderDisplayName = (provider: AIProvider): string => {
    const names: Record<AIProvider, string> = {
      openrouter: 'OpenRouter',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      deepseek: 'DeepSeek',
      xai: 'xAI (Grok)',
      google: 'Google AI',
    };
    return names[provider];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain size={36} weight="duotone" className="text-primary" />
            ModelHub
          </h1>
          <p className="text-muted-foreground">
            Unified AI model testing and comparison platform
          </p>
        </div>
        
        {/* Cost Summary Badge */}
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-4">
            <Coins size={24} className="text-green-500" weight="duotone" />
            <div>
              <p className="text-xs text-muted-foreground">Session Cost</p>
              <p className="text-xl font-bold text-green-500">${sessionCosts.totalCost.toFixed(4)}</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <p className="text-xs text-muted-foreground">Tokens Used</p>
              <p className="text-lg font-semibold">{sessionCosts.totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup" className="gap-2">
            <Key size={16} />
            Setup
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText size={16} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <Play size={16} />
            Test
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GridFour size={16} />
            Compare
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-2">
            <CurrencyDollar size={16} />
            Costs
          </TabsTrigger>
        </TabsList>

        {/* Setup Tab - API Key Management */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                API Key Configuration
              </CardTitle>
              <CardDescription>
                Configure and validate API keys for each AI provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['openrouter', 'openai', 'anthropic', 'deepseek', 'xai'] as AIProvider[]).map(provider => (
                <div key={provider} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-32 flex items-center gap-2">
                    {getStatusIcon(apiKeys[provider]?.status || 'unchecked')}
                    <span className="font-medium">{getProviderDisplayName(provider)}</span>
                  </div>
                  <Input
                    type="password"
                    placeholder={`Enter ${getProviderDisplayName(provider)} API key`}
                    value={apiKeys[provider]?.keyValue || ''}
                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleValidateKey(provider)}
                    disabled={validatingKey === provider || !apiKeys[provider]?.keyValue}
                  >
                    {validatingKey === provider ? (
                      <ArrowsClockwise size={16} className="animate-spin" />
                    ) : (
                      "Validate"
                    )}
                  </Button>
                  <Badge
                    variant={
                      apiKeys[provider]?.status === 'valid' ? 'default' :
                      apiKeys[provider]?.status === 'invalid' ? 'destructive' :
                      'outline'
                    }
                  >
                    {apiKeys[provider]?.status || 'Not Set'}
                  </Badge>
                </div>
              ))}

              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  API keys are stored locally in your browser and never sent to any server except the respective AI provider APIs.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Available Models */}
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>
                Models available based on your configured API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableModels.length === 0 ? (
                <Alert>
                  <Key size={16} />
                  <AlertDescription>
                    Configure and validate at least one API key to see available models.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableModels.map(model => (
                    <Card key={model.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.provider}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {model.contextWindow.toLocaleString()} ctx
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {model.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ${model.inputCostPer1M}/M in • ${model.outputCostPer1M}/M out
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Prompt Templates
              </CardTitle>
              <CardDescription>
                Pre-built prompts for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code_review" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="code_review">Code Review</TabsTrigger>
                  <TabsTrigger value="summarization">Summarization</TabsTrigger>
                  <TabsTrigger value="data_analysis">Data Analysis</TabsTrigger>
                  <TabsTrigger value="creative_writing">Creative Writing</TabsTrigger>
                </TabsList>

                {(['code_review', 'summarization', 'data_analysis', 'creative_writing'] as const).map(category => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid gap-4">
                      {getTemplatesByCategory(category).map(template => (
                        <Card 
                          key={template.id} 
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                              <div className="flex gap-1 mt-2">
                                {template.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <CheckCircle size={20} className="text-primary" weight="fill" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Template Variables */}
              {selectedTemplate && (
                <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold flex items-center gap-2">
                    <PencilSimple size={16} />
                    Fill Template Variables
                  </h4>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.name} className="space-y-1">
                      <Label>
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Textarea
                        placeholder={variable.description}
                        value={templateVariables[variable.name] || ''}
                        onChange={(e) => setTemplateVariables(prev => ({
                          ...prev,
                          [variable.name]: e.target.value,
                        }))}
                        rows={3}
                      />
                    </div>
                  ))}
                  <Button onClick={applyTemplate} className="w-full">
                    <CaretRight size={16} className="mr-2" />
                    Apply Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Prompt Input */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>
                  Enter your prompt to test across multiple models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>System Prompt (Optional)</Label>
                  <Textarea
                    placeholder="Enter system instructions..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Prompt</Label>
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{prompt.length} characters • ~{estimateTokens(prompt)} tokens</span>
                    <span>Est. cost: ${estimatedCost.toFixed(4)}</span>
                  </div>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Running batch test...</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button
                  onClick={handleRunModels}
                  disabled={isRunning || !prompt.trim() || selectedModels.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <ArrowsClockwise size={18} className="animate-spin mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={18} weight="fill" className="mr-2" />
                      Run on {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Models</CardTitle>
                <CardDescription>
                  Choose models for batch testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {availableModels.length === 0 ? (
                      <Alert>
                        <Key size={16} />
                        <AlertDescription>
                          Configure API keys in Setup tab first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      availableModels.map(model => (
                        <div
                          key={model.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedModels.includes(model.id)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            setSelectedModels(prev =>
                              prev.includes(model.id)
                                ? prev.filter(id => id !== model.id)
                                : [...prev, model.id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedModels.includes(model.id)}
                            onCheckedChange={(checked) => {
                              setSelectedModels(prev =>
                                checked
                                  ? [...prev, model.id]
                                  : prev.filter(id => id !== model.id)
                              );
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${model.inputCostPer1M + model.outputCostPer1M}/M tokens
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedModels(availableModels.map(m => m.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedModels([])}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Model Comparison</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of model responses
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={comparisonView === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setComparisonView("grid")}
                  >
                    <GridFour size={16} />
                  </Button>
                  <Button
                    variant={comparisonView === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setComparisonView("list")}
                  >
                    <Article size={16} />
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button variant="outline" size="sm" onClick={() => handleExport('markdown')}>
                    <Download size={16} className="mr-1" />
                    MD
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                    <Export size={16} className="mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <Alert>
                  <MagnifyingGlass size={16} />
                  <AlertDescription>
                    No responses yet. Go to the Test tab to run models.
                  </AlertDescription>
                </Alert>
              ) : comparisonView === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {responses.map(response => (
                    <Card key={response.id} className={`${
                      response.status === 'error' ? 'border-red-500/50' : ''
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{getModelById(response.model)?.name || response.model}</CardTitle>
                            <CardDescription>{response.provider}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(response.response)}
                            disabled={response.status === 'error'}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock size={12} />
                            {response.latencyMs}ms
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Sparkle size={12} />
                            {response.tokens.total} tokens
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <CurrencyDollar size={12} />
                            ${response.cost.toFixed(4)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          {response.status === 'success' ? (
                            <pre className="text-sm whitespace-pre-wrap font-sans">
                              {response.response}
                            </pre>
                          ) : (
                            <Alert variant="destructive">
                              <XCircle size={16} />
                              <AlertDescription>{response.error}</AlertDescription>
                            </Alert>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map(response => (
                    <Card key={response.id} className={`${
                      response.status === 'error' ? 'border-red-500/50' : ''
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <CardTitle className="text-lg">{getModelById(response.model)?.name || response.model}</CardTitle>
                              <CardDescription>{response.provider}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="gap-1">
                                <Clock size={12} />
                                {response.latencyMs}ms
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Sparkle size={12} />
                                {response.tokens.total} tokens
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <CurrencyDollar size={12} />
                                ${response.cost.toFixed(4)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(response.response)}
                            disabled={response.status === 'error'}
                          >
                            <Copy size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {response.status === 'success' ? (
                          <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg">
                            {response.response}
                          </pre>
                        ) : (
                          <Alert variant="destructive">
                            <XCircle size={16} />
                            <AlertDescription>{response.error}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">${sessionCosts.totalCost.toFixed(4)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{sessionCosts.totalTokens.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{sessionCosts.entries.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Costs by provider and model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Provider */}
                <div className="space-y-3">
                  <h4 className="font-semibold">By Provider</h4>
                  {Object.entries(sessionCosts.byProvider)
                    .filter(([_, cost]) => cost > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([provider, cost]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <span className="capitalize">{provider}</span>
                        <Badge variant="outline">${cost.toFixed(4)}</Badge>
                      </div>
                    ))}
                  {Object.values(sessionCosts.byProvider).every(c => c === 0) && (
                    <p className="text-sm text-muted-foreground">No costs recorded yet</p>
                  )}
                </div>

                {/* By Model */}
                <div className="space-y-3">
                  <h4 className="font-semibold">By Model</h4>
                  {Object.entries(sessionCosts.byModel)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([model, cost]) => (
                      <div key={model} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[200px]">
                          {getModelById(model)?.name || model}
                        </span>
                        <Badge variant="outline">${cost.toFixed(4)}</Badge>
                      </div>
                    ))}
                  {Object.keys(sessionCosts.byModel).length === 0 && (
                    <p className="text-sm text-muted-foreground">No costs recorded yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent API calls and their costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {sessionCosts.entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No transactions yet. Run some model tests to see costs here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sessionCosts.entries.slice().reverse().map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{getModelById(entry.model)?.name || entry.model}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {entry.tokens.total} tokens
                          </span>
                          <Badge variant="outline">${entry.cost.toFixed(4)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
