"use client";

import type { Announcement, Event } from "@/lib/types";
import AdminAnnouncements from "@/components/announcement/AdminAnnouncements";
import AdminEvents from "@/components/event/AdminEvents";
import AdminUsers from "@/components/user/AdminUsers";
import AdminFacultyBoard from "@/components/faculty/AdminFacultyBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, GraduationCap, Megaphone, Users } from "lucide-react";

export type AdminTabValue = "announcements" | "events" | "faculty" | "users";

type AdminDashboardTabsProps = {
  /** Resolved on the server from `?tab=` so deep links work */
  defaultTab: AdminTabValue;
  announcements: Announcement[];
  events: Event[];
  isAdmin: boolean;
  currentUsername: string | null;
};

const triggerClass =
  "inline-flex shrink-0 flex-row items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium " +
  "data-[state=active]:shadow-sm " +
  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80";

export default function AdminDashboardTabs({
  defaultTab,
  announcements,
  events,
  isAdmin,
  currentUsername,
}: AdminDashboardTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="mt-4 sm:mt-6">
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
        {isAdmin ? (
          <TabsTrigger value="users" className={triggerClass}>
            <Users className="size-4 shrink-0" aria-hidden />
            Users
          </TabsTrigger>
        ) : null}
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
