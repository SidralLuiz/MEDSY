import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state') || 'u1';

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/outlook/callback';

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
          grant_type: 'authorization_code'
        })
      });

      if (response.ok) {
        const tokens = await response.json();
        if (isSupabaseConfigured && supabase) {
          await supabase.from('usuarios').update({
            outlook_connected: true,
            outlook_access_token: tokens.access_token,
            outlook_refresh_token: tokens.refresh_token,
            outlook_token_expiry: Date.now() + (tokens.expires_in * 1000)
          }).eq('id', userId);
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
