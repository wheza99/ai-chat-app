import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const chatId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase.from('chats').insert({
      id: chatId,
      user_id: userId,
      title: title || 'New Chat',
      created_at: now,
      updated_at: now,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat: data });
  } catch (error: any) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chats: data });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  // Delete messages first
  await supabase.from('messages').delete().eq('chat_id', chatId);

  // Delete chat
  const { error } = await supabase.from('chats').delete().eq('id', chatId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
