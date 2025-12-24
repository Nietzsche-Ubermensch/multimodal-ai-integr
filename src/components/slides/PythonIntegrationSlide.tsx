import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";
import { Code } from "@phosphor-icons/react";

export function PythonIntegrationSlide() {
  const pythonCode = `import litellm
from litellm import completion

# Make API call to NVIDIA NIM
response = completion(
    model="nvidia/meta/llama3-70b-instruct",
    messages=[
        {"role": "user", "content": "Hello! Write a short poem about AI."}
    ],
    temperature=0.5,
    max_tokens=1024
)

# Extract and print content
print(response.choices[0].message.content)`;

  const advancedCode = `import litellm
from litellm import completion
import os
from typing import Optional

class NVIDIAClient:
    """Robust client for NVIDIA NIM integration with LiteLLM."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("NVIDIA_API_KEY")
        if not self.api_key:
            raise ValueError("API key required")
        litellm.api_key = self.api_key
    
    def generate_chat_completion(self, model: str, messages: list,
                                   temperature: float = 0.5, 
                                   max_tokens: int = 1024) -> dict:
        """Generate chat completion with error handling."""
        try:
            response = completion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                api_key=self.api_key
            )
            return self._process_response(response)
        except Exception as e:
            return {"error": True, "message": str(e)}
    
    def _process_response(self, response) -> dict:
        """Process response and extract key information."""
        return {
            "error": False,
            "content": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }

# Usage example
client = NVIDIAClient()
response = client.generate_chat_completion(
    model="nvidia/meta/llama3-70b-instruct",
    messages=[{"role": "user", "content": "Explain quantum computing."}]
)
print(response["content"])`;

  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-6">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Implementation Examples
        </p>
        <h2 className="text-4xl font-bold">Python Integration with LiteLLM</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Code className="text-accent" size={24} weight="duotone" />
            <h3 className="text-xl font-bold">Basic Implementation</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeBlock code={pythonCode} language="python" title="simple_integration.py" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Code className="text-accent" size={24} weight="duotone" />
            <h3 className="text-xl font-bold">Advanced Class-Based</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeBlock code={advancedCode} language="python" title="nvidia_client.py" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-accent bg-card/50">
          <h4 className="font-bold mb-2">Core Parameters</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">model</span>
              <span className="text-accent font-mono">Required</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">messages</span>
              <span className="text-accent font-mono">Required</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">temperature</span>
              <span className="text-muted-foreground font-mono">0.0-2.0</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-accent bg-card/50">
          <h4 className="font-bold mb-2">Message Roles</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span><strong>system:</strong> Behavior setup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--code-green)] rounded-full" />
              <span><strong>user:</strong> User input</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--code-purple)] rounded-full" />
              <span><strong>assistant:</strong> AI responses</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-accent bg-card/50">
          <h4 className="font-bold mb-2">Response Structure</h4>
          <div className="space-y-1 text-sm font-mono">
            <div className="text-muted-foreground">response.choices[0].message.content</div>
            <div className="text-muted-foreground">response.model</div>
            <div className="text-muted-foreground">response.usage.total_tokens</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
