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

  const highlightCode = (code: string, lang: string) => {
    if (lang === 'python') {
      const keywords = /\b(import|from|def|class|return|if|else|elif|for|while|try|except|finally|with|as|in|is|not|and|or|lambda|yield|async|await)\b/g;
      const strings = /(["'])(.*?)\1/g;
      const comments = /(#.*$)/gm;
      const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
      const decorators = /(@[a-zA-Z_][a-zA-Z0-9_]*)/g;
      
      let highlighted = code;
      highlighted = highlighted.replace(comments, '<span class="text-[var(--code-comment)]">$1</span>');
      highlighted = highlighted.replace(strings, '<span class="text-[var(--code-green)]">$1$2$1</span>');
      highlighted = highlighted.replace(decorators, '<span class="text-[var(--code-orange)]">$1</span>');
      highlighted = highlighted.replace(keywords, '<span class="text-[var(--code-cyan)]">$1</span>');
      highlighted = highlighted.replace(functions, '<span class="text-[var(--code-purple)]">$1</span>(');
      
      return highlighted;
    }
    
    if (lang === 'bash' || lang === 'shell') {
      const keywords = /\b(export|echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|npm|pip|python|node|docker|git)\b/g;
      const strings = /(["'])(.*?)\1/g;
      const comments = /(#.*$)/gm;
      const variables = /(\$\{?[a-zA-Z_][a-zA-Z0-9_]*\}?)/g;
      
      let highlighted = code;
      highlighted = highlighted.replace(comments, '<span class="text-[var(--code-comment)]">$1</span>');
      highlighted = highlighted.replace(strings, '<span class="text-[var(--code-green)]">$1$2$1</span>');
      highlighted = highlighted.replace(variables, '<span class="text-[var(--code-purple)]">$1</span>');
      highlighted = highlighted.replace(keywords, '<span class="text-[var(--code-cyan)]">$1</span>');
      
      return highlighted;
    }
    
    if (lang === 'docker' || lang === 'dockerfile') {
      const keywords = /\b(FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/g;
      const strings = /(["'])(.*?)\1/g;
      const comments = /(#.*$)/gm;
      
      let highlighted = code;
      highlighted = highlighted.replace(comments, '<span class="text-[var(--code-comment)]">$1</span>');
      highlighted = highlighted.replace(strings, '<span class="text-[var(--code-green)]">$1$2$1</span>');
      highlighted = highlighted.replace(keywords, '<span class="text-[var(--code-cyan)]">$1</span>');
      
      return highlighted;
    }
    
    if (lang === 'yaml' || lang === 'yml') {
      const keys = /^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/gm;
      const strings = /(["'])(.*?)\1/g;
      const comments = /(#.*$)/gm;
      const values = /:\s*([^"'\n#]+)/g;
      
      let highlighted = code;
      highlighted = highlighted.replace(comments, '<span class="text-[var(--code-comment)]">$1</span>');
      highlighted = highlighted.replace(strings, '<span class="text-[var(--code-green)]">$1$2$1</span>');
      highlighted = highlighted.replace(keys, '$1<span class="text-[var(--code-cyan)]">$2</span>:');
      
      return highlighted;
    }
    
    if (lang === 'json') {
      const keys = /"([^"]+)"\s*:/g;
      const strings = /:\s*"([^"]*)"/g;
      const numbers = /:\s*(-?\d+\.?\d*)/g;
      const booleans = /\b(true|false|null)\b/g;
      
      let highlighted = code;
      highlighted = highlighted.replace(keys, '"<span class="text-[var(--code-cyan)]">$1</span>":');
      highlighted = highlighted.replace(strings, ': "<span class="text-[var(--code-green)]">$1</span>"');
      highlighted = highlighted.replace(numbers, ': <span class="text-[var(--code-orange)]">$1</span>');
      highlighted = highlighted.replace(booleans, '<span class="text-[var(--code-purple)]">$1</span>');
      
      return highlighted;
    }
    
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
            dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
          />
        </pre>
      </div>
    </Card>
  );
}
