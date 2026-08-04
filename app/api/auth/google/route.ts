import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'f1000000-0000-0000-0000-000000000001';

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/google/callback';

  // Atualiza a conexão no banco/estado
  await dbService.toggleCalendarConnection(userId, 'google', true);

  if (!clientId || !clientSecret) {
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
