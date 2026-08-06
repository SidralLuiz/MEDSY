import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto'));

// Client no browser: usa cookies httpOnly (lidos pelo middleware.ts)
// No server: fallback sem persistência de sessão (apenas chamadas anon/RLS)
export const supabase = isSupabaseConfigured
  ? typeof window !== 'undefined'
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      })
  : null;
