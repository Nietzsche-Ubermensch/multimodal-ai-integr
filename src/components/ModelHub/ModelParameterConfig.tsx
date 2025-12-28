import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sliders, 
  Info,
  Play,
  Copy,
  Check
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import type { Model } from "@/data/models";

interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number | null;
  frequencyPenalty: number;
  presencePenalty: number;
  repetitionPenalty: number;
  maxTokens: number | null;
  seed: number | null;
}

interface ModelParameterPreset {
  id: string;
  name: string;
  description: string;
  parameters: Partial<ModelParameters>;
  modelId: string;
}

const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 1.0,
  topP: 1.0,
  topK: null,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  repetitionPenalty: 1.0,
  maxTokens: null,
  seed: null,
};

const PARAMETER_INFO = {
  temperature: {
    label: "Temperature",
    description: "Controls randomness in the output. Lower values are more deterministic.",
    min: 0,
    max: 2,
    step: 0.01,
    default: 1.0,
  },
  topP: {
    label: "Top P",
    description: "Nucleus sampling parameter. Controls diversity via cumulative probability.",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1.0,
  },
  topK: {
    label: "Top K",
    description: "Limits the number of highest probability tokens to consider.",
    min: 1,
    max: 100,
    step: 1,
    default: null,
  },
  frequencyPenalty: {
    label: "Frequency Penalty",
    description: "Reduces repetition based on token frequency in the text so far.",
    min: -2,
    max: 2,
    step: 0.01,
    default: 0.0,
  },
  presencePenalty: {
    label: "Presence Penalty",
    description: "Reduces repetition based on whether tokens appear in the text so far.",
    min: -2,
    max: 2,
    step: 0.01,
    default: 0.0,
  },
  repetitionPenalty: {
    label: "Repetition Penalty",
    description: "Penalizes repetition. Values > 1 discourage repetition, < 1 encourage it.",
    min: 0,
    max: 2,
    step: 0.01,
    default: 1.0,
  },
  maxTokens: {
    label: "Max Tokens",
    description: "Maximum number of tokens to generate.",
    min: 1,
    max: 4096,
    step: 1,
    default: null,
  },
  seed: {
    label: "Seed",
    description: "Random seed for deterministic outputs (when supported).",
    min: 0,
    max: 999999,
    step: 1,
    default: null,
  },
};

// Model-specific parameter constraints
const MODEL_CONSTRAINTS: Record<string, {
  disabledParameters: (keyof ModelParameters)[];
  notes: string;
}> = {
  "xai/grok-4-1-fast-reasoning": {
    disabledParameters: ["presencePenalty", "frequencyPenalty"],
    notes: "Grok 4 reasoning models do not support presence/frequency penalties or stop sequences.",
  },
  "xai/grok-4-fast-reasoning": {
    disabledParameters: ["presencePenalty", "frequencyPenalty"],
    notes: "Grok 4 reasoning models do not support presence/frequency penalties.",
  },
  "xai/grok-4-0709": {
    disabledParameters: ["presencePenalty", "frequencyPenalty"],
    notes: "Grok 4 models do not support presence/frequency penalties.",
  },
};

interface ModelParameterConfigProps {
  model: Model;
  onParametersChange?: (parameters: ModelParameters) => void;
  showPresetSave?: boolean;
}

