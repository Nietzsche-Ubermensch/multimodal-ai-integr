import { Badge } from "@/components/ui/badge";
import { Brain, Code, Database, Rocket } from "@phosphor-icons/react";

export function FinalSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-background opacity-50" />
      
      <div className="relative z-10 text-center space-y-8 max-w-5xl">
        <Badge variant="outline" className="text-sm font-mono tracking-widest px-6 py-2 border-accent text-accent">
          INTEGRATION COMPLETE
        </Badge>
        
        <h1 className="text-6xl font-bold tracking-tight leading-tight">
          Building the Future with
          <br />
          <span className="text-accent">Multimodal AI</span>
        </h1>
        
        <div className="w-32 h-1 bg-accent mx-auto" />
        
        <div className="space-y-4 max-w-4xl mx-auto">
          <p className="text-xl text-muted-foreground leading-relaxed">
            The convergence of multimodal AI platforms represents a{" "}
            <span className="text-accent font-semibold">paradigm shift</span> in how we
            build intelligent applications.
          </p>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            By leveraging Deepseek's specialized capabilities and OpenRouter's unified access
            layer, developers can create{" "}
            <span className="text-accent font-semibold">
              sophisticated AI systems
            </span>{" "}
            that were previously impossible.
          </p>
          
          <p className="text-xl text-accent font-semibold leading-relaxed">
            This guide provides the foundation—your implementation will define the future.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-8 pt-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
              <Brain className="text-accent" size={36} weight="duotone" />
            </div>
            <div className="text-4xl font-bold text-accent font-mono mb-2">400+</div>
            <div className="text-sm text-muted-foreground">AI Models Available</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
              <Code className="text-accent" size={36} weight="duotone" />
            </div>
            <div className="text-4xl font-bold text-accent font-mono mb-2">2 Lines</div>
            <div className="text-sm text-muted-foreground">Of Code to Migrate</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
              <Rocket className="text-accent" size={36} weight="duotone" />
            </div>
            <div className="text-4xl font-bold text-accent font-mono mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Possibilities Ahead</div>
          </div>
        </div>
        
        <div className="pt-8 flex items-center justify-center gap-4">
          <Badge variant="outline" className="font-mono">
            Enterprise Ready
          </Badge>
          <Badge variant="outline" className="font-mono">
            Production Tested
          </Badge>
          <Badge variant="outline" className="font-mono">
            Open Source
          </Badge>
        </div>
      </div>
    </div>
  );
}
