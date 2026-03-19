"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryConfig } from "./categoryConfig";
import type { AnnouncementCardGridProps } from "./types";

const AnnouncementCardGrid = ({ announcement, shortDate, onOpen }: AnnouncementCardGridProps) => {
  const config = categoryConfig[announcement.category] ?? categoryConfig.default;
  const Icon = config.Icon;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex justify-between">
          <Badge className={`inline-flex items-center gap-1.5 border ${config.badge}`} variant="outline">
            <Icon className="h-3.5 w-3.5" />
            {announcement.category}
          </Badge>
          <time>{shortDate}</time>
        </div>
        <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-3">{announcement.content}</p>
      </CardContent>

      <CardFooter>
        <Button className={`w-full font-bold ${config.button}`} onClick={onOpen}>
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCardGrid;
