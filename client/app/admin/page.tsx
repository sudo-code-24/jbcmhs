import { getAnnouncements, getEvents } from "@/lib/api";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminEvents from "./AdminEvents";
import AdminUsers from "./AdminUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE, isValidAdminSessionCookie } from "@/lib/adminAuth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!isValidAdminSessionCookie(sessionCookie)) {
    redirect("/login?next=/admin");
  }

  const [announcements, events] = await Promise.all([
    getAnnouncements().catch(() => []),
    getEvents().catch(() => []),
  ]);

  return (
    <div className="container-wide py-8 sm:py-10 md:py-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage announcements and events.</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            Logout
          </button>
        </form>
      </div>

      <Tabs defaultValue="announcements" className="mt-8">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements">
          <AdminAnnouncements initial={announcements} />
        </TabsContent>
        <TabsContent value="events">
          <AdminEvents initial={events} />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
