import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Database, Lightning } from "@phosphor-icons/react";

export function CoverSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background opacity-50" />
      
      <div className="relative z-10 text-center space-y-8 max-w-5xl px-8">
        <Badge variant="outline" className="text-sm font-mono tracking-widest px-6 py-2 border-accent text-accent">
          TECHNICAL INTEGRATION GUIDE
        </Badge>
        
        <h1 className="text-7xl font-bold tracking-tight leading-tight">
          Multimodal AI
          <br />
          <span className="text-accent">Integration Platform</span>
        </h1>
        
        <div className="w-32 h-1 bg-accent mx-auto" />
        
        <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Complete Technical Reference for Deepseek, OpenRouter, xAI, NVIDIA & Enterprise AI Deployment
        </p>
        
        <div className="flex items-center justify-center gap-8 pt-8">
          <div className="flex items-center gap-3">
            <Brain className="text-accent" size={32} weight="duotone" />
            <span className="text-lg">Multimodal AI</span>
          </div>
          
          <div className="w-2 h-2 bg-muted rounded-full" />
          
          <div className="flex items-center gap-3">
            <Code className="text-accent" size={32} weight="duotone" />
            <span className="text-lg">API Integration</span>
          </div>
          
          <div className="w-2 h-2 bg-muted rounded-full" />
          
          <div className="flex items-center gap-3">
            <Database className="text-accent" size={32} weight="duotone" />
            <span className="text-lg">Enterprise Scale</span>
          </div>
        </div>
        
        <div className="pt-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Lightning size={20} weight="fill" className="text-accent" />
          <span className="font-mono text-sm">Press → to continue or click navigation buttons</span>
        </div>
      </div>
    </div>
  );
}
