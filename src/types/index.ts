export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  created_at: string;
  chat_id: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface Chat {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
  status: 'success' | 'error';
}

// Tool types
export interface ImageGenerationResult {
  image_url: string;
  prompt: string;
  status: 'success' | 'error';
}

export interface InstagramScraperResult {
  posts: InstagramPost[];
  status: 'success' | 'error';
}

export interface InstagramPost {
  id: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  display_url: string;
  owner_username: string;
  timestamp: string;
}

export interface ReplicatedImageResult {
  original_post: InstagramPost;
  generated_image_url: string;
  status: 'success' | 'error';
}
