import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

// Singleton for client-side
let client: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (typeof window !== 'undefined') {
      if (!client) {
        client = createClient();
      }
      return client[prop as keyof typeof client];
    }
    // Server-side: create a new client each time or use a different approach
    return createClient()[prop as keyof ReturnType<typeof createClient>];
  }
});

// Server-side client
export function createServerClient() {
  return createClient();
}
