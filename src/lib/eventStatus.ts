/**
 * Shared event status vocabulary.
 *
 * The admin management list and the public discovery pages render the same
 * labels and colours, so they live here instead of being copied per page.
 */

export const EVENT_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const EVENT_STATUS_BADGE_CLASSES: Record<EventStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  ongoing:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  completed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function isEventStatus(value: string | undefined): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}

/** Falls back to the raw value for statuses this build does not know about. */
export function eventStatusLabel(status: string): string {
  return isEventStatus(status) ? EVENT_STATUS_LABELS[status] : status;
}

export function eventStatusBadgeClasses(status: string): string {
  return isEventStatus(status) ? EVENT_STATUS_BADGE_CLASSES[status] : "";
}
