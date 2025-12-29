import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  PaperPlaneTilt,
  Robot,
  User,
  DotsThree,
  Copy,
  Trash,
  PencilSimple,
  ArrowsClockwise,
  Plus,
  Chat,
  Clock,
  Sparkle,
  Export,
  CaretDown,
  Star,
  GitFork,
  ImageSquare,
  Code,
  MagnifyingGlass,
  Microphone,
  SpeakerHigh,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { LITELLM_MODELS, type LiteLLMModel } from "@/lib/litellm-langfuse";

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokens?: { input: number; output: number };
  latencyMs?: number;
  parentId?: string; // For branching
  children?: string[]; // Child message IDs for branching
  isEdited?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  tags: string[];
}

interface Preset {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// ============================================================================
// LibreChat-Inspired Chat Interface
// ============================================================================

export function LibreChatInterface() {
  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Message State
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Model & Settings State
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Create new conversation
  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      systemPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      tags: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, [selectedModel, systemPrompt]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    let conversation = activeConversation;
    if (!conversation) {
      conversation = createConversation();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update conversation with user message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: conversation.messages.length === 0 
        ? inputMessage.substring(0, 50) + (inputMessage.length > 50 ? '...' : '')
        : conversation.title,
    };

    setConversations(prev => 
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );
    setInputMessage("");
    setIsGenerating(true);

    try {
      // Simulate AI response (in production, call actual API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const modelInfo = LITELLM_MODELS.find(m => m.id === selectedModel);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: generateDemoResponse(userMessage.content, modelInfo?.name || selectedModel),
        timestamp: new Date().toISOString(),
        model: selectedModel,
        tokens: { input: Math.ceil(userMessage.content.length / 4), output: 150 },
        latencyMs: 1500,
        parentId: userMessage.id,
      };

      setConversations(prev =>
        prev.map(c => c.id === updatedConversation.id
          ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toISOString() }
          : c
        )
      );
    } catch (error) {
      toast.error("Failed to generate response");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate demo response
  const generateDemoResponse = (input: string, model: string): string => {
    const responses = [
      `I understand you're asking about "${input.substring(0, 50)}...".\n\nHere's my response using ${model}:\n\n**Key Points:**\n1. This is a demo response from the LibreChat-style interface\n2. In production, this would connect to actual AI APIs\n3. The interface supports conversation branching, editing, and more\n\nWould you like me to elaborate on any of these points?`,
      `Great question! Let me help you with that.\n\nBased on your input about "${input.substring(0, 30)}...", here are some thoughts:\n\n• The system is designed to be flexible and extensible\n• Multiple AI models can be used interchangeably\n• Conversations can be saved, exported, and managed\n\n*Note: Configure API keys for real AI responses.*`,
      `Thank you for your question. Here's what I can tell you:\n\n## Analysis\n\nYour query touches on: "${input.substring(0, 40)}..."\n\n### Response\n\nThis LibreChat-style interface provides:\n- **Multi-model support** - Switch between AI providers\n- **Conversation management** - Save, fork, and organize chats\n- **Rich features** - Editing, branching, presets\n\nIs there anything specific you'd like to explore?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Delete conversation
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    toast.success("Conversation deleted");
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
    );
  };

  // Edit message
  const startEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const saveEditMessage = () => {
    if (!activeConversation || !editingMessageId) return;

    setConversations(prev =>
      prev.map(c => c.id === activeConversation.id
        ? {
            ...c,
            messages: c.messages.map(m =>
              m.id === editingMessageId
                ? { ...m, content: editContent, isEdited: true }
                : m
            ),
          }
        : c
      )
    );
    setEditingMessageId(null);
    setEditContent("");
    toast.success("Message edited");
  };

  // Regenerate response
  const regenerateResponse = async (messageId: string) => {
    if (!activeConversation || isGenerating) return;

    const messageIndex = activeConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || activeConversation.messages[messageIndex].role !== 'assistant') return;

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const modelInfo = LITELLM_MODELS.find(m => m.id === selectedModel);
      const previousUserMessage = activeConversation.messages
        .slice(0, messageIndex)
        .reverse()
        .find(m => m.role === 'user');

      const newContent = generateDemoResponse(
        previousUserMessage?.content || "Regenerate",
        modelInfo?.name || selectedModel
      );

      setConversations(prev =>
        prev.map(c => c.id === activeConversation.id
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === messageIndex
                  ? { ...m, content: newContent, timestamp: new Date().toISOString() }
                  : m
              ),
            }
          : c
        )
      );
      toast.success("Response regenerated");
    } catch (error) {
      toast.error("Failed to regenerate");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  // Export conversation
  const exportConversation = (format: 'markdown' | 'json') => {
    if (!activeConversation) return;

    let content: string;
    let filename: string;

    if (format === 'markdown') {
      content = `# ${activeConversation.title}\n\n`;
      content += `*Created: ${new Date(activeConversation.createdAt).toLocaleString()}*\n\n`;
      content += `**Model:** ${activeConversation.model}\n\n---\n\n`;
      
      activeConversation.messages.forEach(m => {
        const role = m.role === 'user' ? '👤 User' : '🤖 Assistant';
        content += `### ${role}\n\n${m.content}\n\n---\n\n`;
      });
      
      filename = `chat-${activeConversation.id.substring(0, 8)}.md`;
    } else {
      content = JSON.stringify(activeConversation, null, 2);
      filename = `chat-${activeConversation.id.substring(0, 8)}.json`;
    }

    const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-72 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <Button onClick={createConversation} className="w-full gap-2">
            <Plus size={16} />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <Chat size={18} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.messages.length} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(conv.id);
                      }}
                    >
                      <Star
                        size={14}
                        weight={conv.isFavorite ? "fill" : "regular"}
                        className={conv.isFavorite ? "text-yellow-500" : ""}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Model Selector */}
        <div className="p-4 border-t">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {LITELLM_MODELS.slice(0, 15).map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {activeConversation && (
          <div className="h-14 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold">{activeConversation.title}</h2>
              <Badge variant="outline">
                {LITELLM_MODELS.find(m => m.id === activeConversation.model)?.name || activeConversation.model}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Export size={16} className="mr-2" />
                    Export
                    <CaretDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportConversation('markdown')}>
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportConversation('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto py-4">
            {!activeConversation ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Robot size={64} className="text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start a New Chat</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Click "New Chat" or start typing to begin a conversation with AI.
                  Inspired by LibreChat's powerful features.
                </p>
              </div>
            ) : activeConversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Sparkle size={48} className="text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                <div className="grid grid-cols-2 gap-2 mt-4 max-w-lg">
                  {[
                    "Explain quantum computing",
                    "Write a Python script",
                    "Summarize a document",
                    "Help me brainstorm ideas",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="h-auto py-3 px-4 justify-start text-left"
                      onClick={() => {
                        setInputMessage(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 px-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {message.role === 'user' ? <User size={16} /> : <Robot size={16} />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={saveEditMessage}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        )}
                        {message.isEdited && (
                          <span className="text-xs opacity-70 mt-1 block">(edited)</span>
                        )}
                      </div>
                      
                      {/* Message Actions */}
                      <div className={`flex items-center gap-1 mt-1 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy size={12} className="mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => startEditMessage(message)}
                        >
                          <PencilSimple size={12} className="mr-1" />
                          Edit
                        </Button>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => regenerateResponse(message.id)}
                            disabled={isGenerating}
                          >
                            <ArrowCounterClockwise size={12} className="mr-1" />
                            Regenerate
                          </Button>
                        )}
                        {message.model && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {message.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted">
                        <Robot size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowsClockwise size={16} className="animate-spin" />
                      <span className="text-sm">Generating response...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[60px] max-h-[200px] pr-24 resize-none"
                  disabled={isGenerating}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ImageSquare size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Microphone size={18} />
                  </Button>
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                className="h-[60px] px-6"
              >
                {isGenerating ? (
                  <ArrowsClockwise size={20} className="animate-spin" />
                ) : (
                  <PaperPlaneTilt size={20} />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
