import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'f1000000-0000-0000-0000-000000000001';

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/outlook/callback';

  // Atualiza a conexão no banco/estado
  await dbService.toggleCalendarConnection(userId, 'outlook', true);

  if (!clientId) {
    const returnUrl = new URL('/', request.url);
    returnUrl.searchParams.set('connected', 'outlook');
    returnUrl.searchParams.set('userId', userId);
    return NextResponse.redirect(returnUrl);
  }

  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('scope', 'Calendars.ReadWrite offline_access User.Read');
  authUrl.searchParams.set('state', userId);

  return NextResponse.redirect(authUrl.toString());
}
