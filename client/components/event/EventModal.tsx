"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toGoogleCalendarEmbedDayUrl } from "./utils";
import type { EventModalProps } from "./types";

const EventModal = ({
  open,
  onClose,
  event,
  dateLabel,
  calendarEmbedUrl,
}: EventModalProps) => {
  const embedUrl = useMemo(
    () => (calendarEmbedUrl ? toGoogleCalendarEmbedDayUrl(event.date, calendarEmbedUrl) : ""),
    [event.date, calendarEmbedUrl]
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent maxWidth="2xl">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
      <div className="space-y-3">
        <time className="block text-sm text-muted-foreground" dateTime={event.date}>
          {dateLabel}
        </time>
        {embedUrl ? (
          <div className="overflow-hidden rounded-md border bg-muted/20">
            <iframe
              src={embedUrl}
              title={`Google Calendar schedule view for ${event.title}`}
              className="h-[560px] w-full"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
