"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalendarEvent = createCalendarEvent;
exports.upsertCalendarEvent = upsertCalendarEvent;
exports.deleteCalendarEvent = deleteCalendarEvent;
const googleClients_1 = require("./googleClients");
function getCalendarId() {
    const id = process.env.GOOGLE_CALENDAR_ID?.trim();
    return id ? id : null;
}
function normalizeEndDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000);
    if (Number.isNaN(start.getTime()))
        return new Date().toISOString();
    if (Number.isNaN(end.getTime()) || end <= start) {
        return new Date(start.getTime() + 60 * 60 * 1000).toISOString();
    }
    return end.toISOString();
}
function toCalendarEventPayload(input) {
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
async function createCalendarEvent(input) {
    const calendarId = getCalendarId();
    if (!calendarId)
        return undefined;
    const calendar = (0, googleClients_1.getCalendarApi)();
    const response = await calendar.events.insert({
        calendarId,
        requestBody: toCalendarEventPayload(input),
    });
    return response.data.id ?? undefined;
}
async function upsertCalendarEvent(googleEventId, input) {
    const calendarId = getCalendarId();
    if (!calendarId)
        return undefined;
    const calendar = (0, googleClients_1.getCalendarApi)();
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
async function deleteCalendarEvent(googleEventId) {
    const calendarId = getCalendarId();
    if (!calendarId || !googleEventId)
        return;
    const calendar = (0, googleClients_1.getCalendarApi)();
    await calendar.events.delete({
        calendarId,
        eventId: googleEventId,
    });
}
//# sourceMappingURL=googleCalendar.js.map