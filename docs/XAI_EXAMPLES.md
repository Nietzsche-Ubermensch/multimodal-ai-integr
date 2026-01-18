# XAI SDK - Quick Start Examples

## Example 1: Basic Feature Importance

```typescript
import { explainAIResponse } from '@/lib/xai-service';

// Generate explanation for a model prediction
const explanation = await explainAIResponse(
  "What is quantum computing?",
  "Quantum computing is a type of computation that harnesses quantum mechanics...",
  "gpt-4o",
  "openai"
);

// View top contributing features
console.log(explanation.summary.explanation);
explanation.summary.topFeatures.forEach(feature => {
  console.log(`${feature.feature}: ${feature.score}`);
});
```

## Example 2: Compare Multiple Models

```typescript
import { getXAIService } from '@/lib/xai-service';

const service = getXAIService();

const predictions = [
  {
    input: "Explain AI",
    output: "AI is artificial intelligence...",
    modelId: "gpt-4o",
    provider: "openai",
  },
  {
    input: "Explain AI",
    output: "Artificial intelligence refers to...",
    modelId: "claude-3.5-sonnet",
    provider: "anthropic",
  },
];

const comparisons = await service.compareModelExplanations(predictions);

comparisons.forEach(({ modelId, explanation }) => {
  console.log(`\n${modelId}:`);
  console.log(explanation.summary.explanation);
});
```

## Example 3: Multiple Explanation Methods

```typescript
import { getXAIService } from '@/lib/xai-service';

const service = getXAIService();

const prediction = {
  input: "Is this email spam?",
  output: "Yes, this appears to be spam",
  modelId: "gpt-4o",
  provider: "openai",
};

const explanations = await service.explainWithMultipleMethods(
  prediction,
  ['feature_importance', 'attention', 'gradient']
);

// Compare different explanation methods
for (const [method, explanation] of Object.entries(explanations)) {
  console.log(`\n${method}:`);
  console.log(explanation.summary.explanation);
}
```

## Example 4: Export Explanations

```typescript
import { explainAIResponse, exportExplanation } from '@/lib/xai-service';

const explanation = await explainAIResponse(
  "Classify this text",
  "Positive sentiment detected",
  "claude-3.5-sonnet",
  "anthropic"
);

// Export to JSON
const json = exportExplanation(explanation, 'json');
console.log(json);

// Export to CSV for spreadsheet analysis
const csv = exportExplanation(explanation, 'csv');
console.log(csv);
```

## Example 5: Vision Model Explanation

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'vision',
  explanationType: 'gradient',
  visualize: true,
});

const explanation = await explainer.explain(
  imageData,
  "This image contains a cat",
  { confidence: 0.92 }
);

// Get gradient heatmap for visualization
if (explanation.visualization) {
  console.log('Visualization type:', explanation.visualization.type);
  console.log('Heatmap data:', explanation.visualization.data);
}
```

## Example 6: Code Model Explanation

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
explanation.featureImportances?.forEach(feature => {
  console.log(`${feature.token}: ${feature.importance}`);
});
```

## Example 7: Interactive UI Component

```tsx
import { XAIExplainerDemo } from '@/components/XAIExplainerDemo';

function MyApp() {
  return (
    <div>
      <h1>AI Explainability Demo</h1>
      <XAIExplainerDemo />
    </div>
  );
}
```

## Example 8: Batch Processing

```typescript
import { getXAIService } from '@/lib/xai-service';

const service = getXAIService();

const predictions = [
  { input: "Query 1", output: "Response 1", modelId: "gpt-4o", provider: "openai" },
  { input: "Query 2", output: "Response 2", modelId: "gpt-4o", provider: "openai" },
  { input: "Query 3", output: "Response 3", modelId: "gpt-4o", provider: "openai" },
];

// Process all predictions at once
const explanations = await service.batchExplain(predictions);

explanations.forEach((exp, idx) => {
  console.log(`Prediction ${idx + 1}:`, exp.summary.explanation);
});
```

## Example 9: Custom Configuration

```typescript
import { createExplainer } from '@/lib/xai-sdk';

const explainer = createExplainer({
  modelType: 'text',
  explanationType: 'integrated_gradients',
  topK: 15,
  threshold: 0.05,
  visualize: true,
  includeRaw: true, // For debugging
});

const explanation = await explainer.explain(
  "Your input text",
  "Model prediction"
);

// Access raw computation data
if (explanation.gradients) {
  console.log('Raw gradients:', explanation.gradients.gradient);
  console.log('Normalized gradients:', explanation.gradients.normalizedGradient);
}
```

## Example 10: Integration with ModelHub

```typescript
import { getXAIService } from '@/lib/xai-service';
import { testModel } from '@/lib/modelhub-service';

async function testWithExplanation(modelId: string, prompt: string) {
  // Test the model
  const response = await testModel(modelId, prompt);
  
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
const result = await testWithExplanation(
  "anthropic/claude-3.5-sonnet",
  "Explain quantum entanglement"
);

console.log('Response:', result.response.text);
console.log('Explanation:', result.explanation.summary.explanation);
```

## Running the Examples

All examples can be tested in the interactive XAI Explainer Demo:

1. Navigate to the ModelHub Dashboard
2. Click on the "XAI" tab
3. Enter your input and model output
4. Select an explanation method
5. Click "Generate Explanation"
6. View the results, export, or compare methods

For more details, see the [XAI SDK Guide](./XAI_SDK_GUIDE.md).
