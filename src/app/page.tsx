'use client';

import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !currentChatId) {
        createNewChat(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      // Try to load existing chats or create new one
      const res = await fetch(`/api/chats?userId=${user.id}`);
      const data = await res.json();
      if (data.chats && data.chats.length > 0) {
        setCurrentChatId(data.chats[0].id);
      } else {
        createNewChat(user.id);
      }
    }
    setLoading(false);
  };

  const createNewChat = async (userId: string) => {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: 'New Chat' }),
    });
    const data = await res.json();
    if (data.chat) {
      setCurrentChatId(data.chat.id);
    }
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    createNewChat(authenticatedUser.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    if (user) {
      createNewChat(user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        userId={user.id}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-4">
        {currentChatId ? (
          <ChatInterface chatId={currentChatId} userId={user.id} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Create a new chat to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
