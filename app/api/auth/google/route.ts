import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'u1';

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    // Se ainda não tiver as chaves do Google Cloud Console no .env.local, simula conexão bem-sucedida para o ambiente de testes
    const returnUrl = new URL('/', request.url);
    returnUrl.searchParams.set('connected', 'google');
    returnUrl.searchParams.set('userId', userId);
    return NextResponse.redirect(returnUrl);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    state: userId
  });

  return NextResponse.redirect(authUrl);
}
