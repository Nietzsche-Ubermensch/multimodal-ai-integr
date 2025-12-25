import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Stop,
  Copy,
  Check,
  Lightning,
  Sparkle,
  PaperPlane,
  ArrowsClockwise,
  ChartLine,
  Clock,
  Hash
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StreamingModel {
  provider: string;
  model: string;
  displayName: string;
  description: string;
  supportsStreaming: boolean;
  color: string;
}

const streamingModels: StreamingModel[] = [
  {
    provider: "perplexity",
    model: "perplexity/sonar-pro",
    displayName: "Perplexity Sonar Pro",
    description: "Real-time search with streaming",
    supportsStreaming: true,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  },
  {
    provider: "openrouter",
    model: "openrouter/anthropic/claude-3-opus",
    displayName: "Claude 3 Opus",
    description: "Advanced reasoning with streaming",
    supportsStreaming: true,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    provider: "openrouter",
    model: "openrouter/openai/gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    description: "Fast, capable streaming responses",
    supportsStreaming: true,
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  {
    provider: "nvidia_nim",
    model: "nvidia_nim/meta/llama3-70b-instruct",
    displayName: "Llama 3 70B (NVIDIA)",
    description: "High-performance streaming inference",
    supportsStreaming: true,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    provider: "xai",
    model: "xai/grok-4-fast",
    displayName: "Grok 4 Fast",
    description: "Ultra-fast streaming responses",
    supportsStreaming: true,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  },
  {
    provider: "huggingface",
    model: "huggingface/together/deepseek-ai/DeepSeek-R1",
    displayName: "DeepSeek R1",
    description: "Reasoning with streaming support",
    supportsStreaming: true,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }
];

interface TokenMetrics {
  totalTokens: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedCompletion: number;
}

export function StreamingApiTester() {
  const [selectedModel, setSelectedModel] = useState(streamingModels[0].model);
  const [prompt, setPrompt] = useState("Write a detailed explanation of how neural networks learn through backpropagation.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [metrics, setMetrics] = useState<TokenMetrics>({
    totalTokens: 0,
    tokensPerSecond: 0,
    elapsedTime: 0,
    estimatedCompletion: 0
  });
  const [copied, setCopied] = useState(false);
  const [enableSimulation, setEnableSimulation] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  
  const streamRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentModel = streamingModels.find(m => m.model === selectedModel)!;

  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedResponse, isStreaming]);

  const simulateStreaming = async () => {
    const sampleResponses: Record<string, string> = {
      "perplexity/sonar-pro": "Neural networks learn through backpropagation, a fundamental algorithm that enables efficient training of multi-layer networks. The process involves three key phases:\n\n**Forward Pass**: Input data flows through the network layer by layer. Each neuron applies its weights to inputs, adds a bias, and passes the result through an activation function. This continues until reaching the output layer, producing a prediction.\n\n**Loss Calculation**: The network's prediction is compared against the true target using a loss function (e.g., mean squared error for regression, cross-entropy for classification). This quantifies how wrong the prediction is.\n\n**Backward Pass (Backpropagation)**: This is where learning happens. Using the chain rule from calculus, the algorithm calculates how much each weight contributed to the error. It starts at the output layer and propagates backwards through the network, computing gradients for each weight.\n\n**Weight Updates**: Using gradient descent, weights are adjusted in the direction that reduces loss. The learning rate controls the step size. The formula is: new_weight = old_weight - (learning_rate × gradient).\n\n**Key Mathematical Insight**: For a weight w connecting neurons, the gradient is ∂Loss/∂w = ∂Loss/∂output × ∂output/∂w. The chain rule allows decomposition of this derivative through all intermediate layers.\n\n**Practical Considerations**: Modern implementations use mini-batch gradient descent, momentum optimizers (Adam, RMSprop), and techniques like dropout and batch normalization to improve convergence and generalization.\n\nThis iterative process—forward pass, loss calculation, backpropagation, weight update—repeats for thousands or millions of examples until the network converges to a solution that minimizes the loss function. [Sources: Deep Learning (Goodfellow et al.), Neural Networks and Deep Learning (Nielsen)]",
      
      "openrouter/anthropic/claude-3-opus": "Backpropagation is the cornerstone algorithm that enables neural networks to learn from data. Let me break down this elegant mathematical process:\n\n**The Learning Problem**\nImagine you have a neural network trying to recognize handwritten digits. Initially, its weights are random, so predictions are terrible. Backpropagation systematically adjusts these weights to improve accuracy.\n\n**Forward Propagation First**\nBefore learning, the network makes a prediction:\n1. Input layer receives raw data (pixel values)\n2. Each subsequent layer applies: output = activation(weights × inputs + bias)\n3. Final layer produces a prediction\n\n**Computing the Error**\nWe calculate how wrong the prediction is using a loss function L. For example, if the network predicts \"3\" but the digit is actually \"8\", the loss is high.\n\n**The Backward Pass (Backpropagation)**\nHere's where the magic happens. We need to know how changing each weight affects the total error. Using calculus's chain rule:\n\nFor the output layer:\n∂L/∂w_output = ∂L/∂prediction × ∂prediction/∂w_output\n\nFor hidden layers, we chain through multiple layers:\n∂L/∂w_hidden = ∂L/∂output × ∂output/∂hidden × ∂hidden/∂w_hidden\n\nThis \"backward\" flow of gradients gives the algorithm its name.\n\n**Gradient Descent Update**\nOnce we know each weight's gradient (its contribution to error), we update:\nw_new = w_old - η × ∂L/∂w\n\nwhere η (eta) is the learning rate—a small number like 0.001.\n\n**Why It Works**\nThe gradient points in the direction of steepest increase in loss. By moving in the opposite direction (negative gradient), we descend toward a minimum in the loss landscape.\n\n**Modern Enhancements**\n- **Stochastic Gradient Descent (SGD)**: Updates weights after each mini-batch rather than the full dataset\n- **Adam Optimizer**: Adapts learning rates per parameter using momentum and variance estimates\n- **Batch Normalization**: Normalizes intermediate activations to speed up training\n- **Gradient Clipping**: Prevents exploding gradients in deep networks\n\n**Computational Efficiency**\nBackpropagation is remarkably efficient. Computing all gradients requires only about twice the computation of the forward pass, regardless of network depth. This efficiency made training deep networks practical.\n\n**Limitations and Solutions**\n- Vanishing gradients (solved by ReLU activations, ResNets)\n- Local minima (surprisingly less problematic in high dimensions)\n- Overfitting (addressed with regularization, dropout)\n\nThis algorithm, first formalized in the 1980s but with roots in earlier work, remains the foundation of modern deep learning despite being conceptually simple: measure error, compute gradients, update weights, repeat.",
      
      "openrouter/openai/gpt-4-turbo": "Backpropagation is the fundamental learning algorithm for neural networks. Let me explain how it works step-by-step.\n\n**Overview**\nBackpropagation allows neural networks to learn by computing gradients of the loss function with respect to each weight, then using these gradients to update weights via gradient descent.\n\n**The Process**\n\n1. **Forward Pass**\n   - Input data flows through the network\n   - Each layer computes: z = Wx + b (linear transformation)\n   - Then applies activation: a = σ(z)\n   - Output layer produces prediction ŷ\n\n2. **Loss Calculation**\n   - Compare prediction ŷ to true label y\n   - Compute loss: L = loss_function(ŷ, y)\n   - Common loss functions: MSE for regression, cross-entropy for classification\n\n3. **Backward Pass (Backpropagation)**\n   - Start at output layer\n   - Compute error: δ^L = ∂L/∂z^L = (a^L - y) ⊙ σ'(z^L)\n   - Propagate backwards: δ^l = ((W^(l+1))^T δ^(l+1)) ⊙ σ'(z^l)\n   - Calculate weight gradients: ∂L/∂W^l = δ^l (a^(l-1))^T\n\n4. **Weight Update**\n   - Apply gradient descent: W := W - α ∂L/∂W\n   - α is the learning rate (typically 0.001 - 0.1)\n\n**Mathematical Foundation**\nThe chain rule is central to backpropagation:\n\n∂L/∂W^l = ∂L/∂a^L × ∂a^L/∂z^L × ... × ∂z^l/∂W^l\n\nThis decomposes the complex derivative into manageable local computations.\n\n**Why \"Back\" Propagation?**\nGradients are computed starting from the output layer and moving backward through the network. This backward flow reuses computations efficiently.\n\n**Computational Complexity**\nFor a network with L layers and n neurons per layer:\n- Forward pass: O(Ln²)\n- Backward pass: O(Ln²)\n- Total: O(Ln²) - very efficient!\n\n**Key Insights**\n1. Each neuron's gradient depends only on:\n   - Gradients from neurons it feeds into\n   - Its own activation derivative\n   - Its inputs\n\n2. Gradients can be computed in one backward sweep through the network\n\n3. The algorithm is automatic - works for any network architecture\n\n**Training Loop**\n```\nfor each epoch:\n    for each batch:\n        1. Forward pass: compute predictions\n        2. Compute loss\n        3. Backward pass: compute gradients\n        4. Update weights\n```\n\n**Modern Optimizations**\n- **Mini-batch gradient descent**: Balance between stochastic and batch\n- **Momentum**: Accelerates convergence by accumulating velocity\n- **Adam**: Combines momentum with adaptive learning rates\n- **Learning rate scheduling**: Decay learning rate over time\n\n**Common Challenges**\n- **Vanishing gradients**: Gradients become very small in deep networks (solved with ReLU, skip connections)\n- **Exploding gradients**: Gradients become very large (solved with gradient clipping)\n- **Saddle points**: Flat regions where gradients are near zero\n\nBackpropagation transformed neural networks from a theoretical curiosity into the powerful tool that drives modern AI applications.",
      
      "nvidia_nim/meta/llama3-70b-instruct": "Backpropagation is the algorithm that makes deep learning possible. Here's a comprehensive explanation:\n\n**The Core Idea**\nNeural networks learn by adjusting internal parameters (weights and biases) to minimize the difference between predictions and actual outputs. Backpropagation efficiently computes how to adjust each parameter.\n\n**Step-by-Step Process**\n\n**1. Initialization**\n- Weights are randomly initialized (e.g., Xavier or He initialization)\n- Prevents symmetry and enables learning\n\n**2. Forward Propagation**\n- Input x₀ enters the network\n- Layer 1: z₁ = W₁x₀ + b₁, then a₁ = σ(z₁)\n- Layer 2: z₂ = W₂a₁ + b₂, then a₂ = σ(z₂)\n- Continue through all layers to output ŷ\n\n**3. Loss Computation**\n- For regression: L = ½ ||ŷ - y||²\n- For classification: L = -Σ y_i log(ŷ_i)\n- Measures prediction error\n\n**4. Backward Propagation**\nThis is where gradients are computed backwards:\n\nOutput layer gradient:\n```\nδ_L = ∂L/∂z_L = (a_L - y) ⊙ σ'(z_L)\n```\n\nHidden layer gradients (chain rule):\n```\nδ_l = (W_{l+1}^T δ_{l+1}) ⊙ σ'(z_l)\n```\n\nWeight and bias gradients:\n```\n∂L/∂W_l = δ_l × a_{l-1}^T\n∂L/∂b_l = δ_l\n```\n\n**5. Parameter Update**\n```\nW_l := W_l - α ∂L/∂W_l\nb_l := b_l - α ∂L/∂b_l\n```\n\n**Mathematical Intuition**\nThe chain rule allows us to decompose complex derivatives:\n\n∂L/∂W₁ = ∂L/∂ŷ × ∂ŷ/∂z₃ × ∂z₃/∂a₂ × ∂a₂/∂z₂ × ∂z₂/∂a₁ × ∂a₁/∂z₁ × ∂z₁/∂W₁\n\nBackpropagation computes this efficiently by caching intermediate values during the forward pass.\n\n**Efficiency Analysis**\nWithout backpropagation, computing gradients would require:\n- One forward pass per parameter: O(np) operations where n = network size, p = parameters\n\nWith backpropagation:\n- One forward pass + one backward pass: O(n) operations\n- Speedup: O(p) times faster!\n\n**Practical Implementation Tips**\n1. **Gradient checking**: Verify implementation with numerical gradients\n2. **Batch processing**: Process multiple examples simultaneously\n3. **Gradient accumulation**: Sum gradients over mini-batch before updating\n4. **Learning rate tuning**: Critical hyperparameter (try 0.1, 0.01, 0.001)\n\n**Advanced Concepts**\n- **Automatic differentiation**: Modern frameworks (PyTorch, TensorFlow) compute gradients automatically\n- **Computational graphs**: Represent operations as DAG, enabling efficient gradient computation\n- **Second-order methods**: Use Hessian information (L-BFGS, natural gradient)\n\nBackpropagation, combined with gradient descent, enables networks with billions of parameters to learn complex patterns from data.",
      
      "xai/grok-4-fast": "**Backpropagation: The Engine of Deep Learning**\n\nBackpropagation is the algorithm that revolutionized neural networks by making them trainable. Let's dive deep.\n\n**The Challenge**\nYou have a neural network with millions of parameters. How do you adjust each one to improve performance? Trying random changes would take forever. Backpropagation solves this elegantly.\n\n**The Algorithm in Four Acts**\n\n**Act 1: Forward Pass**\nData flows forward through the network:\n- Input layer: Raw features (e.g., pixel values)\n- Hidden layers: Each neuron computes weighted sum + bias, then applies activation\n- Output layer: Final prediction\n\nMathematically: a^(l) = σ(W^(l) a^(l-1) + b^(l))\n\n**Act 2: Loss Measurement**\nHow bad is our prediction?\n- Classification: Cross-entropy loss\n- Regression: Mean squared error\n- The loss L quantifies the gap between prediction and reality\n\n**Act 3: Backward Pass (The Heart of Backpropagation)**\nWe need ∂L/∂W for every weight. Direct calculation is infeasible.\n\nSolution: Chain rule + dynamic programming\n\nStart at output:\nδ^(L) = ∇_a L ⊙ σ'(z^(L))\n\nPropagate backward:\nδ^(l) = ((W^(l+1))^T δ^(l+1)) ⊙ σ'(z^(l))\n\nCompute weight gradients:\n∂L/∂W^(l) = δ^(l) (a^(l-1))^T\n∂L/∂b^(l) = δ^(l)\n\n**Act 4: Gradient Descent**\nUpdate parameters in the direction that reduces loss:\nW := W - η ∇_W L\n\n**Why It's Brilliant**\n1. **Efficiency**: Computes all gradients in one backward pass\n2. **Generality**: Works for any differentiable network architecture\n3. **Composability**: Automatically handles complex compositions of functions\n\n**The Chain Rule Connection**\nBackpropagation is essentially the chain rule applied systematically:\n\nFor weight in layer 1 of a 3-layer network:\n∂L/∂W₁ = ∂L/∂a₃ · ∂a₃/∂z₃ · ∂z₃/∂a₂ · ∂a₂/∂z₂ · ∂z₂/∂a₁ · ∂a₁/∂z₁ · ∂z₁/∂W₁\n\nEach term is computed locally and passed backward.\n\n**Historical Context**\n- 1970s: Basic ideas emerged\n- 1986: Rumelhart, Hinton, Williams popularized it\n- 2010s: Combined with big data and GPUs, enabled deep learning revolution\n\n**Modern Enhancements**\n\n**Optimizers Beyond SGD:**\n- **Momentum**: Accelerates through consistent gradient directions\n- **RMSprop**: Adapts learning rate per parameter\n- **Adam**: Combines momentum + adaptive learning rates (most popular)\n\n**Regularization:**\n- **L2 regularization**: Penalizes large weights\n- **Dropout**: Randomly disables neurons during training\n- **Batch normalization**: Normalizes layer inputs\n\n**Handling Challenges:**\n- **Vanishing gradients**: Use ReLU, residual connections\n- **Exploding gradients**: Apply gradient clipping\n- **Poor convergence**: Try learning rate schedules, better initialization\n\n**Code Example (Conceptual):**\n```python\nfor epoch in range(num_epochs):\n    for batch in data_loader:\n        # Forward\n        predictions = model(batch.inputs)\n        loss = criterion(predictions, batch.targets)\n        \n        # Backward (automatic in PyTorch)\n        loss.backward()  # Computes all gradients via backprop\n        \n        # Update\n        optimizer.step()  # Applies gradient descent\n        optimizer.zero_grad()  # Reset gradients\n```\n\n**Key Takeaway**\nBackpropagation transforms the impossible task of manually tuning billions of parameters into an efficient, automated process. It's the reason we can train networks with hundreds of layers and billions of parameters that power modern AI systems.",
      
      "huggingface/together/deepseek-ai/DeepSeek-R1": "Let me provide a thorough explanation of backpropagation with reasoning.\n\n**Understanding the Problem**\nNeural networks contain numerous interconnected neurons across multiple layers. Each connection has a weight that determines its importance. The fundamental question: how do we adjust millions of weights to make the network produce correct outputs?\n\n**The Backpropagation Solution**\n\n**Phase 1: Forward Propagation**\nInformation flows from input to output:\n1. Input layer receives features\n2. Each hidden layer neuron computes: output = activation(Σ(weight_i × input_i) + bias)\n3. Output layer produces predictions\n\nExample: For image classification, pixels → edges → shapes → objects → class probabilities\n\n**Phase 2: Error Calculation**\nMeasure how wrong the network is:\n- Loss function L(ŷ, y) quantifies error\n- For classification: cross-entropy\n- For regression: mean squared error\n\n**Phase 3: Backpropagation (The Core Innovation)**\nWe need to compute ∂L/∂w for every weight w to know how to adjust it.\n\nNaive approach: Finite differences\n- For each weight, slightly change it and measure impact on loss\n- Complexity: O(number_of_weights × network_depth)\n- Infeasible for large networks\n\nBackpropagation approach: Chain rule + memoization\n- Compute gradients in reverse order (output → input)\n- Reuse intermediate calculations\n- Complexity: O(network_depth)\n- Efficient and elegant!\n\n**The Mathematics**\n\nFor output layer:\nδ^(L) = ∂L/∂z^(L) = (a^(L) - y) ⊙ σ'(z^(L))\n\nFor hidden layer l:\nδ^(l) = ((W^(l+1))^T δ^(l+1)) ⊙ σ'(z^(l))\n\nGradient for weights:\n∂L/∂W^(l) = δ^(l) (a^(l-1))^T\n\nGradient for biases:\n∂L/∂b^(l) = δ^(l)\n\n**Intuitive Understanding**\nThink of the network as a complex function composition:\nf(x) = f_L(f_{L-1}(...f_2(f_1(x))))\n\nThe chain rule tells us:\ndf/dx = (df_L/df_{L-1}) × (df_{L-1}/df_{L-2}) × ... × (df_1/dx)\n\nBackpropagation computes this by working backwards, storing intermediate derivatives.\n\n**Why \"Backward\"?**\nConsider computing ∂L/∂W_1 (weight in first layer):\n- Forward pass: W_1 → a_1 → W_2 → a_2 → ... → a_L → L\n- Backward pass: L → ∂L/∂a_L → ∂L/∂W_L → ... → ∂L/∂a_1 → ∂L/∂W_1\n\nThe backward direction is necessary because:\n1. Loss is defined at the output\n2. Chain rule naturally decomposes backward\n3. Intermediate gradients can be reused\n\n**Phase 4: Gradient Descent**\nOnce gradients are known:\nW_new = W_old - learning_rate × ∂L/∂W\n\nThe negative gradient points toward the direction of steepest descent in the loss landscape.\n\n**Computational Efficiency**\nFor a network with:\n- L layers\n- n neurons per layer\n- Total parameters: p\n\nNaive gradient computation: O(p × forward_pass_cost)\nBackpropagation: O(forward_pass_cost)\n\nSpeedup: Roughly p times faster!\n\n**Practical Considerations**\n\n**Batch Processing:**\n```\nInstead of: process one example → compute gradients → update\nWe do: process batch → average gradients → update\n```\nBenefits: Better gradient estimates, faster computation (vectorization), smoother convergence\n\n**Learning Rate:**\n- Too high: Oscillation, divergence\n- Too low: Slow convergence, stuck in local minima\n- Solution: Adaptive methods (Adam), learning rate schedules\n\n**Common Issues and Solutions:**\n\n1. **Vanishing Gradients**\n   - Problem: Gradients become extremely small in deep networks\n   - Cause: Repeated multiplication of small derivatives\n   - Solutions: ReLU activation, residual connections (ResNet), batch normalization\n\n2. **Exploding Gradients**\n   - Problem: Gradients become extremely large\n   - Cause: Repeated multiplication of large derivatives\n   - Solutions: Gradient clipping, careful initialization\n\n3. **Local Minima**\n   - In high dimensions, most critical points are saddle points, not local minima\n   - Momentum helps escape flat regions\n\n**Modern Framework Implementation**\nModern libraries (PyTorch, TensorFlow) implement automatic differentiation:\n\n```python\nimport torch\n\n# Define model\nmodel = torch.nn.Sequential(\n    torch.nn.Linear(784, 128),\n    torch.nn.ReLU(),\n    torch.nn.Linear(128, 10)\n)\n\n# Forward pass\noutput = model(input)\nloss = criterion(output, target)\n\n# Backward pass (automatic backpropagation!)\nloss.backward()\n\n# Update weights\noptimizer.step()\n```\n\nThe `.backward()` call automatically computes all gradients using backpropagation.\n\n**Conclusion**\nBackpropagation is a brilliant application of calculus and dynamic programming that makes training deep neural networks feasible. It transforms an intractable optimization problem into an efficient algorithm that powers modern AI. Understanding backpropagation is essential for anyone working with neural networks, as it reveals both the power and limitations of gradient-based learning."
    };

    const responseText = sampleResponses[selectedModel] || sampleResponses["perplexity/sonar-pro"];
    const words = responseText.split(" ");
    
    streamRef.current = true;
    setStreamedResponse("");
    setMetrics({ totalTokens: 0, tokensPerSecond: 0, elapsedTime: 0, estimatedCompletion: 0 });
    startTimeRef.current = Date.now();
    tokenCountRef.current = 0;

    for (let i = 0; i < words.length && streamRef.current; i++) {
      const word = i === 0 ? words[i] : ` ${words[i]}`;
      
      setStreamedResponse(prev => prev + word);
      tokenCountRef.current++;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const tps = tokenCountRef.current / elapsed;
      const remaining = words.length - tokenCountRef.current;
      const eta = remaining / tps;

      setMetrics({
        totalTokens: tokenCountRef.current,
        tokensPerSecond: tps,
        elapsedTime: elapsed,
        estimatedCompletion: eta
      });

      const baseDelay = 30;
      const randomVariation = Math.random() * 40;
      await new Promise(resolve => setTimeout(resolve, baseDelay + randomVariation));
    }

    streamRef.current = false;
    setIsStreaming(false);
    toast.success("Streaming completed!");
  };

  const handleStartStreaming = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsStreaming(true);
    setStreamedResponse("");
    setMetrics({ totalTokens: 0, tokensPerSecond: 0, elapsedTime: 0, estimatedCompletion: 0 });
    
    try {
      if (enableSimulation) {
        await simulateStreaming();
      } else {
        toast.error("Real API streaming requires backend implementation");
        setIsStreaming(false);
      }
    } catch (error) {
      toast.error("Streaming failed");
      setIsStreaming(false);
    }
  };

  const handleStopStreaming = () => {
    streamRef.current = false;
    setIsStreaming(false);
    toast.info("Streaming stopped");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(streamedResponse);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="text-accent" weight="duotone" size={24} />
            Streaming API with Real-Time Token Display
          </CardTitle>
          <CardDescription>
            Experience live streaming responses with token-level metrics and performance analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkle size={16} className="text-accent" />
                  Select Streaming Model
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {streamingModels.map(model => (
                      <SelectItem key={model.model} value={model.model}>
                        <div className="flex items-center gap-2">
                          <span>{model.displayName}</span>
                          {model.supportsStreaming && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Lightning size={10} weight="fill" />
                              Streaming
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {currentModel.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Your Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything..."
                  className="min-h-[120px] font-sans"
                  disabled={isStreaming}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Temperature: {temperature.toFixed(2)}</Label>
                    <Badge variant="outline" className="text-xs">
                      {temperature < 0.3 ? "Focused" : temperature < 0.7 ? "Balanced" : "Creative"}
                    </Badge>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(val[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={isStreaming}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Max Tokens: {maxTokens}</Label>
                    <Badge variant="outline" className="text-xs font-mono">
                      {maxTokens}
                    </Badge>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={(val) => setMaxTokens(val[0])}
                    min={100}
                    max={4000}
                    step={100}
                    disabled={isStreaming}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={enableSimulation}
                    onCheckedChange={setEnableSimulation}
                    disabled={isStreaming}
                  />
                  <div>
                    <Label className="text-sm font-medium">Simulation Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      {enableSimulation ? "Using simulated streaming" : "Real API (requires backend)"}
                    </p>
                  </div>
                </div>
                <Badge variant={enableSimulation ? "secondary" : "default"} className="gap-1">
                  {enableSimulation ? (
                    <>
                      <ArrowsClockwise size={12} />
                      Demo
                    </>
                  ) : (
                    <>
                      <Lightning size={12} weight="fill" />
                      Live
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button
                    onClick={handleStartStreaming}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Play size={20} weight="fill" />
                    Start Streaming
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopStreaming}
                    variant="destructive"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Stop size={20} weight="fill" />
                    Stop Streaming
                  </Button>
                )}
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="lg"
                  disabled={!streamedResponse}
                  className="gap-2"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ChartLine className="text-accent" size={16} />
                    Live Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tokens Generated</span>
                      <Badge variant="outline" className="font-mono gap-1">
                        <Hash size={12} />
                        {metrics.totalTokens}
                      </Badge>
                    </div>
                    <Progress 
                      value={(metrics.totalTokens / maxTokens) * 100} 
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lightning size={14} />
                        Tokens/Second
                      </span>
                      <span className="text-sm font-mono font-bold text-accent">
                        {metrics.tokensPerSecond.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={14} />
                        Elapsed Time
                      </span>
                      <span className="text-sm font-mono">
                        {formatTime(metrics.elapsedTime)}
                      </span>
                    </div>

                    {isStreaming && metrics.estimatedCompletion > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">ETA</span>
                        <span className="text-sm font-mono text-green-400">
                          ~{formatTime(metrics.estimatedCompletion)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <Badge 
                        variant={isStreaming ? "default" : streamedResponse ? "secondary" : "outline"}
                        className="gap-1"
                      >
                        {isStreaming ? (
                          <>
                            <Lightning size={10} weight="fill" className="animate-pulse" />
                            Streaming
                          </>
                        ) : streamedResponse ? (
                          <>
                            <Check size={10} weight="bold" />
                            Complete
                          </>
                        ) : (
                          "Ready"
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs text-muted-foreground">Model Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <Badge variant="outline" className="text-xs">
                      {currentModel.provider}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-mono text-xs">{currentModel.model.split('/').pop()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Streaming</span>
                    {currentModel.supportsStreaming ? (
                      <Check className="text-green-400" size={14} weight="bold" />
                    ) : (
                      <span className="text-xs">Not supported</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <PaperPlane className="text-accent" size={16} />
                Streaming Response
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showMetrics}
                  onCheckedChange={setShowMetrics}
                  id="show-metrics"
                />
                <Label htmlFor="show-metrics" className="text-xs cursor-pointer">
                  Show inline metrics
                </Label>
              </div>
            </div>

            <Card className="min-h-[400px] max-h-[600px] border-accent/30">
              <ScrollArea className="h-[400px] p-6" ref={scrollRef}>
                {streamedResponse ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none prose-invert">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {streamedResponse}
                        {isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse" />
                        )}
                      </div>
                    </div>

                    {showMetrics && streamedResponse && (
                      <div className="pt-4 mt-4 border-t border-border">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Total Tokens</div>
                            <div className="font-mono font-bold text-accent">{metrics.totalTokens}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Speed</div>
                            <div className="font-mono font-bold">{metrics.tokensPerSecond.toFixed(1)} t/s</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Duration</div>
                            <div className="font-mono font-bold">{formatTime(metrics.elapsedTime)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Model</div>
                            <div className="font-mono font-bold text-xs truncate">
                              {currentModel.displayName.split(' ')[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className={cn(
                      "mb-4 transition-all duration-300",
                      isStreaming && "animate-pulse"
                    )}>
                      {isStreaming ? (
                        <Lightning size={48} className="text-accent" weight="duotone" />
                      ) : (
                        <Sparkle size={48} className="text-muted-foreground opacity-30" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isStreaming ? "Initializing stream..." : "Streaming response will appear here"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          {!enableSimulation && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <Lightning className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-xs text-yellow-300">
                <strong>Real API Mode:</strong> Actual streaming requires server-side implementation.
                Use simulation mode for testing or implement a backend that streams responses using
                LiteLLM's streaming API with <code className="text-xs bg-black/20 px-1 rounded">stream=True</code>.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
