"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type ContentListCardProps = {
  badge: ReactNode;
  meta?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

const ContentListCard = ({ badge, meta, title, description, action }: ContentListCardProps) => (
  <Card className="border border-border/70 bg-card text-card-foreground shadow-md dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-100 dark:shadow-lg">
    <CardContent className="p-3.5">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {badge}
            {meta}
          </div>
          <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight text-foreground dark:text-white">
            {title}
          </CardTitle>
          {description ? (
            <p className="line-clamp-1 text-sm text-muted-foreground dark:text-slate-200">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </CardContent>
  </Card>
);

export default ContentListCard;
