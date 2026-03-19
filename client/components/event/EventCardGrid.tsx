"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTypeStyle } from "./typeConfig";
import type { EventCardGridProps } from "./types";

const EventCardGrid = ({ event, dateLabel, onOpen }: EventCardGridProps) => {
  const style = getTypeStyle(event.type);

  return (
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
          <Button size="sm" variant="outline" onClick={onOpen}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCardGrid;
