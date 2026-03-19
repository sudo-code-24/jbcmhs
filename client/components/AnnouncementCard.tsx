"use client";

import { useMemo, useState } from "react";
import type { Announcement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ContentListCard from "@/components/ContentListCard";
import { CalendarDays, Megaphone, Bell } from "lucide-react";
import Modal from "./ui/modal";

type CardView = "list" | "grid";

const categoryConfig: Record<
  string,
  {
    badge: string;
    button: string;
    icon: JSX.Element;
  }
> = {
  General: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-200",
    button: "bg-blue-600 text-white hover:bg-blue-500",
    icon: <Megaphone className="h-3.5 w-3.5" />,
  },
  Events: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-200",
    button: "bg-violet-600 text-white hover:bg-violet-500",
    icon: <CalendarDays className="h-3.5 w-3.5" />,
  },
  default: {
    badge:
      "border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    button: "bg-slate-700 text-white hover:bg-slate-600",
    icon: <Bell className="h-3.5 w-3.5" />,
  },
};

function AnnouncementModal({
  open,
  onClose,
  announcement,
  longDate,
}: any) {
  return (
    <Modal open={open} onClose={onClose} title={announcement.title} size="2xl">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
          {announcement.category}
        </Badge>
        <time className="text-2xl sm:text-3xl" dateTime={announcement.datePosted}>
          {longDate}
        </time>
      </div>

      {announcement.imageUrl && (
        <div className="mb-5 overflow-hidden rounded-2xl border bg-muted/50">
          <img
            src={announcement.imageUrl.trim() || "/placeholder.jpg"}
            alt={announcement.title}
            className="h-56 w-full object-contain sm:h-72"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("/placeholder.jpg")) {
                target.src = "/placeholder.jpg";
              }
            }}
          />
        </div>
      )}

      <p className="text-lg sm:text-xl">{announcement.content}</p>
    </Modal>
  );
}

export default function AnnouncementCard({
  announcement,
  view = "list",
}: {
  announcement: Announcement;
  view?: CardView;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const config = categoryConfig[announcement.category] ?? categoryConfig.default;

  const { shortDate, longDate } = useMemo(() => {
    const date = new Date(announcement.datePosted);
    return {
      shortDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      longDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, [announcement.datePosted]);

  const isGrid = view === "grid";

  if (!isGrid) {
    return (
      <>
        <ContentListCard
          badge={
            <Badge className={`inline-flex items-center gap-1.5 border ${config.badge}`} variant="outline">
              {config.icon}
              {announcement.category}
            </Badge>
          }
          meta={<time className="text-xs" dateTime={announcement.datePosted}>{shortDate}</time>}
          title={announcement.title}
          description={announcement.content}
          action={
            <Button size="sm" className={`font-bold ${config.button}`} onClick={() => setIsOpen(true)}>
              Read More
            </Button>
          }
        />

        <AnnouncementModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          announcement={announcement}
          longDate={longDate}
        />
      </>
    );
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <div className="flex justify-between">
            <Badge variant="outline">{announcement.category}</Badge>
            <time>{shortDate}</time>
          </div>
          <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="line-clamp-3">{announcement.content}</p>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={() => setIsOpen(true)}>
            Read More
          </Button>
        </CardFooter>
      </Card>

      <AnnouncementModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        announcement={announcement}
        longDate={longDate}
      />
    </>
  );
}