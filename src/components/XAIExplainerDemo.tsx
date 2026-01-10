/**
 * XAI Explainer Demo Component
 * Interactive demonstration of Explainable AI capabilities
 */

import React, { useState } from 'react';
import { ChartBar, Brain, Eye, Sparkle, Download, Copy, Check } from '@phosphor-icons/react';
import type { ExplanationType, XAIExplanation, ModelType } from '@/lib/xai-sdk';
import { getXAIService, formatExplanationForUI, exportExplanation, type ModelPrediction } from '@/lib/xai-service';

const EXPLANATION_TYPES: Array<{ value: ExplanationType; label: string; icon: React.ReactNode; description: string }> = [
  {
    value: 'feature_importance',
    label: 'Feature Importance',
    icon: <ChartBar className="w-5 h-5" />,
    description: 'SHAP-style attribution showing which features matter most',
  },
  {
    value: 'attention',
    label: 'Attention Weights',
    icon: <Eye className="w-5 h-5" />,
    description: 'Visualize which input tokens the model focuses on',
  },
  {
    value: 'gradient',
    label: 'Gradient Analysis',
    icon: <Sparkle className="w-5 h-5" />,
    description: 'Show how changes to inputs affect the output',
  },
  {
    value: 'integrated_gradients',
    label: 'Integrated Gradients',
    icon: <Brain className="w-5 h-5" />,
    description: 'Path-based attribution from baseline to input',
  },
  {
    value: 'lrp',
    label: 'Layer-wise Relevance',
    icon: <ChartBar className="w-5 h-5" />,
    description: 'Propagate relevance from output through all layers',
  },
  {
    value: 'lime',
    label: 'LIME',
    icon: <Sparkle className="w-5 h-5" />,
    description: 'Local interpretable model-agnostic explanations',
  },
];

const MODEL_TYPES: Array<{ value: ModelType; label: string }> = [
  { value: 'text', label: 'Text Model' },
  { value: 'vision', label: 'Vision Model' },
  { value: 'code', label: 'Code Model' },
  { value: 'multimodal', label: 'Multimodal Model' },
];

const EXAMPLE_MODELS = [
  { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o' },
  { id: 'claude-3.5-sonnet', provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
  { id: 'deepseek-chat', provider: 'deepseek', name: 'DeepSeek Chat' },
  { id: 'grok-4.1', provider: 'xai', name: 'Grok 4.1' },
  { id: 'deepseek-coder', provider: 'deepseek', name: 'DeepSeek Coder' },
];

export function XAIExplainerDemo() {
  const [input, setInput] = useState('Explain the concept of quantum entanglement in simple terms.');
  const [output, setOutput] = useState('Quantum entanglement is a phenomenon where two particles become connected...');
  const [selectedModel, setSelectedModel] = useState(EXAMPLE_MODELS[0]);
  const [explanationType, setExplanationType] = useState<ExplanationType>('feature_importance');
  const [explanation, setExplanation] = useState<XAIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [multipleExplanations, setMultipleExplanations] = useState<Record<ExplanationType, XAIExplanation> | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    try {
      const service = getXAIService();
      const prediction: ModelPrediction = {
        input,
        output,
        modelId: selectedModel.id,
        provider: selectedModel.provider,
      };

      if (compareMode) {
        const methods: ExplanationType[] = ['feature_importance', 'attention', 'gradient'];
        const results = await service.explainWithMultipleMethods(prediction, methods);
        setMultipleExplanations(results);
        setExplanation(null);
      } else {
        const result = await service.explainModelPrediction(prediction, {
          explanationType,
        });
        setExplanation(result);
        setMultipleExplanations(null);
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (exp: XAIExplanation) => {
    const json = exportExplanation(exp, 'json');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xai-explanation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderExplanation = (exp: XAIExplanation) => {
    const formatted = formatExplanationForUI(exp);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{formatted.title}</h3>
            <p className="text-sm text-gray-400 mt-1">Confidence: {(exp.confidence * 100).toFixed(1)}%</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(JSON.stringify(exp, null, 2))}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => handleExport(exp)}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-300">{formatted.summary}</p>
        </div>

        {/* Top Features */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Top Contributing Features</h4>
          <div className="space-y-2">
            {formatted.topFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-400 truncate">{feature.label}</div>
                <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full transition-all ${
                      feature.type === 'positive' ? 'bg-green-500/70' : 'bg-red-500/70'
                    }`}
                    style={{ width: `${Math.abs(feature.value) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-sm text-white font-medium">
                    {(feature.value * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization Data */}
        {exp.visualization && (
          <div>
            <h4 className="text-lg font-medium text-white mb-4">
              Visualization ({exp.visualization.type})
            </h4>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 overflow-auto">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(exp.visualization.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-gray-400">Model Type</div>
            <div className="text-white font-medium capitalize">{exp.modelType}</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-gray-400">Explanation Type</div>
            <div className="text-white font-medium capitalize">{exp.explanationType.replace(/_/g, ' ')}</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-gray-400">Generated</div>
            <div className="text-white font-medium">
              {new Date(exp.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-purple-400" />
          XAI Explainer Demo
        </h1>
        <p className="text-lg text-gray-400">
          Generate transparent explanations for AI model predictions
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model Input (Prompt)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the model input..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model Output (Response)
            </label>
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the model output..."
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel.id}
              onChange={(e) => {
                const model = EXAMPLE_MODELS.find(m => m.id === e.target.value);
                if (model) setSelectedModel(model);
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {EXAMPLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Explanation Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPLANATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setExplanationType(type.value)}
                  disabled={compareMode}
                  className={`p-3 rounded-lg border transition-colors ${
                    explanationType === type.value && !compareMode
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  } ${compareMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="compare-mode"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700"
            />
            <label htmlFor="compare-mode" className="text-sm text-gray-300">
              Compare multiple explanation methods
            </label>
          </div>

          <button
            onClick={handleExplain}
            disabled={isLoading || !input || !output}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkle className="w-5 h-5" />
                Generate Explanation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {explanation && !compareMode && (
        <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
          {renderExplanation(explanation)}
        </div>
      )}

      {multipleExplanations && compareMode && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Comparison Results</h2>
          {Object.entries(multipleExplanations).map(([type, exp]) => (
            <div key={type} className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              {renderExplanation(exp)}
            </div>
          ))}
        </div>
      )}

      {/* Documentation */}
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">About XAI Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPLANATION_TYPES.map((type) => (
            <div key={type.value} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {type.icon}
                <h4 className="font-medium text-white">{type.label}</h4>
              </div>
              <p className="text-sm text-gray-400">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
