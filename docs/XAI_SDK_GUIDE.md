# XAI SDK Integration Guide

## Overview

The XAI (Explainable AI) SDK provides transparency and interpretability for neural network predictions within the multimodal AI framework. It offers multiple explanation methods to help developers and users understand why models make specific predictions.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Explanation Methods](#explanation-methods)
7. [Integration Guide](#integration-guide)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

The XAI SDK consists of three main components:

1. **XAI SDK Core** (`src/lib/xai-sdk.ts`)
   - Core explanation algorithms
   - Multiple explanation types (SHAP, attention, gradients, LRP, LIME)
   - Visualization data generation
   - Model-agnostic architecture

2. **XAI Service** (`src/lib/xai-service.ts`)
   - Integration layer with existing model providers
   - Auto-detection of model types
   - Batch explanation capabilities
   - Model comparison features

3. **XAI Demo Component** (`src/components/XAIExplainerDemo.tsx`)
   - Interactive UI for testing explanations
   - Visualization of results
   - Export functionality
   - Comparison mode for multiple methods

### Supported Model Types

- **Text Models**: GPT-4, Claude, DeepSeek Chat, Llama
- **Vision Models**: GPT-4o, Claude 3 Vision, Gemini Vision
- **Code Models**: DeepSeek Coder, Codex, StarCoder
- **Multimodal Models**: GPT-4, Claude 3.5, Gemini Pro

### Explanation Types

1. **Feature Importance**: SHAP-style attribution
2. **Attention Weights**: Transformer attention visualization
3. **Gradient Analysis**: Input gradient-based explanations
4. **Integrated Gradients**: Path-based attribution
5. **Layer-wise Relevance Propagation (LRP)**: Deep network explanations
6. **LIME**: Local interpretable model-agnostic explanations

---

## Installation & Setup

### Prerequisites

This SDK is integrated into the existing multimodal AI platform. No additional installation is required.

### Import the SDK

```typescript
import { createExplainer, explainPrediction, type XAIConfig } from '@/lib/xai-sdk';
import { getXAIService, explainAIResponse } from '@/lib/xai-service';
```

### TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  XAIExplanation,
  ExplanationType,
  ModelType,
  FeatureImportance,
  AttentionWeight,
} from '@/lib/xai-sdk';
```

---

## Core Concepts

### XAI Configuration

```typescript
interface XAIConfig {
  modelType: ModelType;           // 'text' | 'vision' | 'code' | 'multimodal'
  explanationType: ExplanationType; // See explanation types above
  topK?: number;                  // Number of top features (default: 10)
  threshold?: number;             // Importance threshold (default: 0.01)
  visualize?: boolean;            // Generate visualization data (default: true)
  includeRaw?: boolean;           // Include raw computation data (default: false)
}
```

### Explanation Output

```typescript
interface XAIExplanation {
  modelType: ModelType;
  explanationType: ExplanationType;
  prediction: string | number;
  confidence: number;
  timestamp: string;
  
  // Method-specific data
  featureImportances?: FeatureImportance[];
  attentionWeights?: AttentionWeight[];
  gradients?: GradientExplanation;
  lrp?: LRPExplanation;
  
  // Visualization
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
```

---

## API Reference

### XAI SDK Core

#### `createExplainer(config: XAIConfig): XAIExplainer`

Create a new XAI explainer instance.

```typescript
const explainer = createExplainer({
  modelType: 'text',
  explanationType: 'feature_importance',
  topK: 15,
  threshold: 0.05,
});
```

#### `explainer.explain(input, prediction, modelOutput?): Promise<XAIExplanation>`

Generate an explanation for a prediction.

```typescript
const explanation = await explainer.explain(
  "What is quantum computing?",
  "Quantum computing is...",
  modelOutput
);
```

#### `explainPrediction(modelType, input, prediction, options?): Promise<XAIExplanation>`

Quick explanation helper for common use cases.

```typescript
const explanation = await explainPrediction(
  'text',
  userInput,
  modelResponse,
  { topK: 10 }
);
```

#### `compareExplanations(modelType, input, prediction, methods): Promise<Record<ExplanationType, XAIExplanation>>`

Compare multiple explanation methods.

```typescript
const comparisons = await compareExplanations(
  'text',
  input,
  prediction,
  ['feature_importance', 'attention', 'gradient']
);
```

### XAI Service

#### `getXAIService(): XAIService`

Get the singleton XAI service instance.

```typescript
const service = getXAIService();
```

#### `service.explainModelPrediction(prediction, config?): Promise<XAIExplanation>`

Explain a model prediction with auto-detection.

```typescript
const explanation = await service.explainModelPrediction({
  input: "Explain AI",
  output: "AI is...",
  modelId: "gpt-4o",
  provider: "openai",
});
```

#### `service.explainWithMultipleMethods(prediction, methods): Promise<Record<ExplanationType, XAIExplanation>>`

Get multiple explanations at once.

```typescript
const explanations = await service.explainWithMultipleMethods(
  prediction,
  ['feature_importance', 'attention']
);
```

#### `service.batchExplain(predictions, config?): Promise<XAIExplanation[]>`

Explain multiple predictions in batch.

```typescript
const explanations = await service.batchExplain([
  { input: "...", output: "...", modelId: "gpt-4o", provider: "openai" },
  { input: "...", output: "...", modelId: "claude-3.5", provider: "anthropic" },
]);
```

### Utility Functions

#### `explainAIResponse(input, output, modelId, provider?): Promise<XAIExplanation>`

Quick explain for AI responses.

```typescript
const explanation = await explainAIResponse(
  "What is machine learning?",
  "Machine learning is a subset of AI...",
  "gpt-4o",
  "openai"
);
```

#### `formatExplanationForUI(explanation): FormattedExplanation`

Format explanation for UI display.

```typescript
const formatted = formatExplanationForUI(explanation);
console.log(formatted.title);
console.log(formatted.summary);
console.log(formatted.topFeatures);
```

#### `exportExplanation(explanation, format): string`

Export explanation to JSON or CSV.

```typescript
const json = exportExplanation(explanation, 'json');
const csv = exportExplanation(explanation, 'csv');
```

---

## Usage Examples

### Example 1: Basic Feature Importance

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'text',
  explanationType: 'feature_importance',
  topK: 10,
});

const explanation = await explainer.explain(
  "Is this email spam?",
  "Yes, this appears to be spam",
  { confidence: 0.95 }
);

console.log(explanation.summary.explanation);
console.log(explanation.summary.topFeatures);
```

### Example 2: Attention Visualization

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'text',
  explanationType: 'attention',
  visualize: true,
});

