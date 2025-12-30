/**
 * XAI Service
 * Integrates XAI SDK with the existing model providers
 * Provides explanations for predictions from various AI models
 */

import {
  XAIExplainer,
  createExplainer,
  type XAIConfig,
  type XAIExplanation,
  type ModelType,
  type ExplanationType,
} from './xai-sdk';

// ============================================================================
// Service Configuration
// ============================================================================

export interface XAIServiceConfig {
  provider: string;           // Model provider (openrouter, deepseek, xai, etc.)
  modelId: string;            // Specific model ID
  explanationType?: ExplanationType;
  autoDetectModelType?: boolean;
}

export interface ModelPrediction {
  input: string | any;
  output: string;
  modelId: string;
  provider: string;
  metadata?: {
    tokens?: number;
    confidence?: number;
    latency?: number;
    raw?: any;
  };
}

// ============================================================================
// XAI Service Class
// ============================================================================

export class XAIService {
  private explainers: Map<string, XAIExplainer>;
  
  constructor() {
    this.explainers = new Map();
  }
  
  /**
   * Generate explanation for a model prediction
   */
  async explainModelPrediction(
    prediction: ModelPrediction,
    config?: Partial<XAIServiceConfig>
  ): Promise<XAIExplanation> {
    const modelType = this.detectModelType(prediction.modelId, prediction.provider);
    const explanationType = config?.explanationType || this.getDefaultExplanationType(modelType);
    
    const explainerKey = `${modelType}-${explanationType}`;
    
    if (!this.explainers.has(explainerKey)) {
      const xaiConfig: XAIConfig = {
        modelType,
        explanationType,
        topK: 10,
        threshold: 0.01,
        visualize: true,
      };
      
      this.explainers.set(explainerKey, createExplainer(xaiConfig));
    }
    
    const explainer = this.explainers.get(explainerKey)!;
    
    return explainer.explain(
      prediction.input,
      prediction.output,
      prediction.metadata?.raw
    );
  }
  
  /**
   * Generate multiple explanations using different methods
   */
  async explainWithMultipleMethods(
    prediction: ModelPrediction,
    methods: ExplanationType[]
  ): Promise<Record<ExplanationType, XAIExplanation>> {
    const modelType = this.detectModelType(prediction.modelId, prediction.provider);
    const results: Record<string, XAIExplanation> = {};
    
    for (const method of methods) {
      const explainerKey = `${modelType}-${method}`;
      
      if (!this.explainers.has(explainerKey)) {
        this.explainers.set(explainerKey, createExplainer({
          modelType,
          explanationType: method,
        }));
      }
      
      const explainer = this.explainers.get(explainerKey)!;
      results[method] = await explainer.explain(
        prediction.input,
        prediction.output,
        prediction.metadata?.raw
      );
    }
    
    return results as Record<ExplanationType, XAIExplanation>;
  }
  
  /**
   * Batch explain multiple predictions
   */
  async batchExplain(
    predictions: ModelPrediction[],
    config?: Partial<XAIServiceConfig>
  ): Promise<XAIExplanation[]> {
    return Promise.all(
      predictions.map(pred => this.explainModelPrediction(pred, config))
    );
  }
  
  /**
   * Compare explanations across different models
   */
  async compareModelExplanations(
    predictions: ModelPrediction[]
  ): Promise<Array<{
    modelId: string;
    provider: string;
    explanation: XAIExplanation;
  }>> {
    const explanations = await this.batchExplain(predictions);
    
    return predictions.map((pred, idx) => ({
      modelId: pred.modelId,
      provider: pred.provider,
      explanation: explanations[idx],
    }));
  }
  
  /**
   * Get recommended explanation type for a model
   */
  getRecommendedExplanationType(modelId: string, provider: string): ExplanationType {
    const modelType = this.detectModelType(modelId, provider);
    
    switch (modelType) {
      case 'text':
        return 'attention';
      case 'vision':
        return 'gradient';
      case 'code':
        return 'feature_importance';
      case 'multimodal':
        return 'integrated_gradients';
      default:
        return 'feature_importance';
    }
  }
  
  // ============================================================================
  // Private Helper Methods
  // ============================================================================
  
