import { getEvents } from "@/lib/api";
import CalendarEmbedToggle from "@/components/CalendarEmbedToggle";
import EventsDashboard from "@/components/EventsDashboard";
import { Button } from "@/components/ui/button";

export const revalidate = 0;
export const dynamic = "force-dynamic";
const GOOGLE_CALENDAR_EMBED_URL =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL ??
  process.env.GOOGLE_CALENDAR_EMBED_URL ??
  "";

export default async function CalendarPage() {
  const events = await getEvents().catch(() => []);

  return (
    <div className="container-wide py-8 sm:py-10 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">School Calendar</h1>
        <Button
          type="button"
          variant="outline"
          disabled
          title="Placeholder – PDF download not implemented"
        >
          Download as PDF
        </Button>
      </div>

      <CalendarEmbedToggle src={GOOGLE_CALENDAR_EMBED_URL} />
      <div className="mt-6">
        <EventsDashboard events={events} />
      </div>
    </div>
  );
}