const explanation = await explainer.explain(
  "The quick brown fox jumps over the lazy dog",
  "This is a pangram",
);

// Access attention matrix
const matrix = explanation.visualization?.data;
```

### Example 3: Model Comparison

```typescript
import { getXAIService } from '@/lib/xai-service';

const service = getXAIService();

const predictions = [
  {
    input: "What is AI?",
    output: "AI is artificial intelligence...",
    modelId: "gpt-4o",
    provider: "openai",
  },
  {
    input: "What is AI?",
    output: "Artificial intelligence refers to...",
    modelId: "claude-3.5-sonnet",
    provider: "anthropic",
  },
];

const comparisons = await service.compareModelExplanations(predictions);

comparisons.forEach(({ modelId, explanation }) => {
  console.log(`${modelId}:`, explanation.summary.topFeatures);
});
```

### Example 4: Integrated with Model Testing

```typescript
import { getXAIService } from '@/lib/xai-service';
import { callModel } from '@/lib/api-service';

async function explainModelResponse(prompt: string, modelId: string) {
  // Get model response
  const response = await callModel(modelId, prompt);
  
  // Generate explanation
  const service = getXAIService();
  const explanation = await service.explainModelPrediction({
    input: prompt,
    output: response.text,
    modelId,
    provider: 'openrouter',
    metadata: {
      tokens: response.usage?.total_tokens,
      confidence: 0.9,
    },
  });
  
  return {
    response,
    explanation,
  };
}

// Usage
const result = await explainModelResponse(
  "Explain quantum entanglement",
  "anthropic/claude-3.5-sonnet"
);
```

### Example 5: Batch Explanations

```typescript
import { getXAIService } from '@/lib/xai-service';

const service = getXAIService();

const predictions = [
  { input: "Query 1", output: "Response 1", modelId: "gpt-4o", provider: "openai" },
  { input: "Query 2", output: "Response 2", modelId: "gpt-4o", provider: "openai" },
  { input: "Query 3", output: "Response 3", modelId: "gpt-4o", provider: "openai" },
];

const explanations = await service.batchExplain(predictions);

// Process all explanations
explanations.forEach((exp, idx) => {
  console.log(`Prediction ${idx + 1}:`, exp.summary.explanation);
});
```

### Example 6: Vision Model Explanation

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'vision',
  explanationType: 'gradient',
  visualize: true,
});

const explanation = await explainer.explain(
  imageData, // Image input
  "This image contains a cat",
  { confidence: 0.92 }
);

// Get gradient heatmap
const heatmap = explanation.visualization?.data;
```

