import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from './supabase';

export async function getAuth() {
  if (!isSupabaseConfigured) {
    return { user: null, supabase: null, error: null };
  }
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase: null, error };
  return { user, supabase, error: null };
}

export async function requireAuth() {
  const auth = await getAuth();
  if (!auth.user || !auth.supabase) {
    return { error: 'Não autorizado', user: null, supabase: null };
  }
  return { error: null, user: auth.user, supabase: auth.supabase };
}
