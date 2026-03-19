import type { Event } from "@/lib/types";

export type CardView = "list" | "grid";

export interface EventCardListProps {
  event: Event;
  dateLabel: string;
  onOpen: () => void;
}

export interface EventCardGridProps {
  event: Event;
  dateLabel: string;
  onOpen: () => void;
}

export interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  dateLabel: string;
  calendarEmbedUrl?: string;
}

export interface EventCardProps {
  event: Event;
  view?: CardView;
  calendarEmbedUrl?: string;
}
