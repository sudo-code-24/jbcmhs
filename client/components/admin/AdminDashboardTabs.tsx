"use client";

import { useCallback, useState } from "react";
import type { Announcement, Event, SchoolInfo } from "@/lib/types";
import AdminAnnouncements from "@/components/announcement/AdminAnnouncements";
import AdminEvents from "@/components/event/AdminEvents";
import AdminUsers from "@/components/user/AdminUsers";
import AdminFacultyBoard from "@/components/faculty/AdminFacultyBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSchoolProfile from "@/components/admin/AdminSchoolProfile";
import { Building2, Calendar, GraduationCap, Megaphone, Users } from "lucide-react";

export type AdminTabValue = "announcements" | "events" | "faculty" | "school" | "users";

type AdminDashboardTabsProps = {
  /** Resolved on the server from `?tab=` so deep links work */
  defaultTab: AdminTabValue;
  announcements: Announcement[];
  events: Event[];
  schoolProfile: SchoolInfo;
  isAdmin: boolean;
  currentUsername: string | null;
};

const triggerClass =
  "inline-flex shrink-0 flex-row items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium " +
  "data-[state=active]:shadow-sm " +
  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80";

const DISCARD_SCHOOL_CHANGES_MSG =
  "You have unsaved changes on School profile. Leave this tab and discard them?";

export default function AdminDashboardTabs({
  defaultTab,
  announcements,
  events,
  schoolProfile,
  isAdmin,
  currentUsername,
}: AdminDashboardTabsProps) {
  const [tab, setTab] = useState<AdminTabValue>(defaultTab);
  const [schoolDirty, setSchoolDirty] = useState(false);

  const onTabChange = useCallback(
    (next: string) => {
      const v = next as AdminTabValue;
      if (schoolDirty && tab === "school" && v !== "school") {
        if (!window.confirm(DISCARD_SCHOOL_CHANGES_MSG)) return;
      }
      setTab(v);
    },
    [schoolDirty, tab],
  );

  return (
    <Tabs
      value={tab}
      onValueChange={onTabChange}
      activationMode="manual"
      className="mt-4 sm:mt-6"
    >
      <TabsList className="inline-flex h-auto w-full min-w-0 flex-nowrap items-stretch justify-start divide-x divide-border/60 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 text-muted-foreground">
        <TabsTrigger value="announcements" className={triggerClass}>
          <Megaphone className="size-4 shrink-0" aria-hidden />
          Announcements
        </TabsTrigger>
        <TabsTrigger value="events" className={triggerClass}>
          <Calendar className="size-4 shrink-0" aria-hidden />
          Events
        </TabsTrigger>
        <TabsTrigger value="faculty" className={triggerClass}>
          <GraduationCap className="size-4 shrink-0" aria-hidden />
          Faculty board
        </TabsTrigger>
        <TabsTrigger value="school" className={triggerClass}>
          <Building2 className="size-4 shrink-0" aria-hidden />
          School profile
        </TabsTrigger>
        <TabsTrigger value="users" className={triggerClass}>
          <Users className="size-4 shrink-0" aria-hidden />
          User management
        </TabsTrigger>
      </TabsList>
      <TabsContent value="announcements">
        <AdminAnnouncements initial={announcements} />
      </TabsContent>
      <TabsContent value="events">
        <AdminEvents initial={events} />
      </TabsContent>
      <TabsContent value="faculty">
        <AdminFacultyBoard />
      </TabsContent>
      <TabsContent value="school">
        <AdminSchoolProfile initial={schoolProfile} onDirtyChange={setSchoolDirty} />
      </TabsContent>
      <TabsContent value="users">
        <AdminUsers
          currentUsername={currentUsername}
          canManageUsers={isAdmin}
        />
      </TabsContent>
    </Tabs>
  );
}
