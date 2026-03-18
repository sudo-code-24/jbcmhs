import { getCalendarApi } from "./googleClients";

type CalendarEventInput = {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type?: string;
};

function getCalendarId(): string | null {
  const id = process.env.GOOGLE_CALENDAR_ID?.trim();
  return id ? id : null;
}

function normalizeEndDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000);
  if (Number.isNaN(start.getTime())) return new Date().toISOString();
  if (Number.isNaN(end.getTime()) || end <= start) {
    return new Date(start.getTime() + 60 * 60 * 1000).toISOString();
  }
  return end.toISOString();
}

function toCalendarEventPayload(input: CalendarEventInput) {
  const startIso = new Date(input.startDate).toISOString();
  const endIso = normalizeEndDate(startIso, input.endDate);
  return {
    summary: input.title,
    description: input.description ?? "",
    start: { dateTime: startIso },
    end: { dateTime: endIso },
    extendedProperties: input.type
      ? {
          private: {
            eventType: input.type,
          },
        }
      : undefined,
  };
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<string | undefined> {
  const calendarId = getCalendarId();
  if (!calendarId) return undefined;

  const calendar = getCalendarApi();
  const response = await calendar.events.insert({
    calendarId,
    requestBody: toCalendarEventPayload(input),
  });

  return response.data.id ?? undefined;
}

export async function upsertCalendarEvent(
  googleEventId: string | undefined,
  input: CalendarEventInput
): Promise<string | undefined> {
  const calendarId = getCalendarId();
  if (!calendarId) return undefined;

  const calendar = getCalendarApi();
  if (!googleEventId) {
    return createCalendarEvent(input);
  }

  await calendar.events.update({
    calendarId,
    eventId: googleEventId,
    requestBody: toCalendarEventPayload(input),
  });
  return googleEventId;
}

export async function deleteCalendarEvent(googleEventId: string | undefined): Promise<void> {
  const calendarId = getCalendarId();
  if (!calendarId || !googleEventId) return;

  const calendar = getCalendarApi();
  await calendar.events.delete({
    calendarId,
    eventId: googleEventId,
  });
}

