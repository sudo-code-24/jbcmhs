import { notFound } from "next/navigation";
import { getAnnouncement } from "@/lib/api";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getAnnouncement(id).catch(() => null);
  return a ? { title: `${a.title} | Announcements` } : {};
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  const announcement = await getAnnouncement(id).catch(() => null);
  if (!announcement) notFound();

  const date = new Date(announcement.datePosted).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-wide py-8 sm:py-10 md:py-12">
      <Card>
        <CardHeader className="space-y-3">
          <BackButton />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{announcement.category}</Badge>
            <time className="text-sm text-muted-foreground" dateTime={announcement.datePosted}>
              {date}
            </time>
          </div>
          <CardTitle className="text-2xl">{announcement.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-muted-foreground">{announcement.content}</div>
        </CardContent>
      </Card>
    </div>
  );
}