export function ModelParameterConfig({ 
  model, 
  onParametersChange,
  showPresetSave = true 
}: ModelParameterConfigProps) {
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [enabledParams, setEnabledParams] = useState<Set<keyof ModelParameters>>(
    new Set(["temperature", "maxTokens"])
  );
  const [presets, setPresets] = useKV<ModelParameterPreset[]>("model-parameter-presets", []);
  const [copied, setCopied] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");

  const modelConstraints = MODEL_CONSTRAINTS[model.id];
  const disabledParameters = modelConstraints?.disabledParameters || [];

  useEffect(() => {
    // Load model-specific defaults
    const modelDefaults = { ...DEFAULT_PARAMETERS };
    if (model.maxTokens) {
      modelDefaults.maxTokens = model.maxTokens;
    }
    setParameters(modelDefaults);
  }, [model.id, model.maxTokens]);

  useEffect(() => {
    if (onParametersChange) {
      const activeParams = Object.fromEntries(
        Array.from(enabledParams)
          .filter(key => !disabledParameters.includes(key))
          .map(key => [key, parameters[key]])
      ) as Partial<ModelParameters>;
      onParametersChange(activeParams as ModelParameters);
    }
  }, [parameters, enabledParams, onParametersChange, disabledParameters]);

  const toggleParameter = (param: keyof ModelParameters) => {
    if (disabledParameters.includes(param)) return;
    
    const newEnabled = new Set(enabledParams);
    if (newEnabled.has(param)) {
      newEnabled.delete(param);
    } else {
      newEnabled.add(param);
    }
    setEnabledParams(newEnabled);
  };

  const updateParameter = <K extends keyof ModelParameters>(
    key: K,
    value: ModelParameters[K]
  ) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const savePreset = () => {
    if (!presetName.trim()) return;

    const preset: ModelParameterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      modelId: model.id,
      parameters: Object.fromEntries(
        Array.from(enabledParams).map(key => [key, parameters[key]])
      ),
    };

    setPresets(current => [...(current || []), preset]);
    setPresetName("");
    setPresetDescription("");
  };

  const loadPreset = (preset: ModelParameterPreset) => {
    setParameters(prev => ({ ...prev, ...preset.parameters }));
    setEnabledParams(new Set(Object.keys(preset.parameters) as (keyof ModelParameters)[]));
  };

  const copyConfiguration = () => {
    const config = Object.fromEntries(
      Array.from(enabledParams).map(key => [key, parameters[key]])
    );
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getParameterValue = (
    param: keyof ModelParameters,
    value: number | null
  ): number => {
    if (value === null) return PARAMETER_INFO[param].default ?? 0;
    return value;
  };

  const modelPresets = (presets || []).filter(p => p.modelId === model.id);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sliders size={20} className="text-primary" />
              </div>
              <div>
                <CardTitle>Model Parameters</CardTitle>
                <CardDescription>
                  Configure model parameters for {model.name}. Check boxes to include in preset.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyConfiguration}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Config
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {modelConstraints && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex gap-2 items-start">
                <Info size={18} className="text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Model Constraints</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {modelConstraints.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(PARAMETER_INFO) as (keyof ModelParameters)[]).map((param) => {
              const info = PARAMETER_INFO[param];
              const isDisabled = disabledParameters.includes(param);
              const isEnabled = enabledParams.has(param) && !isDisabled;
              const value = getParameterValue(param, parameters[param] as number | null);

              return (
                <div
                  key={param}
                  className={`space-y-3 p-4 rounded-lg border ${
                    isEnabled
                      ? "border-primary/30 bg-primary/5"
                      : isDisabled
                      ? "border-border/50 bg-muted/30 opacity-50"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`param-${param}`}
                        checked={isEnabled}
                        onCheckedChange={() => toggleParameter(param)}
                        disabled={isDisabled}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`param-${param}`}
                          className={`font-semibold ${
                            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          {info.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs shrink-0">
                      {value !== null ? value.toFixed(param === "temperature" || param === "topP" ? 2 : 0) : "null"}
                    </Badge>
                  </div>

                  {isEnabled && (
                    <div className="space-y-2 pt-2">
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => updateParameter(param, v as any)}
                        min={info.min}
                        max={info.max}
                        step={info.step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>{info.min}</span>
                        <span>{info.max}</span>
                      </div>
                    </div>
                  )}

                  {isDisabled && (
                    <Badge variant="secondary" className="text-xs">
                      Not supported for this model
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showPresetSave && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Save as Preset</CardTitle>
            <CardDescription>
              Save these parameter settings for quick reuse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  placeholder="e.g., Creative Writing"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-description">Description (Optional)</Label>
                <Input
                  id="preset-description"
                  placeholder="e.g., High temperature for creative tasks"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={savePreset}
              disabled={!presetName.trim()}
              className="w-full gap-2"
            >
              <Play size={18} />
              Save Preset
            </Button>
          </CardContent>
        </Card>
      )}

      {modelPresets.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Saved Presets ({modelPresets.length})</CardTitle>
            <CardDescription>
              Load previously saved parameter configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modelPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{preset.name}</p>
                    {preset.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {preset.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(preset.parameters).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset(preset)}
                    className="gap-2 ml-4"
                  >
                    <Play size={16} />
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
