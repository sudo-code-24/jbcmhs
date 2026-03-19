/**
 * Shared date formatting utilities
 */

export const formatShortDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatLongDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateRange = (start: string | Date, end?: string | Date): string => {
  const startLabel = formatDate(start);
  if (!end) return startLabel;
  return `${startLabel} - ${formatDate(end)}`;
};
