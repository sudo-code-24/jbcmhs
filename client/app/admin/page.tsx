import { getAnnouncements, getEvents } from "@/lib/api";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminEvents from "./AdminEvents";
import AdminUsers from "./AdminUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  if (!isValidAdminSessionCookie(sessionCookie)) {
    redirect("/login?next=/admin");
  }

  let currentUserRole: string | null = null;
  if (token && sessionId) {
    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as { role?: string };
        currentUserRole = me.role ?? null;
      }
    } catch {
      // Ignore - user may still access announcements/events
    }
  }

  const isAdmin = currentUserRole === "admin";

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
          {isAdmin ? <TabsTrigger value="users">Users</TabsTrigger> : null}
        </TabsList>
        <TabsContent value="announcements">
          <AdminAnnouncements initial={announcements} />
        </TabsContent>
        <TabsContent value="events">
          <AdminEvents initial={events} />
        </TabsContent>
        {isAdmin ? (
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