### Example 7: Code Model Explanation

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'code',
  explanationType: 'feature_importance',
  topK: 20,
});

const codeInput = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

const explanation = await explainer.explain(
  codeInput,
  "This is a recursive Fibonacci implementation",
);

// Get important code features
const features = explanation.featureImportances;
```

---

## Explanation Methods

### 1. Feature Importance (SHAP-style)

**Best for**: Understanding which input features contribute most to the prediction

**Use cases**:
- Text classification
- Sentiment analysis
- Content moderation

**Output**: List of features with importance scores (-1 to 1)

```typescript
{
  featureImportances: [
    { feature: 0, importance: 0.85, token: "urgent", position: 2 },
    { feature: 1, importance: -0.62, token: "maybe", position: 5 },
  ]
}
```

### 2. Attention Weights

**Best for**: Visualizing what the model focuses on

**Use cases**:
- Language understanding
- Machine translation
- Question answering

**Output**: Attention matrix showing token-to-token relationships

```typescript
{
  attentionWeights: [
    { from: 0, to: 3, weight: 0.92, fromToken: "The", toToken: "cat" },
  ]
}
```

### 3. Gradient Analysis

**Best for**: Understanding input sensitivity

**Use cases**:
- Image classification
- Anomaly detection
- Feature engineering

**Output**: Gradient values for each input feature

```typescript
{
  gradients: {
    gradient: [0.5, -0.3, 0.8],
    normalizedGradient: [0.625, -0.375, 1.0],
    maxGradient: 0.8,
    minGradient: -0.3,
  }
}
```

### 4. Integrated Gradients

**Best for**: Stable and comprehensive attributions

**Use cases**:
- Medical diagnosis
- Financial predictions
- High-stakes decisions

**Output**: Attribution scores along path from baseline

```typescript
{
  gradients: {
    inputId: 'integrated',
    gradient: [0.42, 0.31, 0.89],
    normalizedGradient: [0.47, 0.35, 1.0],
  }
}
```

### 5. Layer-wise Relevance Propagation (LRP)

**Best for**: Deep network explanations

**Use cases**:
- Deep learning models
- Computer vision
- Complex architectures

**Output**: Relevance scores per layer

```typescript
{
  lrp: {
    layerRelevances: [
      { layer: 0, name: "layer_0", relevance: [...], aggregatedRelevance: 12.5 },
      { layer: 1, name: "layer_1", relevance: [...], aggregatedRelevance: 8.3 },
    ],
    inputRelevance: [0.8, 0.6, 0.4],
  }
}
```

### 6. LIME

**Best for**: Local interpretability

**Use cases**:
- Black-box models
- Model debugging
- Trust building

**Output**: Local linear approximation

```typescript
{
  featureImportances: [
    { feature: 0, importance: 0.75, position: 0 },
    { feature: 1, importance: -0.45, position: 1 },
  ]
}
```

---

## Integration Guide

### Step 1: Import the SDK

```typescript
import { getXAIService } from '@/lib/xai-service';
```

### Step 2: Get Service Instance

```typescript
const xaiService = getXAIService();
```

### Step 3: Prepare Model Prediction

```typescript
const prediction = {
  input: userPrompt,
  output: modelResponse,
  modelId: 'gpt-4o',
  provider: 'openai',
  metadata: {
    tokens: 150,
    confidence: 0.95,
  },
};
```

### Step 4: Generate Explanation

```typescript
const explanation = await xaiService.explainModelPrediction(prediction);
```

### Step 5: Display Results

```typescript
import { formatExplanationForUI } from '@/lib/xai-service';

const formatted = formatExplanationForUI(explanation);

// Display in UI
console.log(formatted.title);
console.log(formatted.summary);
formatted.topFeatures.forEach(f => {
  console.log(`${f.label}: ${f.value}`);
});
```

### Integration with Existing Components

#### ModelHub Integration

Add XAI tab to the ModelHub dashboard:

```typescript
import { XAIExplainerDemo } from '@/components/XAIExplainerDemo';

// In ModelHubApp.tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="explore">Explore</TabsTrigger>
    <TabsTrigger value="test">Test</TabsTrigger>
    <TabsTrigger value="xai">Explainability</TabsTrigger>
  </TabsList>
  
  <TabsContent value="xai">
    <XAIExplainerDemo />
  </TabsContent>
</Tabs>
```

#### API Testing Integration

Add explanation button to ApiTester:

```typescript
import { explainAIResponse } from '@/lib/xai-service';

