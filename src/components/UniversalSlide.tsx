import { SlideData } from "@/types/slides";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/CodeBlock";
import { ApiTester } from "@/components/ApiTester";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { DeploymentGuide } from "@/components/DeploymentGuide";
import { EnvSetup } from "@/components/EnvSetup";
import { ApiKeyValidator } from "@/components/ApiKeyValidator";
import { EmbeddingTester } from "@/components/EmbeddingTester";
import { OpenRouterSDKDemo } from "@/components/OpenRouterSDKDemo";
import { AnthropicSDKDemo } from "@/components/AnthropicSDKDemo";
import { DeepSeekSDKDemo } from "@/components/DeepSeekSDKDemo";
import { XAISDKDemo } from "@/components/XAISDKDemo";
import { Brain, Code, Database, Lightning, CheckCircle } from "@phosphor-icons/react";

interface UniversalSlideProps {
  slide: SlideData;
  slideNumber: number;
  totalSlides: number;
}

export function UniversalSlide({ slide, slideNumber, totalSlides }: UniversalSlideProps) {
  if (slide.id === "cover") {
    return (
      <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background opacity-50" />
        
        <div className="relative z-10 text-center space-y-8 max-w-5xl px-8">
          <Badge variant="outline" className="text-sm font-mono tracking-widest px-6 py-2 border-accent text-accent">
            TECHNICAL INTEGRATION GUIDE
          </Badge>
          
          <h1 className="text-7xl font-bold tracking-tight leading-tight">
            {slide.title.split(" ").slice(0, 2).join(" ")}
            <br />
            <span className="text-accent">{slide.title.split(" ").slice(2).join(" ")}</span>
          </h1>
          
          <div className="w-32 h-1 bg-accent mx-auto" />
          
          {slide.subtitle && (
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          
          {slide.bullets && slide.bullets.length > 0 && (
            <div className="flex items-center justify-center gap-8 pt-8">
              {slide.bullets.map((bullet, idx) => {
                const bullets = slide.bullets!;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    {idx === 0 && <Brain className="text-accent" size={32} weight="duotone" />}
                    {idx === 1 && <Code className="text-accent" size={32} weight="duotone" />}
                    {idx === 2 && <Database className="text-accent" size={32} weight="duotone" />}
                    <span className="text-lg">{bullet}</span>
                    {idx < bullets.length - 1 && <div className="w-2 h-2 bg-muted rounded-full ml-5" />}
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="pt-12 flex items-center justify-center gap-3 text-muted-foreground">
            <Lightning size={20} weight="fill" className="text-accent" />
            <span className="font-mono text-sm">Press → to continue or click navigation buttons</span>
          </div>
        </div>
      </div>
    );
  }

  if (slide.id === "toc") {
    return (
      <div className="h-full flex flex-col p-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-1 h-16 bg-accent" />
            <div>
              <p className="text-sm font-mono tracking-widest text-accent uppercase mb-1">
                Navigation
              </p>
              <h2 className="text-5xl font-bold">{slide.title}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1">
          {slide.bullets?.map((bullet, idx) => {
            const isInteractive = bullet.includes("(Interactive)");
            return (
              <Card
                key={idx}
                className="p-6 bg-card/50 border-l-4 border-accent hover:bg-card transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-accent-foreground font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
                      {bullet}
                    </h3>
                    {isInteractive && (
                      <Badge variant="secondary" className="mt-2 gap-1">
                        <Lightning size={12} weight="fill" />
                        Interactive Demo
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.id === "summary" && slide.content) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-background opacity-50" />
        
        <div className="relative z-10 text-center space-y-8 max-w-4xl">
          <Badge variant="outline" className="text-sm font-mono tracking-widest px-6 py-2 border-accent text-accent">
            CONCLUSION
          </Badge>
          
          <h1 className="text-6xl font-bold tracking-tight">
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <p className="text-2xl text-accent font-semibold">
              {slide.subtitle}
            </p>
          )}
          
          <div className="w-32 h-1 bg-accent mx-auto" />
          
          {slide.bullets && (
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-accent/20">
                  <CheckCircle size={24} weight="fill" className="text-accent shrink-0 mt-1" />
                  <span className="text-lg text-foreground/90">{bullet}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-12">
            <p className="text-5xl font-bold text-accent">{slide.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-16 bg-accent" />
          <div>
            {slide.subtitle && (
              <p className="text-sm font-mono tracking-widest text-accent uppercase mb-1">
                {slide.subtitle}
              </p>
            )}
            <h2 className="text-5xl font-bold">{slide.title}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-auto">
        {slide.interactive ? (
          <>
            {slide.bullets && (
              <Card className="p-6 bg-card/50 border-l-4 border-accent">
                <div className="space-y-4">
                  {slide.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      </div>
                      <p className="text-lg text-foreground/90 leading-relaxed flex-1">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <div className="flex-1 min-h-[500px]">
              {slide.id === "endpoints" ? (
                <ApiTester />
              ) : slide.id === "api-reference" ? (
                <ApiDocumentation />
              ) : slide.id === "github-integration" ? (
                <GitHubIntegration />
              ) : slide.id === "deployment-guides" ? (
                <DeploymentGuide />
              ) : slide.id === "env-setup" ? (
                <EnvSetup />
              ) : slide.id === "api-key-validator" ? (
                <ApiKeyValidator />
              ) : slide.id === "embedding-tester" ? (
                <EmbeddingTester />
              ) : slide.id === "openrouter-sdk" ? (
                <OpenRouterSDKDemo />
              ) : slide.id === "anthropic-sdk" ? (
                <AnthropicSDKDemo />
              ) : slide.id === "deepseek-sdk" ? (
                <DeepSeekSDKDemo />
              ) : slide.id === "xai-sdk" ? (
                <XAISDKDemo />
              ) : null}
            </div>
          </>
        ) : (
          <>
            {slide.bullets && (
              <Card className="p-6 bg-card/50 border-l-4 border-accent">
                <div className="space-y-4">
                  {slide.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      </div>
                      <p className="text-lg text-foreground/90 leading-relaxed flex-1">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {slide.code && (
              <CodeBlock 
                code={slide.code} 
                language={slide.code.startsWith('#') || slide.code.includes('import os') ? 'python' : 'typescript'}
                title={`${slide.title} Example`}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
