import { getAnnouncements } from "@/lib/api";
import AnnouncementsDashboard from "@/components/announcement/AnnouncementsDashboard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements().catch(() => []);

  return <AnnouncementsDashboard announcements={announcements} />;
}
