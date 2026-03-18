type CalendarEventInput = {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    type?: string;
};
export declare function createCalendarEvent(input: CalendarEventInput): Promise<string | undefined>;
export declare function upsertCalendarEvent(googleEventId: string | undefined, input: CalendarEventInput): Promise<string | undefined>;
export declare function deleteCalendarEvent(googleEventId: string | undefined): Promise<void>;
export {};
//# sourceMappingURL=googleCalendar.d.ts.map