"use client";

import { useMemo } from "react";
import Modal from "@/components/ui/modal";
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
    <Modal open={open} onClose={onClose} title={event.title} size="2xl">
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
    </Modal>
  );
};

export default EventModal;
