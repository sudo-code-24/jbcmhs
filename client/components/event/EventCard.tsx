"use client";

import { useCallback, useMemo, useState } from "react";
import { formatDateRange } from "@/lib/formatDate";
import EventCardList from "./EventCardList";
import EventCardGrid from "./EventCardGrid";
import EventModal from "./EventModal";
import type { EventCardProps } from "./types";

const EventCard = ({ event, view = "list", calendarEmbedUrl }: EventCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateLabel = useMemo(
    () => formatDateRange(event.date, event.endDate),
    [event.date, event.endDate]
  );
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const isGrid = view === "grid";

  return (
    <>
      {isGrid ? (
        <EventCardGrid event={event} dateLabel={dateLabel} onOpen={onOpen} />
      ) : (
        <EventCardList event={event} dateLabel={dateLabel} onOpen={onOpen} />
      )}

      <EventModal
        open={isOpen}
        onClose={onClose}
        event={event}
        dateLabel={dateLabel}
        calendarEmbedUrl={calendarEmbedUrl}
      />
    </>
  );
};

export default EventCard;
