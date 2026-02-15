-- SQL Schema for AI Chat App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'New Chat',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for chats table
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in own chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own chats" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update chat's updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_chat_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET updated_at = NOW() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_on_message();

-- Grant permissions for anon key (if needed for client-side operations)
-- Note: In production, you may want to restrict this further
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
