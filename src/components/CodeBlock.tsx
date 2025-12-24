import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "typescript", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string) => {
    const keywords = /\b(import|from|const|let|var|function|class|export|default|async|await|return|if|else|for|while|try|catch|new|this|typeof|interface|type)\b/g;
    const strings = /(["'`])(.*?)\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    
    let highlighted = code;
    highlighted = highlighted.replace(comments, '<span class="text-[var(--code-comment)]">$1</span>');
    highlighted = highlighted.replace(strings, '<span class="text-[var(--code-green)]">$1$2$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-[var(--code-cyan)]">$1</span>');
    highlighted = highlighted.replace(functions, '<span class="text-[var(--code-purple)]">$1</span>(');
    
    return highlighted;
  };

  return (
    <Card className="relative bg-[var(--code-bg)] border-accent/30">
      {title && (
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">{title}</span>
          <Badge variant="outline" className="font-mono text-xs">
            {language}
          </Badge>
        </div>
      )}
      
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={16} weight="bold" className="text-[var(--code-green)]" />
          ) : (
            <Copy size={16} />
          )}
        </Button>
        
        <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <code
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </pre>
      </div>
    </Card>
  );
}
