import Link from "next/link";
import type { Announcement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ContentListCard from "@/components/ContentListCard";
import { CalendarDays, Megaphone, Bell } from "lucide-react";

type CardView = "list" | "grid";

const categoryStyles: Record<string, string> = {
  General: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-200",
  Events: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-200",
  Sports: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-200",
  Academic: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-200",
  default: "border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
};

function getCategoryStyle(category: string): string {
  return categoryStyles[category] ?? categoryStyles.default;
}

function CategoryIcon({ category }: { category: string }) {
  if (category === "Events") return <CalendarDays className="h-3.5 w-3.5" />;
  if (category === "General") return <Megaphone className="h-3.5 w-3.5" />;
  return <Bell className="h-3.5 w-3.5" />;
}

function getReadMoreButtonStyle(category: string): string {
  if (category === "Events") return "bg-violet-600 text-white hover:bg-violet-500";
  if (category === "General") return "bg-blue-600 text-white hover:bg-blue-500";
  return "bg-slate-700 text-white hover:bg-slate-600";
}

export default function AnnouncementCard({
  announcement,
  view = "list",
}: {
  announcement: Announcement;
  view?: CardView;
}) {
  const date = new Date(announcement.datePosted).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const href = `/announcements/${announcement.id}`;
  const badgeClass = getCategoryStyle(announcement.category);
  const readMoreStyle = getReadMoreButtonStyle(announcement.category);
  const isGrid = view === "grid";

  if (!isGrid) {
    return (
      <ContentListCard
        badge={
          <Badge className={`inline-flex items-center gap-1.5 border ${badgeClass}`} variant="outline">
            <CategoryIcon category={announcement.category} />
            {announcement.category}
          </Badge>
        }
        meta={
          <time className="text-xs text-muted-foreground dark:text-slate-300" dateTime={announcement.datePosted}>
            {date}
          </time>
        }
        title={announcement.title}
        description={announcement.content}
        action={
          <Button asChild size="sm" className={`font-bold ${readMoreStyle}`}>
            <Link href={href}>Read More</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Card className="flex h-full flex-col border border-border/70 bg-card text-card-foreground shadow-md dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-100 dark:shadow-lg">
      <CardHeader className="space-y-2 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`inline-flex items-center gap-1.5 border ${badgeClass}`} variant="outline">
            <CategoryIcon category={announcement.category} />
            {announcement.category}
          </Badge>
          <time className="text-sm text-muted-foreground dark:text-slate-300" dateTime={announcement.datePosted}>
            {date}
          </time>
        </div>
        <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight text-foreground dark:text-white md:text-2xl">
          {announcement.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <p className="line-clamp-3 text-sm text-muted-foreground dark:text-slate-200">{announcement.content}</p>
      </CardContent>
      <CardFooter className="mt-auto justify-end pt-0">
        <Button asChild size="sm" className={`w-full font-bold ${readMoreStyle}`}>
          <Link href={href}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
