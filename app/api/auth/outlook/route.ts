import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'u1';

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const redirectUri = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173') + '/api/auth/outlook/callback';

  if (!clientId) {
    // Se não tiver as chaves da Microsoft no .env.local, simula a conexão com o Outlook para demonstração
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
