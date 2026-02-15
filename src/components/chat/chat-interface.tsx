'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Bot, User, Image as ImageIcon, Instagram } from 'lucide-react';
import type { Message, ToolCall } from '@/types';

interface ChatInterfaceProps {
  chatId: string;
  userId: string;
}

export function ChatInterface({ chatId, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
      chat_id: chatId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          chatId,
          userId,
        }),
      });

      const data = await res.json();

      if (data.message) {
        const assistantMessage: Message = {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString(),
          chat_id: chatId,
          tool_calls: data.toolCalls,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderToolCall = (toolCall: ToolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    const isImageGen = toolCall.function.name === 'generate_image';
    const isInstagram = toolCall.function.name.includes('instagram');

    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
        {isImageGen && <ImageIcon className="h-4 w-4 text-purple-500" />}
        {isInstagram && <Instagram className="h-4 w-4 text-pink-500" />}
        <span className="font-medium">{toolCall.function.name}</span>
        <span className="text-muted-foreground">
          {args.prompt || args.query || args.post_caption}
        </span>
      </div>
    );
  };

  const renderMessageContent = (content: string) => {
    // Check if content is JSON (tool result)
    try {
      const parsed = JSON.parse(content);
      if (parsed.image_url) {
        return (
          <div className="space-y-2">
            <p className="text-green-600">✓ Image generated successfully!</p>
            <img 
              src={parsed.image_url} 
              alt="Generated" 
              className="max-w-full rounded-lg border shadow-sm"
            />
          </div>
        );
      }
      if (parsed.posts) {
        return (
          <div className="space-y-2">
            <p className="text-green-600">✓ Found {parsed.posts.length} posts!</p>
            {parsed.posts.slice(0, 3).map((post: any, i: number) => (
              <div key={i} className="p-2 bg-muted rounded-md">
                <p className="text-sm truncate">{post.caption || 'No caption'}</p>
                <p className="text-xs text-muted-foreground">
                  ❤️ {post.likes_count} 💬 {post.comments_count}
                </p>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      // Not JSON, render as text
    }
    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-2rem)]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Chat with Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="h-12 w-12 mb-4" />
              <p>Start a conversation!</p>
              <p className="text-sm mt-2">Try: "Generate an image of a sunset"</p>
              <p className="text-sm">Or: "Search Instagram for #nature"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'tool'
                        ? 'bg-muted'
                        : 'bg-muted'
                    }`}
                  >
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {message.tool_calls.map((tc, i) => (
                          <div key={i}>{renderToolCall(tc)}</div>
                        ))}
                      </div>
                    )}
                    {renderMessageContent(message.content)}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={sending || !input.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tips: Ask to generate images, search Instagram, or replicate Instagram posts!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
