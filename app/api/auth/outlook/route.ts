import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { error, user } = await requireAuth();
  if (error || !user) return NextResponse.redirect(new URL('/', request.url));

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const redirectUri =
    (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/outlook/callback';

  if (!clientId) {
    const returnUrl = new URL('/', request.url);
    returnUrl.searchParams.set('connected', 'outlook');
    return NextResponse.redirect(returnUrl);
  }

  // Anti-CSRF: nonce aleatório ligado à sessão
  const state = randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('scope', 'Calendars.ReadWrite offline_access User.Read');
  authUrl.searchParams.set('state', JSON.stringify({ state, userId: user.id }));

  return NextResponse.redirect(authUrl.toString());
}
