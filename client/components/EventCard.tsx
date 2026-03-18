"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentListCard from "@/components/ContentListCard";
import Modal from "@/components/ui/modal";

type CardView = "list" | "grid";

const typeStyles: Record<string, string> = {
  academic: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/15 dark:text-sky-200",
  event: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-200",
  sports: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-200",
  default: "border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
};

function getTypeStyle(type: string): string {
  const key = type?.toLowerCase() ?? "default";
  return typeStyles[key] ?? typeStyles.default;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string | Date, end?: string | Date): string {
  const startLabel = formatDate(start);
  if (!end) return startLabel;
  return `${startLabel} - ${formatDate(end)}`;
}

function toGoogleCalendarEmbedDayUrl(date: string | Date, calendarEmbedUrl?: string): string {
  let year = "";
  let month = "";
  let day = "";

  // Keep original YYYY-MM-DD values when available to avoid timezone shifts.
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
}

type EventCardProps = {
  event: Event;
  view?: CardView;
  calendarEmbedUrl?: string;
};

export default function EventCard({ event, view = "list", calendarEmbedUrl }: EventCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const style = getTypeStyle(event.type);
  const dateLabel = formatDateRange(event.date, event.endDate);
  const googleCalendarEmbedDayUrl = toGoogleCalendarEmbedDayUrl(event.date, calendarEmbedUrl);

  if (view === "grid") {
    return (
      <>
        <Card className="flex h-full flex-col border border-border/70 bg-card text-card-foreground shadow-md dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-100 dark:shadow-lg">
          <CardHeader className="space-y-2 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`inline-flex items-center gap-1.5 border ${style}`} variant="outline">
                {event.type}
              </Badge>
              <time className="text-xs text-muted-foreground dark:text-slate-300" dateTime={event.date}>
                {dateLabel}
              </time>
            </div>
            <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight text-foreground dark:text-white">
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-2">
            <p className="line-clamp-3 text-sm text-muted-foreground dark:text-slate-200">
              {event.description || "No additional details."}
            </p>
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => setIsViewOpen(true)}>
                View
              </Button>
            </div>
          </CardContent>
        </Card>
        <Modal open={isViewOpen} onClose={() => setIsViewOpen(false)} title={event.title} size="2xl">
          <div className="space-y-3">
            <time className="block text-sm text-muted-foreground" dateTime={event.date}>
              {dateLabel}
            </time>
            <div className="overflow-hidden rounded-md border bg-muted/20">
              <iframe
                src={googleCalendarEmbedDayUrl}
                title={`Google Calendar schedule view for ${event.title}`}
                className="h-[560px] w-full"
                loading="lazy"
              />
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <ContentListCard
        badge={
          <Badge className={`inline-flex items-center gap-1.5 border ${style}`} variant="outline">
            {event.type}
          </Badge>
        }
        meta={
          <time className="text-xs text-muted-foreground dark:text-slate-300" dateTime={event.date}>
            {dateLabel}
          </time>
        }
        title={event.title}
        description={event.description}
        action={
          <Button size="sm" variant="outline" onClick={() => setIsViewOpen(true)}>
            View
          </Button>
        }
      />
      <Modal open={isViewOpen} onClose={() => setIsViewOpen(false)} title={event.title} size="2xl">
        <div className="space-y-3">
          <time className="block text-sm text-muted-foreground" dateTime={event.date}>
            {dateLabel}
          </time>
          <div className="overflow-hidden rounded-md border bg-muted/20">
            <iframe
              src={googleCalendarEmbedDayUrl}
              title={`Google Calendar schedule view for ${event.title}`}
              className="h-[560px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