  /**
   * Detect model type from model ID and provider
   */
  private detectModelType(modelId: string, provider: string): ModelType {
    const id = modelId.toLowerCase();
    
    // Vision models
    if (
      id.includes('vision') ||
      id.includes('gpt-4o') ||
      id.includes('claude-3') ||
      id.includes('gemini-pro-vision') ||
      id.includes('grok-vision')
    ) {
      return 'vision';
    }
    
    // Code models
    if (
      id.includes('code') ||
      id.includes('codex') ||
      id.includes('starcoder') ||
      id.includes('deepseek-coder') ||
      id.includes('grok-code')
    ) {
      return 'code';
    }
    
    // Multimodal models
    if (
      id.includes('gpt-4') ||
      id.includes('claude-3') ||
      id.includes('gemini')
    ) {
      return 'multimodal';
    }
    
    // Default to text
    return 'text';
  }
  
  /**
   * Get default explanation type for model type
   */
  private getDefaultExplanationType(modelType: ModelType): ExplanationType {
    switch (modelType) {
      case 'text':
        return 'attention';
      case 'vision':
        return 'gradient';
      case 'code':
        return 'feature_importance';
      case 'multimodal':
        return 'integrated_gradients';
      default:
        return 'feature_importance';
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let xaiServiceInstance: XAIService | null = null;

export function getXAIService(): XAIService {
  if (!xaiServiceInstance) {
    xaiServiceInstance = new XAIService();
  }
  return xaiServiceInstance;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick explain function for common use cases
 */
export async function explainAIResponse(
  input: string,
  output: string,
  modelId: string,
  provider: string = 'openrouter'
): Promise<XAIExplanation> {
  const service = getXAIService();
  
  return service.explainModelPrediction({
    input,
    output,
    modelId,
    provider,
  });
}

/**
 * Explain with confidence scoring
 */
export async function explainWithConfidence(
  prediction: ModelPrediction
): Promise<{
  explanation: XAIExplanation;
  confidenceFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
  }>;
}> {
  const service = getXAIService();
  const explanation = await service.explainModelPrediction(prediction);
  
  const confidenceFactors = explanation.featureImportances?.map(fi => ({
    factor: fi.token || String(fi.feature),
    impact: fi.importance > 0.1 ? 'positive' : fi.importance < -0.1 ? 'negative' : 'neutral',
    score: Math.abs(fi.importance),
  })) || [];
  
  return {
    explanation,
    confidenceFactors: confidenceFactors
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
  };
}

/**
 * Generate explanation summary for UI display
 */
export function formatExplanationForUI(explanation: XAIExplanation): {
  title: string;
  summary: string;
  topFeatures: Array<{ label: string; value: number; type: 'positive' | 'negative' }>;
  visualizationType: string;
} {
  const topFeatures = explanation.summary.topFeatures.map(f => ({
    label: f.feature,
    value: Math.abs(f.score),
    type: (f.score > 0 ? 'positive' : 'negative') as 'positive' | 'negative',
  }));
  
  return {
    title: `${explanation.explanationType.replace(/_/g, ' ').toUpperCase()} Explanation`,
    summary: explanation.summary.explanation,
    topFeatures,
    visualizationType: explanation.visualization?.type || 'none',
  };
}

/**
 * Export explanation to JSON
 */
export function exportExplanation(
  explanation: XAIExplanation,
  format: 'json' | 'csv' = 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(explanation, null, 2);
  }
  
  // CSV format for feature importances
  if (explanation.featureImportances) {
    const headers = 'Feature,Importance,Position\n';
    const rows = explanation.featureImportances
      .map(fi => `"${fi.token || fi.feature}",${fi.importance},${fi.position}`)
      .join('\n');
    return headers + rows;
  }
  
  return JSON.stringify(explanation, null, 2);
}

// ============================================================================
// Model-Specific Explanation Helpers
// ============================================================================

/**
 * Explain GPT model response
 */
export async function explainGPTResponse(
  prompt: string,
  response: string,
  modelId: string = 'gpt-4o'
): Promise<XAIExplanation> {
  return explainAIResponse(prompt, response, modelId, 'openai');
}

/**
 * Explain Claude model response
 */
export async function explainClaudeResponse(
  prompt: string,
  response: string,
  modelId: string = 'claude-3.5-sonnet'
): Promise<XAIExplanation> {
  return explainAIResponse(prompt, response, modelId, 'anthropic');
}

/**
 * Explain DeepSeek model response
 */
export async function explainDeepSeekResponse(
  prompt: string,
  response: string,
  modelId: string = 'deepseek-chat'
): Promise<XAIExplanation> {
  return explainAIResponse(prompt, response, modelId, 'deepseek');
}

/**
 * Explain xAI Grok model response
 */
export async function explainGrokResponse(
  prompt: string,
  response: string,
  modelId: string = 'grok-4.1'
): Promise<XAIExplanation> {
  return explainAIResponse(prompt, response, modelId, 'xai');
}
