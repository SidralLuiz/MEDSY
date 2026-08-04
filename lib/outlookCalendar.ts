import 'isomorphic-fetch';

export interface OutlookEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  attendeeEmail?: string;
}

export async function createOutlookCalendarEvent(
  accessToken: string | undefined,
  payload: OutlookEventPayload
): Promise<string> {
  try {
    if (accessToken) {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: payload.summary,
          body: {
            contentType: 'HTML',
            content: payload.description
          },
          start: {
            dateTime: payload.startDateTime,
            timeZone: 'E. South America Standard Time'
          },
          end: {
            dateTime: payload.endDateTime,
            timeZone: 'E. South America Standard Time'
          },
          attendees: payload.attendeeEmail ? [
            {
              emailAddress: { address: payload.attendeeEmail },
              type: 'required'
            }
          ] : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.id || 'o_evt_' + Date.now();
      }
    }
  } catch (err) {
    console.warn('Microsoft Graph API sync notice:', err);
  }

  // Id simulado em modo de demonstração / dev
  return 'o_evt_' + Math.random().toString(36).substring(2, 9);
}

export async function deleteOutlookCalendarEvent(
  accessToken: string | undefined,
  eventId: string
): Promise<boolean> {
  try {
    if (accessToken && !eventId.startsWith('o_evt_')) {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.ok;
    }
    return true;
  } catch (err) {
    return false;
  }
}
