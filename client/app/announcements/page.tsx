import { getAnnouncements } from "@/lib/api";
import AnnouncementsDashboard from "@/components/announcement/AnnouncementsDashboard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements().catch(() => []);

  return (
    <div className="container-wide py-3 sm:py-4">
      <div className="page-radial-surface text-foreground dark:text-slate-100">
        <AnnouncementsDashboard announcements={announcements} />
      </div>
    </div>
  );
}
