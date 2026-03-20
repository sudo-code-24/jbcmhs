"use client";

import type { Announcement, Event } from "@/lib/types";
import AdminAnnouncements from "@/components/announcement/AdminAnnouncements";
import AdminEvents from "@/components/event/AdminEvents";
import AdminUsers from "@/components/user/AdminUsers";
import AdminFacultyBoard from "@/components/faculty/AdminFacultyBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AdminTabValue = "announcements" | "events" | "faculty" | "users";

type AdminDashboardTabsProps = {
  /** Resolved on the server from `?tab=` so deep links work */
  defaultTab: AdminTabValue;
  announcements: Announcement[];
  events: Event[];
  isAdmin: boolean;
  currentUsername: string | null;
};

export default function AdminDashboardTabs({
  defaultTab,
  announcements,
  events,
  isAdmin,
  currentUsername,
}: AdminDashboardTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="mt-4 sm:mt-6">
      <TabsList className="flex flex-wrap gap-1">
        <TabsTrigger value="announcements">Announcements</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="faculty">Faculty board</TabsTrigger>
        {isAdmin ? <TabsTrigger value="users">Users</TabsTrigger> : null}
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
      {isAdmin ? (
        <TabsContent value="users">
          <AdminUsers currentUsername={currentUsername} />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
