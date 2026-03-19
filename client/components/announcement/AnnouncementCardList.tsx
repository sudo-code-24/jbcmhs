"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentListCard from "@/components/ContentListCard";
import { categoryConfig } from "./categoryConfig";
import type { AnnouncementCardListProps } from "./types";

const AnnouncementCardList = ({ announcement, shortDate, onOpen }: AnnouncementCardListProps) => {
  const config = categoryConfig[announcement.category] ?? categoryConfig.default;
  const Icon = config.Icon;

  return (
    <ContentListCard
      badge={
        <Badge className={`inline-flex items-center gap-1.5 border ${config.badge}`} variant="outline">
          <Icon className="h-3.5 w-3.5" />
          {announcement.category}
        </Badge>
      }
      meta={
        <time className="text-xs" dateTime={announcement.datePosted}>
          {shortDate}
        </time>
      }
      title={announcement.title}
      description={announcement.content}
      action={
        <Button size="sm" className={`font-bold ${config.button}`} onClick={onOpen}>
          Read More
        </Button>
      }
    />
  );
};

export default AnnouncementCardList;
