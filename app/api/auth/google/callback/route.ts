import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state') || 'u1';

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/google/callback';

  if (code && clientId && clientSecret) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('usuarios').update({
          google_connected: true,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expiry: tokens.expiry_date
        }).eq('id', userId);
      }
    } catch (err) {
      console.error('Erro no callback do Google OAuth:', err);
    }
  }

  const returnUrl = new URL('/', request.url);
  returnUrl.searchParams.set('connected', 'google');
  return NextResponse.redirect(returnUrl);
}
