'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, LogOut } from 'lucide-react';
import type { Chat } from '@/types';

interface ChatSidebarProps {
  userId: string;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export function ChatSidebar({ userId, currentChatId, onSelectChat, onNewChat, onLogout }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [userId]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chats?userId=${userId}`);
      const data = await res.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
    setLoading(false);
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chats?chatId=${chatId}`, { method: 'DELETE' });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <Button onClick={onNewChat} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <p className="text-sm text-slate-400 p-2">Loading...</p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-slate-400 p-2">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-slate-800 ${
                  currentChatId === chat.id ? 'bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm">{chat.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  onClick={(e) => deleteChat(chat.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700">
        <Button onClick={onLogout} variant="ghost" className="w-full text-slate-300 hover:text-white">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