async function handleExplain() {
  const explanation = await explainAIResponse(
    requestData.prompt,
    responseData.text,
    selectedModel,
    provider
  );
  
  setExplanation(explanation);
}
```

---

## Best Practices

### 1. Choose the Right Explanation Type

- **Text models**: Use `attention` or `feature_importance`
- **Vision models**: Use `gradient` or `integrated_gradients`
- **Code models**: Use `feature_importance` or `lime`
- **Multimodal models**: Use `integrated_gradients`

### 2. Set Appropriate Parameters

```typescript
const config = {
  topK: 10,        // 5-20 features for most use cases
  threshold: 0.01, // Filter out noise (0.01-0.05)
  visualize: true, // Enable for UI display
  includeRaw: false, // Only for debugging
};
```

### 3. Handle Async Operations

```typescript
try {
  const explanation = await xaiService.explainModelPrediction(prediction);
  // Process explanation
} catch (error) {
  console.error('Explanation failed:', error);
  // Fallback logic
}
```

### 4. Cache Explanations

```typescript
const explanationCache = new Map<string, XAIExplanation>();

async function getCachedExplanation(key: string, prediction: ModelPrediction) {
  if (explanationCache.has(key)) {
    return explanationCache.get(key)!;
  }
  
  const explanation = await xaiService.explainModelPrediction(prediction);
  explanationCache.set(key, explanation);
  
  return explanation;
}
```

### 5. Batch Processing

For multiple explanations, use batch methods:

```typescript
// Good - batch processing
const explanations = await xaiService.batchExplain(predictions);

// Avoid - sequential processing
for (const pred of predictions) {
  const exp = await xaiService.explainModelPrediction(pred);
}
```

### 6. Export for Analysis

```typescript
import { exportExplanation } from '@/lib/xai-service';

// Export to JSON for further analysis
const json = exportExplanation(explanation, 'json');
localStorage.setItem('explanation', json);

// Export to CSV for spreadsheet analysis
const csv = exportExplanation(explanation, 'csv');
downloadFile(csv, 'explanation.csv');
```

---

## Troubleshooting

### Issue: Explanation takes too long

**Solution**: Reduce `topK` or disable `visualize`

```typescript
const config = {
  topK: 5,
  visualize: false,
};
```

### Issue: Low-quality explanations

**Solution**: Adjust threshold or use different explanation type

```typescript
const config = {
  threshold: 0.05, // Increase to filter noise
  explanationType: 'integrated_gradients', // More stable
};
```

### Issue: Memory issues with batch processing

**Solution**: Process in smaller chunks

```typescript
const BATCH_SIZE = 10;

for (let i = 0; i < predictions.length; i += BATCH_SIZE) {
  const batch = predictions.slice(i, i + BATCH_SIZE);
  const explanations = await xaiService.batchExplain(batch);
  // Process explanations
}
```

### Issue: Inconsistent results

**Solution**: Use integrated gradients for stability

```typescript
const explainer = createExplainer({
  modelType: 'text',
  explanationType: 'integrated_gradients', // Most stable method
});
```

---

## Advanced Topics

### Custom Explanation Types

Extend the SDK with custom methods:

```typescript
import { XAIExplainer } from '@/lib/xai-sdk';

class CustomExplainer extends XAIExplainer {
  async explainCustom(input: any, prediction: any) {
    // Custom explanation logic
    return customExplanation;
  }
}
```

### Integration with External Tools

Export to popular XAI tools:

```typescript
function exportToSHAP(explanation: XAIExplanation) {
  const shapData = {
    values: explanation.featureImportances?.map(f => f.importance),
    features: explanation.featureImportances?.map(f => f.token),
  };
  
  return shapData;
}
```

### Real-time Explanations

Stream explanations as they're computed:

```typescript
async function* streamExplanation(prediction: ModelPrediction) {
  const service = getXAIService();
  const methods: ExplanationType[] = ['feature_importance', 'attention', 'gradient'];
  
  for (const method of methods) {
    const explanation = await service.explainModelPrediction(prediction, {
      explanationType: method,
    });
    
    yield explanation;
  }
}

// Usage
for await (const explanation of streamExplanation(prediction)) {
  updateUI(explanation);
}
```

---

## Support & Resources

- **GitHub Issues**: Report bugs or request features
- **Documentation**: This guide and inline code comments
- **Examples**: See `XAIExplainerDemo.tsx` for interactive examples

## License

MIT License - See LICENSE file for details

---

**Last Updated**: 2025-12-30  
**Version**: 1.0.0
