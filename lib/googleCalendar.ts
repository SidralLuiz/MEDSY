import { google } from 'googleapis';

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  attendeeEmail?: string;
}

export async function createGoogleCalendarEvent(
  accessToken: string | undefined,
  refreshToken: string | undefined,
  payload: CalendarEventPayload
): Promise<string> {
  try {
    if (accessToken || refreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: payload.summary,
          description: payload.description,
          start: {
            dateTime: payload.startDateTime,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: payload.endDateTime,
            timeZone: 'America/Sao_Paulo',
          },
          attendees: payload.attendeeEmail ? [{ email: payload.attendeeEmail }] : [],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
        },
      });

      return response.data.id || 'g_evt_' + Date.now();
    }
  } catch (error) {
    console.warn('Google Calendar API sync notice:', error);
  }

  // Id simulado em modo de demonstração / dev
  return 'g_evt_' + Math.random().toString(36).substring(2, 9);
}

export async function deleteGoogleCalendarEvent(
  accessToken: string | undefined,
  refreshToken: string | undefined,
  eventId: string
): Promise<boolean> {
  try {
    if ((accessToken || refreshToken) && !eventId.startsWith('g_evt_')) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      await calendar.events.delete({ calendarId: 'primary', eventId });
    }
    return true;
  } catch (err) {
    return false;
  }
}
