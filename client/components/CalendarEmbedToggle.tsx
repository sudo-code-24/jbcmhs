"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


type CalendarEmbedToggleProps = {
  src: string;
};

export default function CalendarEmbedToggle({ src }: CalendarEmbedToggleProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const hasCalendarUrl = Boolean(src?.trim());

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={!hasCalendarUrl}
          onClick={() => setShowCalendar((prev) => !prev)}
        >
          Calendar View
        </Button>

      </div>

      {showCalendar && hasCalendarUrl ? (
        <div className="mt-6 overflow-hidden rounded-lg border bg-card p-2">
          <iframe
            src={src}
            style={{ border: 0 }}
            width="100%"
            height="700"
            frameBorder="0"
            scrolling="no"
            title="School Google Calendar"
          />
        </div>
      ) : null}
      {!hasCalendarUrl ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Calendar embed URL is missing. Set `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL` in `client/.env`.
        </p>
      ) : null}
    </div>
  );
}

