export const ANNOUNCEMENT_CATEGORIES = ["General", "Academic", "Events", "Sports"] as const;
export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];
export const EVENT_TYPES = ["academic", "event", "sports"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  datePosted: string;
  imageUrl?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: EventType;
  imageUrl?: string;
}

/** Public faculty board card (persisted to Google Sheet via API). */
export type FacultyCardItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  boardSection: string;
  positionIndex: number;
};

export interface SchoolInfo {
  id: number;
  name: string;
  tagline: string;
  history: string;
  mission: string;
  vision: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  heroImageUrl?: string;
  schoolImageUrl?: string;
}
