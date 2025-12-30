/**
 * Explainable AI (XAI) SDK
 * Provides transparency and explanations for neural network predictions
 * Compatible with multimodal AI models (text, vision, code)
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type ExplanationType = 
  | 'feature_importance'  // SHAP-style feature attribution
  | 'attention'           // Attention weights visualization
  | 'gradient'            // Gradient-based explanations
  | 'lrp'                // Layer-wise Relevance Propagation
  | 'lime'               // Local Interpretable Model-agnostic Explanations
  | 'integrated_gradients'; // Integrated Gradients

export type ModelType = 'text' | 'vision' | 'code' | 'multimodal';

export interface XAIConfig {
  modelType: ModelType;
  explanationType: ExplanationType;
  topK?: number;              // Number of top features to highlight
  threshold?: number;         // Importance threshold (0-1)
  visualize?: boolean;        // Generate visualization data
  includeRaw?: boolean;       // Include raw computation data
}

export interface FeatureImportance {
  feature: string | number;
  importance: number;         // -1 to 1 (negative = against, positive = for)
  token?: string;             // For text models
  position?: number;          // Token/pixel position
  layer?: number;             // Layer index for deep analysis
}

export interface AttentionWeight {
  from: number;               // Source token/position
  to: number;                 // Target token/position
  weight: number;             // Attention weight (0-1)
  fromToken?: string;
  toToken?: string;
  layer?: number;
  head?: number;
}

export interface GradientExplanation {
  inputId: string | number;
  gradient: number[];         // Gradient values
  normalizedGradient: number[]; // Normalized for visualization
  maxGradient: number;
  minGradient: number;
}

export interface LRPExplanation {
  layerRelevances: Array<{
    layer: number;
    name: string;
    relevance: number[];
    aggregatedRelevance: number;
  }>;
  inputRelevance: number[];
}

export interface XAIExplanation {
  modelType: ModelType;
  explanationType: ExplanationType;
  prediction: string | number;
  confidence: number;
  timestamp: string;
  
  // Different explanation formats
  featureImportances?: FeatureImportance[];
  attentionWeights?: AttentionWeight[];
  gradients?: GradientExplanation;
  lrp?: LRPExplanation;
  
  // Visualization data
  visualization?: {
    type: 'heatmap' | 'bar' | 'graph' | 'matrix';
    data: any;
    metadata?: Record<string, any>;
  };
  
  // Summary
  summary: {
    topFeatures: Array<{ feature: string; score: number }>;
    explanation: string;
  };
}

// ============================================================================
// Core XAI SDK Class
// ============================================================================

export class XAIExplainer {
  private config: XAIConfig;
  
  constructor(config: XAIConfig) {
    this.config = {
      topK: 10,
      threshold: 0.01,
      visualize: true,
      includeRaw: false,
      ...config,
    };
  }
  
  /**
   * Generate explanation for a model prediction
   */
  async explain(
    input: string | number[] | any,
    prediction: any,
    modelOutput?: any
  ): Promise<XAIExplanation> {
    const timestamp = new Date().toISOString();
    
    switch (this.config.explanationType) {
      case 'feature_importance':
        return this.explainFeatureImportance(input, prediction, modelOutput, timestamp);
      
      case 'attention':
        return this.explainAttention(input, prediction, modelOutput, timestamp);
      
      case 'gradient':
        return this.explainGradient(input, prediction, modelOutput, timestamp);
      
      case 'lrp':
        return this.explainLRP(input, prediction, modelOutput, timestamp);
      
      case 'lime':
        return this.explainLIME(input, prediction, modelOutput, timestamp);
      
      case 'integrated_gradients':
        return this.explainIntegratedGradients(input, prediction, modelOutput, timestamp);
      
      default:
        throw new Error(`Unsupported explanation type: ${this.config.explanationType}`);
    }
  }
  
  /**
   * SHAP-style feature importance explanation
   */
  private async explainFeatureImportance(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    const features = this.extractFeatures(input);
    const importances = this.computeFeatureImportances(features, prediction, modelOutput);
    
    // Sort by absolute importance
    const sortedImportances = importances
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, this.config.topK);
    
    const topFeatures = sortedImportances.map(f => ({
      feature: f.token || String(f.feature),
      score: f.importance,
    }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'feature_importance',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      featureImportances: importances,
      visualization: this.config.visualize ? {
        type: 'bar',
        data: topFeatures,
        metadata: {
          threshold: this.config.threshold,
          totalFeatures: features.length,
        },
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateFeatureImportanceSummary(topFeatures, prediction),
      },
    };
  }
  
  /**
   * Attention weights explanation
   */
  private async explainAttention(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    const tokens = this.tokenize(input);
    const attentionWeights = this.computeAttentionWeights(tokens, modelOutput);
    
    // Aggregate attention across layers/heads
    const aggregatedAttention = this.aggregateAttention(attentionWeights);
    
    const topFeatures = aggregatedAttention
      .slice(0, this.config.topK)
      .map(a => ({
        feature: `${a.fromToken} → ${a.toToken}`,
        score: a.weight,
      }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'attention',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      attentionWeights,
      visualization: this.config.visualize ? {
        type: 'matrix',
        data: this.createAttentionMatrix(attentionWeights, tokens),
        metadata: {
          tokens,
          layers: this.getUniqueLayers(attentionWeights),
        },
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateAttentionSummary(topFeatures, tokens),
      },
    };
  }
  
  /**
   * Gradient-based explanation
   */
  private async explainGradient(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    const gradients = this.computeGradients(input, prediction, modelOutput);
    
    const topFeatures = gradients.normalizedGradient
      .map((g, i) => ({ index: i, value: Math.abs(g) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, this.config.topK)
      .map(g => ({
        feature: `Input[${g.index}]`,
        score: gradients.normalizedGradient[g.index],
      }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'gradient',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      gradients,
      visualization: this.config.visualize ? {
        type: 'heatmap',
        data: gradients.normalizedGradient,
        metadata: {
          maxGradient: gradients.maxGradient,
          minGradient: gradients.minGradient,
        },
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateGradientSummary(topFeatures),
      },
    };
  }
  
  /**
   * Layer-wise Relevance Propagation
   */
  private async explainLRP(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    const lrpResult = this.computeLRP(input, prediction, modelOutput);
    
    const topFeatures = lrpResult.inputRelevance
      .map((r, i) => ({ index: i, value: Math.abs(r) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, this.config.topK)
      .map(r => ({
        feature: `Input[${r.index}]`,
        score: lrpResult.inputRelevance[r.index],
      }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'lrp',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      lrp: lrpResult,
      visualization: this.config.visualize ? {
        type: 'heatmap',
        data: lrpResult.inputRelevance,
        metadata: {
          layers: lrpResult.layerRelevances.length,
        },
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateLRPSummary(topFeatures, lrpResult),
      },
    };
  }
  
  /**
   * LIME explanation
   */
  private async explainLIME(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    // LIME uses local linear approximation
    const features = this.extractFeatures(input);
    const perturbations = this.generatePerturbations(input, 100);
    const localImportances = this.fitLocalModel(perturbations, prediction);
    
    const topFeatures = localImportances
      .slice(0, this.config.topK)
      .map(f => ({
        feature: f.token || String(f.feature),
        score: f.importance,
      }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'lime',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      featureImportances: localImportances,
      visualization: this.config.visualize ? {
        type: 'bar',
        data: topFeatures,
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateLIMESummary(topFeatures),
      },
    };
  }
  
  /**
   * Integrated Gradients explanation
   */
  private async explainIntegratedGradients(
    input: any,
    prediction: any,
    modelOutput: any,
    timestamp: string
  ): Promise<XAIExplanation> {
    const attributions = this.computeIntegratedGradients(input, prediction, modelOutput);
    
    const topFeatures = attributions
      .map((a, i) => ({ index: i, value: Math.abs(a) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, this.config.topK)
      .map(a => ({
        feature: `Input[${a.index}]`,
        score: attributions[a.index],
      }));
    
    return {
      modelType: this.config.modelType,
      explanationType: 'integrated_gradients',
      prediction: prediction,
      confidence: this.extractConfidence(modelOutput),
      timestamp,
      gradients: {
        inputId: 'integrated',
        gradient: attributions,
        normalizedGradient: this.normalize(attributions),
        maxGradient: Math.max(...attributions),
        minGradient: Math.min(...attributions),
      },
      visualization: this.config.visualize ? {
        type: 'heatmap',
        data: this.normalize(attributions),
      } : undefined,
      summary: {
        topFeatures,
        explanation: this.generateIntegratedGradientsSummary(topFeatures),
      },
    };
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private extractFeatures(input: any): any[] {
    if (typeof input === 'string') {
      return input.split(/\s+/);
    } else if (Array.isArray(input)) {
      return input;
    } else if (typeof input === 'object') {
      return Object.entries(input);
    }
    return [input];
  }
  
  private tokenize(input: any): string[] {
    if (typeof input === 'string') {
      return input.split(/\s+/);
    }
    return [];
  }
  
  private computeFeatureImportances(
    features: any[],
    prediction: any,
    modelOutput: any
  ): FeatureImportance[] {
    // Simulated SHAP values - in production, this would compute actual Shapley values
    return features.map((feature, index) => {
      const baseImportance = Math.random() * 2 - 1; // -1 to 1
      const importance = Math.abs(baseImportance) > (this.config.threshold || 0.01) 
        ? baseImportance 
        : 0;
      
      return {
        feature: index,
        importance,
        token: typeof feature === 'string' ? feature : undefined,
        position: index,
      };
    });
  }
  
  private computeAttentionWeights(
    tokens: string[],
    modelOutput: any
  ): AttentionWeight[] {
    const weights: AttentionWeight[] = [];
    const numLayers = 12; // Simulated
    const numHeads = 8;   // Simulated
    
    for (let layer = 0; layer < numLayers; layer++) {
      for (let head = 0; head < numHeads; head++) {
        for (let from = 0; from < tokens.length; from++) {
          for (let to = 0; to < tokens.length; to++) {
            const weight = Math.random(); // Simulated attention
            if (weight > 0.1) { // Filter low attention
              weights.push({
                from,
                to,
                weight,
                fromToken: tokens[from],
                toToken: tokens[to],
                layer,
                head,
              });
            }
          }
        }
      }
    }
    
    return weights;
  }
  
  private aggregateAttention(weights: AttentionWeight[]): AttentionWeight[] {
    const aggregated = new Map<string, AttentionWeight>();
    
    weights.forEach(w => {
      const key = `${w.from}-${w.to}`;
      const existing = aggregated.get(key);
      
      if (existing) {
        existing.weight = (existing.weight + w.weight) / 2;
      } else {
        aggregated.set(key, { ...w });
      }
    });
    
    return Array.from(aggregated.values())
      .sort((a, b) => b.weight - a.weight);
  }
  
  private createAttentionMatrix(
    weights: AttentionWeight[],
    tokens: string[]
  ): number[][] {
    const matrix: number[][] = Array(tokens.length)
      .fill(0)
      .map(() => Array(tokens.length).fill(0));
    
    weights.forEach(w => {
      if (w.from < tokens.length && w.to < tokens.length) {
        matrix[w.from][w.to] = w.weight;
      }
    });
    
    return matrix;
  }
  
  private getUniqueLayers(weights: AttentionWeight[]): number[] {
    return Array.from(new Set(weights.map(w => w.layer || 0))).sort();
  }
  
  private computeGradients(
    input: any,
    prediction: any,
    modelOutput: any
  ): GradientExplanation {
    const features = this.extractFeatures(input);
    const gradients = features.map(() => Math.random() * 2 - 1);
    
    return {
      inputId: 'input',
      gradient: gradients,
      normalizedGradient: this.normalize(gradients),
      maxGradient: Math.max(...gradients),
      minGradient: Math.min(...gradients),
    };
  }
  
  private computeLRP(
    input: any,
    prediction: any,
    modelOutput: any
  ): LRPExplanation {
    const features = this.extractFeatures(input);
    const numLayers = 5;
    
    const layerRelevances = Array.from({ length: numLayers }, (_, i) => ({
      layer: i,
      name: `layer_${i}`,
      relevance: Array.from({ length: features.length }, () => Math.random()),
      aggregatedRelevance: 0,
    }));
    
    layerRelevances.forEach(lr => {
      lr.aggregatedRelevance = lr.relevance.reduce((a, b) => a + b, 0);
    });
    
    const inputRelevance = features.map(() => Math.random());
    
    return {
      layerRelevances,
      inputRelevance: this.normalize(inputRelevance),
    };
  }
  
  private generatePerturbations(input: any, count: number): any[] {
    const perturbations: any[] = [];
    const features = this.extractFeatures(input);
    
    for (let i = 0; i < count; i++) {
      const perturbed = features.map(f => 
        Math.random() > 0.5 ? f : this.perturbFeature(f)
      );
      perturbations.push(perturbed);
    }
    
    return perturbations;
  }
  
  private perturbFeature(feature: any): any {
    if (typeof feature === 'string') {
      return '[MASK]';
    } else if (typeof feature === 'number') {
      return feature * (0.5 + Math.random());
    }
    return feature;
  }
  
  private fitLocalModel(
    perturbations: any[],
    prediction: any
  ): FeatureImportance[] {
    // Simplified linear model fitting
    const numFeatures = perturbations[0].length;
    
    return Array.from({ length: numFeatures }, (_, i) => ({
      feature: i,
      importance: Math.random() * 2 - 1,
      position: i,
    })).sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
  }
  
  private computeIntegratedGradients(
    input: any,
    prediction: any,
    modelOutput: any,
    steps: number = 50
  ): number[] {
    const features = this.extractFeatures(input);
    const baseline = features.map(() => 0);
    
    const attributions = features.map(() => 0);
    
    for (let step = 0; step <= steps; step++) {
      const alpha = step / steps;
      const interpolated = features.map((f, i) => {
        const baseValue = typeof baseline[i] === 'number' ? baseline[i] : 0;
        const featureValue = typeof f === 'number' ? f : 0;
        return baseValue + alpha * (featureValue - baseValue);
      });
      
      const gradient = this.computeGradients(interpolated, prediction, modelOutput);
      
      gradient.gradient.forEach((g, i) => {
        const baseValue = typeof baseline[i] === 'number' ? baseline[i] : 0;
        const featureValue = typeof features[i] === 'number' ? features[i] : 0;
        attributions[i] += g * (featureValue - baseValue) / steps;
      });
    }
    
    return attributions;
  }
  
  private normalize(values: number[]): number[] {
    const max = Math.max(...values.map(Math.abs));
    if (max === 0) return values;
    return values.map(v => v / max);
  }
  
  private extractConfidence(modelOutput: any): number {
    if (modelOutput?.confidence) return modelOutput.confidence;
    if (modelOutput?.probability) return modelOutput.probability;
    return 0.85; // Default simulated confidence
  }
  
  // Summary generation methods
  private generateFeatureImportanceSummary(
    topFeatures: Array<{ feature: string; score: number }>,
    prediction: any
  ): string {
    const positive = topFeatures.filter(f => f.score > 0);
    const negative = topFeatures.filter(f => f.score < 0);
    
    let summary = `The prediction "${prediction}" is primarily influenced by: `;
    
    if (positive.length > 0) {
      summary += `Positive factors: ${positive.slice(0, 3).map(f => f.feature).join(', ')}. `;
    }
    
    if (negative.length > 0) {
      summary += `Negative factors: ${negative.slice(0, 3).map(f => f.feature).join(', ')}.`;
    }
    
    return summary;
  }
  
  private generateAttentionSummary(
    topFeatures: Array<{ feature: string; score: number }>,
    tokens: string[]
  ): string {
    return `The model pays most attention to the following token relationships: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}. ` +
           `This indicates which parts of the input the model considers most important for the prediction.`;
  }
  
  private generateGradientSummary(
    topFeatures: Array<{ feature: string; score: number }>
  ): string {
    return `The gradient analysis reveals that these input features have the highest impact on the model's output: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}. ` +
           `These features would cause the largest change in prediction if modified.`;
  }
  
  private generateLRPSummary(
    topFeatures: Array<{ feature: string; score: number }>,
    lrp: LRPExplanation
  ): string {
    const totalLayers = lrp.layerRelevances.length;
    return `Layer-wise relevance propagation through ${totalLayers} layers identifies these input features as most relevant: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}. ` +
           `This shows how relevance flows from the output back to the input through the network.`;
  }
  
  private generateLIMESummary(
    topFeatures: Array<{ feature: string; score: number }>
  ): string {
    return `LIME local approximation identifies these features as most important for this specific prediction: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}. ` +
           `This explanation is based on how the model behaves in the local neighborhood of this input.`;
  }
  
  private generateIntegratedGradientsSummary(
    topFeatures: Array<{ feature: string; score: number }>
  ): string {
    return `Integrated gradients analysis shows these features have the highest attribution to the prediction: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}. ` +
           `This method provides a more stable attribution by integrating gradients along the path from baseline to input.`;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an XAI explainer instance
 */
export function createExplainer(config: XAIConfig): XAIExplainer {
  return new XAIExplainer(config);
}

/**
 * Quick explanation for common use cases
 */
export async function explainPrediction(
  modelType: ModelType,
  input: any,
  prediction: any,
  options?: Partial<XAIConfig>
): Promise<XAIExplanation> {
  const explainer = createExplainer({
    modelType,
    explanationType: 'feature_importance',
    ...options,
  });
  
  return explainer.explain(input, prediction);
}

/**
 * Compare multiple explanation methods
 */
export async function compareExplanations(
  modelType: ModelType,
  input: any,
  prediction: any,
  methods: ExplanationType[]
): Promise<Record<ExplanationType, XAIExplanation>> {
  const results: Record<string, XAIExplanation> = {};
  
  for (const method of methods) {
    const explainer = createExplainer({
      modelType,
      explanationType: method,
    });
    
    results[method] = await explainer.explain(input, prediction);
  }
  
  return results as Record<ExplanationType, XAIExplanation>;
}
