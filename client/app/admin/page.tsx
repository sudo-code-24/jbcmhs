import { getAnnouncements, getEvents } from "@/lib/api";
import AdminDashboardTabs, { type AdminTabValue } from "@/components/admin/AdminDashboardTabs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";
import { getServerBackendUrl } from "@/lib/serverBackendUrl";

const API_URL = getServerBackendUrl();

export const revalidate = 0;
export const dynamic = "force-dynamic";

function resolveAdminTab(raw: string | string[] | undefined, isAdmin: boolean): AdminTabValue {
  const t = Array.isArray(raw) ? raw[0] : raw;
  if (!t || typeof t !== "string") return "announcements";
  if (t === "users") return isAdmin ? "users" : "announcements";
  if (t === "announcements" || t === "events" || t === "faculty") return t;
  return "announcements";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string | string[] };
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  if (!isValidAdminSessionCookie(sessionCookie)) {
    redirect("/login?next=/admin");
  }

  let currentUserRole: string | null = null;
  let currentUsername: string | null = null;
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
        const me = (await meRes.json()) as {
          role?: string;
          username?: string;
          user?: { username?: string };
        };
        currentUserRole = me.role ?? null;
        currentUsername = me.username ?? me.user?.username ?? null;
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

  const defaultTab = resolveAdminTab(searchParams.tab, isAdmin);

  return (
    <div className="container-wide py-3 sm:py-4">
      <div className="page-radial-surface text-foreground dark:text-slate-100">
        <div className="mb-4 border-b border-border pb-4 dark:border-white/[0.06]">
          <h1 className="text-xl font-bold text-primary dark:text-slate-50 sm:text-2xl">Admin</h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Manage announcements, events, and the faculty board layout.
          </p>
        </div>

        <AdminDashboardTabs
          defaultTab={defaultTab}
          announcements={announcements}
          events={events}
          isAdmin={isAdmin}
          currentUsername={currentUsername}
        />
      </div>
    </div>
  );
}
