import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { error, user } = await requireAuth();
  if (error || !user) return NextResponse.redirect(new URL('/', request.url));

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    const returnUrl = new URL('/', request.url);
    returnUrl.searchParams.set('connected', 'google');
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

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state: JSON.stringify({ state, userId: user.id }),
  });

  return NextResponse.redirect(authUrl);
}
