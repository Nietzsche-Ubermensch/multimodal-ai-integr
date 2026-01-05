// Enhanced Chat with Streaming Support

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  PaperPlaneTilt,
  Stop,
  ArrowClockwise,
  Trash,
  Copy,
  Check,
  Gear,
  Brain,
  Lightning,
  User,
  Robot,
  Database,
  Sparkle,
  ChatCircle,
  ArrowsCounterClockwise,
} from '@phosphor-icons/react';
import { AIModel, ChatMessage, RAGCitation, LANGUAGE_FLAGS } from './types';
import { cn } from '@/lib/utils';

interface StreamingChatProps {
  model: AIModel;
  ragContext?: RAGCitation[];
  onClose?: () => void;
  className?: string;
}

interface StreamingState {
  isStreaming: boolean;
  currentContent: string;
  abortController: AbortController | null;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  english: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.',
  german: 'Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch, klar und präzise.',
  japanese: 'あなたは役立つAIアシスタントです。日本語で明確で正確な回答を提供してください。',
  multilingual: 'You are a multilingual AI assistant. Respond in the same language as the user\'s message.',
};

export function StreamingChat({ model, ragContext = [], onClose, className }: StreamingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    currentContent: '',
    abortController: null,
  });
  
  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [useRagContext, setUseRagContext] = useState(ragContext.length > 0);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming.currentContent]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const systemPrompt = SYSTEM_PROMPTS[model.languageOptimization] || SYSTEM_PROMPTS.english;

  const buildContextPrompt = useCallback(() => {
    if (!useRagContext || ragContext.length === 0) return '';
    
    const contextText = ragContext
      .map((doc, i) => `[${i + 1}] ${doc.content}`)
      .join('\n\n');
    
    return `\n\nUse the following context to answer questions:\n\n${contextText}`;
  }, [useRagContext, ragContext]);

  const simulateStreamingResponse = useCallback(async (
    userMessage: string,
    controller: AbortController
  ) => {
    // Simulate streaming response
    const responses: Record<string, string[]> = {
      german: [
        'Basierend auf ',
        'meiner Analyse ',
        'kann ich Ihnen ',
        'folgendes mitteilen: ',
        '\n\n',
        model.name,
        ' ist ein leistungsstarkes Modell ',
        'mit ',
        model.parameters || '7B',
        ' Parametern. ',
        '\n\nEs unterstützt: \n',
        '- Deutschsprachige Verarbeitung\n',
        '- Kontextfenster von ',
        `${(model.contextWindow / 1000).toFixed(0)}K tokens\n`,
        '- ',
        model.capabilities.filter(c => c.supported).map(c => c.type).join(', '),
      ],
      japanese: [
        'ご質問に',
        'お答え',
        'いたします。',
        '\n\n',
        model.name,
        'は、',
        model.parameters || '7B',
        'のパラメータを持つ',
        '高性能なモデルです。',
        '\n\n対応機能：\n',
        '- 日本語処理\n',
        '- コンテキスト長: ',
        `${(model.contextWindow / 1000).toFixed(0)}K トークン\n`,
        '- ',
        model.capabilities.filter(c => c.supported).map(c => c.type).join('、'),
      ],
      default: [
        'Based on your question, ',
        'I can provide the following information:\n\n',
        `**${model.name}** is a powerful AI model `,
        `with ${model.parameters || 'N/A'} parameters.\n\n`,
        '### Key Features:\n',
        `- **Context Window**: ${(model.contextWindow / 1000).toFixed(0)}K tokens\n`,
        `- **Provider**: ${model.providerDisplayName}\n`,
        `- **Capabilities**: ${model.capabilities.filter(c => c.supported).map(c => c.type).join(', ')}\n`,
        ragContext.length > 0 ? `\n### From RAG Context:\n${ragContext[0]?.content.slice(0, 200)}...\n` : '',
        '\nWould you like more details about any specific feature?',
      ],
    };

    const responseChunks = responses[model.languageOptimization] || responses.default;
    let fullContent = '';

    for (const chunk of responseChunks) {
      if (controller.signal.aborted) break;
      
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      fullContent += chunk;
      
      setStreaming(prev => ({
        ...prev,
        currentContent: fullContent,
      }));
    }

    return fullContent;
  }, [model, ragContext]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming.isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const controller = new AbortController();
    setStreaming({
      isStreaming: true,
      currentContent: '',
      abortController: controller,
    });

    try {
      const fullResponse = await simulateStreamingResponse(input.trim(), controller);
      
      if (!controller.signal.aborted) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
          model: model.id,
          citations: useRagContext ? ragContext : undefined,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setStreaming({
        isStreaming: false,
        currentContent: '',
        abortController: null,
      });
    }
  }, [input, streaming.isStreaming, model, ragContext, useRagContext, simulateStreamingResponse]);

  const handleStop = useCallback(() => {
    if (streaming.abortController) {
      streaming.abortController.abort();
      
      if (streaming.currentContent) {
        const partialMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streaming.currentContent + ' [interrupted]',
          timestamp: new Date(),
          model: model.id,
        };
        setMessages(prev => [...prev, partialMessage]);
      }
    }
  }, [streaming, model.id]);

  const handleCopy = useCallback(async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
    setStreaming({
      isStreaming: false,
      currentContent: '',
      abortController: null,
    });
  }, []);

  const handleRetry = useCallback(() => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.slice(0, -1));
      setInput(lastUserMessage.content);
    }
  }, [messages]);

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}
            </span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {model.name}
                {streaming.isStreaming && (
                  <Badge variant="secondary" className="animate-pulse gap-1">
                    <Lightning size={12} weight="fill" />
                    Streaming
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {model.providerDisplayName} • {model.parameters}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {ragContext.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Database size={12} />
                {ragContext.length} docs
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Gear size={18} className={showSettings ? 'text-primary' : ''} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Temperature: {temperature.toFixed(1)}</Label>
                <Slider
                  value={[temperature]}
                  onValueChange={([v]) => setTemperature(v)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Tokens: {maxTokens}</Label>
                <Slider
                  value={[maxTokens]}
                  onValueChange={([v]) => setMaxTokens(v)}
                  min={256}
                  max={4096}
                  step={256}
                />
              </div>
            </div>
            {ragContext.length > 0 && (
              <div className="flex items-center justify-between">
                <Label className="text-xs">Use RAG Context</Label>
                <Switch checked={useRagContext} onCheckedChange={setUseRagContext} />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <Separator />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && !streaming.isStreaming && (
            <div className="text-center py-12 text-muted-foreground">
              <ChatCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>Start a conversation with {model.name}</p>
              <p className="text-xs mt-1">
                {model.languageOptimization === 'german' && 'Fragen Sie auf Deutsch!'}
                {model.languageOptimization === 'japanese' && '日本語で質問できます！'}
                {model.languageOptimization === 'multilingual' && 'Ask in any language!'}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Robot size={18} className="text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-4 py-3 group',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.citations.map((cite, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          [{i + 1}] {cite.source || 'Document'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(msg.content, msg.id)}
                    >
                      {copiedId === msg.id ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming indicator */}
          {streaming.isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Robot size={18} className="text-primary" />
              </div>
              <div className="max-w-[80%] rounded-xl px-4 py-3 bg-muted">
                <div className="whitespace-pre-wrap text-sm">
                  {streaming.currentContent}
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Input */}
      <div className="p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={messages.length === 0}
            title="Clear chat"
          >
            <Trash size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRetry}
            disabled={messages.length < 2}
            title="Retry last message"
          >
            <ArrowsCounterClockwise size={18} />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              model.languageOptimization === 'german'
                ? 'Nachricht eingeben...'
                : model.languageOptimization === 'japanese'
                ? 'メッセージを入力...'
                : 'Type a message...'
            }
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={streaming.isStreaming}
            className="flex-1"
          />
          {streaming.isStreaming ? (
            <Button variant="destructive" size="icon" onClick={handleStop}>
              <Stop size={18} weight="fill" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!input.trim()} className="gap-2">
              <PaperPlaneTilt size={18} weight="fill" />
              Send
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
