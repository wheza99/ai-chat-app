import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return 'https://placeholder.supabase.co';
  }
  return url;
}

function getSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    return 'placeholder-key';
  }
  return key;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(getSupabaseUrl(), getSupabaseKey());
  }
  return supabaseInstance;
}

// For backwards compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

// Server-side client with service role for admin operations
export function createServerClient(): SupabaseClient {
  return createClient(
    getSupabaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseKey()
  );
}
