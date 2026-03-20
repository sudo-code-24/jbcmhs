import { getEvents } from "@/lib/api";
import CalendarEmbedToggle from "@/components/CalendarEmbedToggle";
import DownloadCalendarPdfButton from "@/components/DownloadCalendarPdfButton";
import EventsDashboard from "@/components/event/EventsDashboard";

export const revalidate = 0;
export const dynamic = "force-dynamic";
const GOOGLE_CALENDAR_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL ??
  process.env.GOOGLE_CALENDAR_EMBED_URL ??
  "";

export default async function CalendarPage() {
  const events = await getEvents().catch(() => []);

  return (
    <div className="container-wide py-3 sm:py-4">
      <div className="page-radial-surface text-foreground dark:text-slate-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 dark:border-white/[0.06]">
          <h1 className="text-xl font-bold text-foreground dark:text-slate-50 sm:text-2xl">
            School Calendar
          </h1>
          <DownloadCalendarPdfButton events={events} />
        </div>

        <CalendarEmbedToggle src={GOOGLE_CALENDAR_EMBED_URL} />
        <div className="mt-6">
          <EventsDashboard events={events} calendarEmbedUrl={GOOGLE_CALENDAR_EMBED_URL} />
        </div>
      </div>
    </div>
  );
}
