import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  text: string;
  by: 'user' | 'admin' | string;
  at?: string;
}

interface ChatPanelProps {
  title?: string;
  description?: string;
  messages: ChatMessage[];
  pending?: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  emptyState?: string;
}

export default function ChatPanel({
  title = 'Messages',
  description = 'Chat interface',
  messages,
  pending,
  input,
  setInput,
  onSend,
  placeholder = 'Type your message...',
  emptyState = 'No messages yet. Start the conversation!'
}: ChatPanelProps) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={listRef} className="h-80 overflow-auto pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {emptyState}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.by === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm border shadow-sm ${m.by === 'user' ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-card text-foreground border-border'}`}>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    {m.at ? <div className={`mt-1 text-[10px] ${m.by === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{m.at}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="flex-1 h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 ring-primary/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button onClick={onSend} disabled={!input.trim() || !!pending} className="gap-2">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
