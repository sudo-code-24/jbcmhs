/**
 * Build Google Calendar embed URL for a specific day
 */
export const toGoogleCalendarEmbedDayUrl = (
  date: string | Date,
  calendarEmbedUrl?: string
): string => {
  let year = "";
  let month = "";
  let day = "";

  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      [, year, month, day] = match;
    }
  }

  if (!year || !month || !day) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "https://calendar.google.com/calendar/embed";
    }
    year = String(parsed.getFullYear());
    month = String(parsed.getMonth() + 1).padStart(2, "0");
    day = String(parsed.getDate()).padStart(2, "0");
  }

  const compactDate = `${year}${month}${day}`;
  const dates = `${compactDate}/${compactDate}`;
  const fallback = `https://calendar.google.com/calendar/embed?mode=AGENDA&dates=${dates}`;
  if (!calendarEmbedUrl) return fallback;

  try {
    const url = new URL(calendarEmbedUrl);
    url.searchParams.set("mode", "AGENDA");
    url.searchParams.set("dates", dates);
    return url.toString();
  } catch {
    return fallback;
  }
};
