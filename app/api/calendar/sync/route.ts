import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/googleCalendar';
import { createOutlookCalendarEvent, deleteOutlookCalendarEvent } from '@/lib/outlookCalendar';

const EventoSchema = z.object({
  summary: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  attendeeEmail: z.string().email().optional(),
});

const ReqSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('CREATE'), payload: EventoSchema }),
  z.object({
    action: z.literal('DELETE'),
    provider: z.enum(['google', 'outlook']),
    eventId: z.string().min(1).max(200),
  }),
]);

export async function POST(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const parsed = ReqSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { action } = parsed.data;
  if (action === 'CREATE') {
    const googleEventId = await createGoogleCalendarEvent(undefined, undefined, parsed.data.payload);
    const outlookEventId = await createOutlookCalendarEvent(undefined, parsed.data.payload);
    return NextResponse.json({
      success: true,
      google_event_id: googleEventId,
      outlook_event_id: outlookEventId,
    });
  }

  if (action === 'DELETE') {
    if (parsed.data.provider === 'google') {
      await deleteGoogleCalendarEvent(undefined, undefined, parsed.data.eventId);
    } else {
      await deleteOutlookCalendarEvent(undefined, parsed.data.eventId);
    }
    return NextResponse.json({ success: true });
  }
}
