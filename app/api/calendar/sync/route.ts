import { NextResponse } from 'next/server';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/googleCalendar';
import { createOutlookCalendarEvent, deleteOutlookCalendarEvent } from '@/lib/outlookCalendar';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload, eventId, provider } = body;

    if (action === 'CREATE') {
      const googleEventId = await createGoogleCalendarEvent(undefined, undefined, payload);
      const outlookEventId = await createOutlookCalendarEvent(undefined, payload);

      return NextResponse.json({
        success: true,
        google_event_id: googleEventId,
        outlook_event_id: outlookEventId
      });
    }

    if (action === 'DELETE') {
      if (provider === 'google' && eventId) {
        await deleteGoogleCalendarEvent(undefined, undefined, eventId);
      }
      if (provider === 'outlook' && eventId) {
        await deleteOutlookCalendarEvent(undefined, eventId);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
