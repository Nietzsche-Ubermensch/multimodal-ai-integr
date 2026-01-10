// Chat Interface for AI Models

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  PaperPlaneRight,
  ArrowsClockwise,
  User,
  Robot,
  Gear,
  Trash,
  Copy,
  Check,
  Lightning,
  Brain,
  Sparkle,
  Globe,
  Warning,
  X,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { 
  AIModel, 
  ChatMessage, 
  RAGCitation, 
  LANGUAGE_FLAGS,
  PROVIDER_COLORS,
} from './types';

interface ModelChatProps {
  model: AIModel;
  ragContext?: RAGCitation[];
  onClose: () => void;
}

interface ChatConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  stream: boolean;
  useRagContext: boolean;
  systemPrompt: string;
}

const DEFAULT_CONFIG: ChatConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  stream: true,
  useRagContext: true,
  systemPrompt: 'You are a helpful AI assistant. Be concise and accurate.',
};

const LANGUAGE_PROMPTS: Record<string, string> = {
  german: 'Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch, sei präzise und hilfreich.',
  japanese: 'あなたは親切なAIアシスタントです。日本語で簡潔かつ正確に回答してください。',
  multilingual: 'You are a multilingual AI assistant. Respond in the same language as the user\'s query.',
  english: 'You are a helpful AI assistant. Be concise and accurate.',
};

export function ModelChat({ model, ragContext, onClose }: ModelChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    ...DEFAULT_CONFIG,
    systemPrompt: LANGUAGE_PROMPTS[model.languageOptimization] || DEFAULT_CONFIG.systemPrompt,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from RAG results if available
      let contextPrompt = '';
      if (config.useRagContext && ragContext && ragContext.length > 0) {
        contextPrompt = `\n\nRelevant context from documents:\n${ragContext
          .map((c, i) => `[${i + 1}] ${c.content}`)
          .join('\n\n')}\n\n`;
      }

      // Simulate API call (in production, call the actual model API)
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: await simulateModelResponse(model, userMessage.content, config, contextPrompt),
        timestamp: new Date(),
        model: model.name,
        citations: config.useRagContext ? ragContext : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get response');
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to generate response'}. Please check your API configuration.`,
        timestamp: new Date(),
        model: model.name,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, model, config, ragContext]);

  const copyMessage = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{model.languageFlag || LANGUAGE_FLAGS[model.languageOptimization]}</span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {model.name}
                <Badge className={`${PROVIDER_COLORS[model.provider]} text-white text-xs`}>
                  {model.provider}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {model.parameters} • {model.contextWindow >= 1000 
                  ? `${(model.contextWindow / 1000).toFixed(0)}K context` 
                  : `${model.contextWindow} context`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {ragContext && ragContext.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Brain size={12} />
                {ragContext.length} RAG docs
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowConfig(!showConfig)}>
              <Gear size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearChat}>
              <Trash size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {config.temperature}</Label>
                <Slider
                  value={[config.temperature]}
                  onValueChange={([v]) => setConfig({ ...config, temperature: v })}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens: {config.maxTokens}</Label>
                <Slider
                  value={[config.maxTokens]}
                  onValueChange={([v]) => setConfig({ ...config, maxTokens: v })}
                  min={256}
                  max={8192}
                  step={256}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="stream"
                  checked={config.stream}
                  onCheckedChange={(v) => setConfig({ ...config, stream: v })}
                />
                <Label htmlFor="stream">Streaming</Label>
              </div>
              
              {ragContext && ragContext.length > 0 && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="use-rag"
                    checked={config.useRagContext}
                    onCheckedChange={(v) => setConfig({ ...config, useRagContext: v })}
                  />
                  <Label htmlFor="use-rag">Use RAG Context</Label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Robot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Start a conversation with {model.name}</p>
              <p className="text-sm">
                {model.languageOptimization === 'german' && 'Schreiben Sie Ihre Nachricht auf Deutsch...'}
                {model.languageOptimization === 'japanese' && '日本語でメッセージを入力してください...'}
                {model.languageOptimization === 'multilingual' && 'Type in any of the supported languages...'}
                {model.languageOptimization === 'english' && 'Type your message below...'}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {model.supportedLanguages.slice(0, 6).map(lang => (
                  <Badge key={lang} variant="outline" className="uppercase font-mono text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      <Robot size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium mb-1 opacity-70">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.citations.map((c, i) => (
                            <Badge key={c.id} variant="secondary" className="text-xs">
                              [{i + 1}] {c.source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.model && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        {message.model}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={() => copyMessage(message)}
                    >
                      {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                    </Button>
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-muted">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  <ArrowsClockwise size={16} className="animate-spin" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* RAG Context Preview */}
      {config.useRagContext && ragContext && ragContext.length > 0 && (
        <div className="flex-shrink-0 border-t p-2 bg-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain size={14} />
            <span>Using {ragContext.length} RAG documents as context</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              model.languageOptimization === 'german' 
                ? 'Schreiben Sie eine Nachricht...' 
                : model.languageOptimization === 'japanese'
                ? 'メッセージを入力...'
                : 'Type a message...'
            }
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {isLoading ? (
              <ArrowsClockwise size={18} className="animate-spin" />
            ) : (
              <PaperPlaneRight size={18} />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}

// Simulate model response (replace with actual API call in production)
async function simulateModelResponse(
  model: AIModel,
  userInput: string,
  config: ChatConfig,
  contextPrompt: string
): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const languageResponses: Record<string, string[]> = {
    german: [
      'Vielen Dank für Ihre Frage. Basierend auf dem Kontext kann ich Ihnen Folgendes mitteilen...',
      'Das ist eine interessante Frage. Lassen Sie mich das erklären...',
      'Gerne helfe ich Ihnen dabei. Hier ist meine Analyse...',
    ],
    japanese: [
      'ご質問ありがとうございます。お答えいたします...',
      '興味深いご質問ですね。説明させていただきます...',
      'はい、喜んでお手伝いします。分析結果は以下の通りです...',
    ],
    multilingual: [
      `I'll respond in the language of your query. Your question about "${userInput.slice(0, 50)}..." is interesting.`,
      `Based on the context provided, here's my analysis of your query...`,
    ],
    english: [
      `Thank you for your question. Let me analyze this for you...`,
      `That's an interesting query. Here's what I found...`,
      `Based on the available information, I can tell you that...`,
    ],
  };

  const responses = languageResponses[model.languageOptimization] || languageResponses.english;
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];

  let response = baseResponse;

  if (contextPrompt) {
    response += `\n\nI've incorporated the RAG context from the provided documents into my response. The information is based on ${contextPrompt.split('[').length - 1} source documents.`;
  }

  response += `\n\n**Model**: ${model.name}\n**Provider**: ${model.providerDisplayName}\n**Context Window**: ${model.contextWindow.toLocaleString()} tokens`;

  if (model.isNew) {
    response += `\n\n*Note: This is a new 2025 model with enhanced capabilities for ${model.languageOptimization} language processing.*`;
  }

  return response;
}
