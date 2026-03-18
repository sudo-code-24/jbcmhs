import type { Event } from "@/lib/types";
import EventCard from "./EventCard";
import { Card, CardContent } from "@/components/ui/card";

function groupByMonth(events: Event[]): { label: string; items: Event[] }[] {
  const groups: Record<string, Event[]> = {};
  for (const e of events) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([key, items]) => ({
    label: new Date(key + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    items: items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  }));
}

export default function EventList({ events }: { events: Event[] }) {
  if (!events?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">No events scheduled.</CardContent>
      </Card>
    );
  }
  const byMonth = groupByMonth(events);
  return (
    <div className="space-y-6">
      {byMonth.map(({ label, items }) => (
        <section key={label} className="animate-slide-up">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </h3>
          <ul className="space-y-3">
            {items.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
