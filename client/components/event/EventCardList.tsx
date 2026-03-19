"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentListCard from "@/components/shared/ContentListCard";
import { getTypeStyle } from "./typeConfig";
import type { EventCardListProps } from "./types";

const EventCardList = ({ event, dateLabel, onOpen }: EventCardListProps) => {
  const style = getTypeStyle(event.type);

  return (
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
        <Button size="sm" variant="outline" onClick={onOpen}>
          View
        </Button>
      }
    />
  );
};

export default EventCardList;
