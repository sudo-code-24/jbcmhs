import { DEFAULT_SCHOOL_INFO } from "@/config/schoolInfo";
import { getAnnouncements, getEvents, getSchoolInfo } from "@/lib/api";
import AdminDashboardTabs, {
  type AdminTabValue,
} from "@/components/admin/AdminDashboardTabs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STRAPI_JWT_COOKIE,
  fetchStrapiMe,
  resolveAppRole,
  verifyStrapiJwt,
} from "@/lib/auth/strapiSession";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function resolveAdminTab(raw: string | string[] | undefined): AdminTabValue {
  const t = Array.isArray(raw) ? raw[0] : raw;
  if (!t || typeof t !== "string") return "announcements";
  if (t === "users") return "users";
  if (
    t === "announcements" ||
    t === "events" ||
    t === "faculty" ||
    t === "school"
  )
    return t;
  return "announcements";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string | string[] };
}) {
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value || "";
  if (!jwt || !(await verifyStrapiJwt(jwt))) {
    redirect("/login?next=/admin");
  }

  let currentUserRole: string | null = null;
  let currentUsername: string | null = null;
  try {
    const me = await fetchStrapiMe(jwt);
    if (me) {
      currentUserRole = resolveAppRole(me);
      currentUsername = me.username ?? null;
    }
  } catch {
    // fall through — tabs still usable for content
  }

  const isAdmin = currentUserRole === "admin";

  const [announcements, events, schoolProfile] = await Promise.all([
    getAnnouncements().catch(() => []),
    getEvents().catch(() => []),
    getSchoolInfo().catch(() => null),
  ]);

  const defaultTab = resolveAdminTab(searchParams.tab);

  return (
    <div className="container-wide py-3 sm:py-4">
      <div className="page-radial-surface text-foreground dark:text-slate-100">
        <div className="mb-4 border-b border-border pb-4 dark:border-white/[0.06]">
          <h1 className="text-xl font-bold text-primary dark:text-slate-50 sm:text-2xl">
            Admin
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Manage announcements, events, faculty board, school profile, and
            user accounts.
          </p>
        </div>

        <AdminDashboardTabs
          defaultTab={defaultTab}
          announcements={announcements}
          events={events}
          schoolProfile={schoolProfile ?? DEFAULT_SCHOOL_INFO}
          isAdmin={isAdmin}
          currentUsername={currentUsername}
        />
      </div>
    </div>
  );
}
