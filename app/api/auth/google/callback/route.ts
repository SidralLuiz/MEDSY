import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Validação anti-CSRF: state deve bater com o nonce do cookie
  const cookieStore = await cookies();
  const expected = cookieStore.get('oauth_state')?.value;
  let s: { state?: string; userId?: string } = {};
  try {
    s = JSON.parse(searchParams.get('state') || '{}');
  } catch {
    s = {};
  }
  if (!expected || s.state !== expected) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  cookieStore.delete('oauth_state');

  const { error, user } = await requireAuth();
  if (error || !user || (s.userId && s.userId !== user.id)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/google/callback';

  if (code && clientId && clientSecret) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);

      // Grava via RPC SECURITY DEFINER (criptografa os tokens em repouso)
      const { supabase } = await requireAuth();
      if (supabase) {
        const { error: rpcError } = await supabase.rpc('gravar_tokens_oauth', {
          p_provider: 'google',
          p_access_token: tokens.access_token ?? null,
          p_refresh_token: tokens.refresh_token ?? null,
          p_expiry: tokens.expiry_date ?? null,
        });
        if (rpcError) console.error('Erro ao gravar tokens Google:', rpcError);
      }
    } catch (err) {
      console.error('Erro no callback do Google OAuth:', err);
    }
  }

  const returnUrl = new URL('/', request.url);
  returnUrl.searchParams.set('connected', 'google');
  return NextResponse.redirect(returnUrl);
}
