import { NextResponse } from 'next/server';
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

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri =
    (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/outlook/callback';

  if (code && clientId && clientSecret) {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (response.ok) {
        const tokens = await response.json();
        const { supabase } = await requireAuth();
        if (supabase) {
          const { error: rpcError } = await supabase.rpc('gravar_tokens_oauth', {
            p_provider: 'outlook',
            p_access_token: tokens.access_token ?? null,
            p_refresh_token: tokens.refresh_token ?? null,
            p_expiry: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
          });
          if (rpcError) console.error('Erro ao gravar tokens Outlook:', rpcError);
        }
      }
    } catch (err) {
      console.error('Erro no callback do Outlook OAuth:', err);
    }
  }

  const returnUrl = new URL('/', request.url);
  returnUrl.searchParams.set('connected', 'outlook');
  return NextResponse.redirect(returnUrl);
}
