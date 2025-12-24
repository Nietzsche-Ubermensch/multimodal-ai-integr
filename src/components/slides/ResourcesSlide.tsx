import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GithubLogo, Book, Link as LinkIcon } from "@phosphor-icons/react";

export function ResourcesSlide() {
  const repos = [
    {
      name: "BerriAI/litellm",
      description: "Core Python SDK and Proxy Server for unified LLM API access",
      url: "https://github.com/BerriAI/litellm",
    },
    {
      name: "veniceai/api-docs",
      description: "Venice AI API documentation and integration guides",
      url: "https://github.com/veniceai/api-docs",
    },
    {
      name: "xai-org/xai-cookbook",
      description: "xAI Grok model integration recipes and examples",
      url: "https://github.com/xai-org/xai-cookbook",
    },
    {
      name: "OpenRouterTeam/ai-sdk-provider",
      description: "OpenRouter provider for Vercel AI SDK integration",
      url: "https://github.com/OpenRouterTeam/ai-sdk-provider",
    },
    {
      name: "huggingface/dataset-viewer",
      description: "HuggingFace dataset viewer and exploration tools",
      url: "https://github.com/huggingface/dataset-viewer",
    },
    {
      name: "deepseek-ai/DeepSeek-Math-V2",
      description: "DeepSeek mathematical reasoning model repository",
      url: "https://github.com/deepseek-ai/DeepSeek-Math-V2",
    },
  ];

  const docs = [
    { title: "LiteLLM Documentation", url: "https://litellm.vercel.app/" },
    { title: "NVIDIA Developer Program", url: "https://developer.nvidia.com/" },
    { title: "OpenRouter API Docs", url: "https://openrouter.ai/docs" },
    { title: "Deepseek Platform", url: "https://platform.deepseek.com/" },
  ];

  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <p className="text-sm font-mono tracking-widest text-accent uppercase mb-2">
          Resources & Documentation
        </p>
        <h2 className="text-4xl font-bold">GitHub Repositories & References</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <GithubLogo className="text-accent" size={28} weight="duotone" />
            <h3 className="text-2xl font-bold">Primary Repositories</h3>
          </div>

          {repos.map((repo, index) => (
            <Card
              key={index}
              className="p-4 border-l-4 border-accent bg-card/50 hover:bg-card transition-all cursor-pointer group"
              onClick={() => window.open(repo.url, "_blank")}
            >
              <div className="flex items-start gap-3">
                <GithubLogo className="text-accent mt-1" size={20} weight="fill" />
                <div className="flex-1">
                  <div className="font-bold font-mono text-accent mb-1 group-hover:underline">
                    {repo.name}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {repo.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Book className="text-accent" size={28} weight="duotone" />
              <h3 className="text-2xl font-bold">Documentation Links</h3>
            </div>

            <div className="space-y-3">
              {docs.map((doc, index) => (
                <Card
                  key={index}
                  className="p-4 border-l-4 border-accent bg-card/50 hover:bg-card transition-all cursor-pointer group"
                  onClick={() => window.open(doc.url, "_blank")}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="text-accent" size={20} weight="bold" />
                    <div className="flex-1">
                      <div className="font-bold group-hover:text-accent transition-colors">
                        {doc.title}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        {doc.url}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-6 border-l-4 border-accent bg-accent/5">
            <h3 className="text-xl font-bold mb-4">Getting Started</h3>
            <div className="space-y-3">
              {[
                "Sign up for NVIDIA Developer Program",
                "Generate your API keys",
                "Choose integration method (SDK/Proxy)",
                "Install required packages",
                "Start building your AI application",
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 bg-accent/10 border border-accent rounded-lg p-6 text-center">
        <p className="text-lg">
          <strong className="text-accent">Integration Benefits:</strong> Seamless
          OpenAI-compatible integration · Dual methods (Python SDK/Proxy) · Comprehensive
          model support · Enterprise-ready features
        </p>
      </div>
    </div>
  );
}
