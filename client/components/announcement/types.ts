import type { Announcement } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

export type CardView = "list" | "grid";

export interface AnnouncementCardListProps {
  announcement: Announcement;
  shortDate: string;
  onOpen: () => void;
}

export interface AnnouncementCardGridProps {
  announcement: Announcement;
  shortDate: string;
  onOpen: () => void;
}

export interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  announcement: Announcement;
  longDate: string;
}

export interface AnnouncementCardProps {
  announcement: Announcement;
  view?: CardView;
}

export interface CategoryConfigItem {
  badge: string;
  button: string;
  Icon: LucideIcon;
}
