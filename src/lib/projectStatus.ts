/**
 * Shared project moderation status vocabulary.
 *
 * The admin moderation queue and the public showcase render the same labels
 * and colours, so they live here instead of being copied per page.
 */

export const PROJECT_STATUSES = ["pending", "approved", "rejected"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const PROJECT_STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function isProjectStatus(value: string | undefined): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

/** Falls back to the raw value for statuses this build does not know about. */
export function projectStatusLabel(status: string): string {
  return isProjectStatus(status) ? PROJECT_STATUS_LABELS[status] : status;
}

export function projectStatusBadgeClasses(status: string): string {
  return isProjectStatus(status) ? PROJECT_STATUS_BADGE_CLASSES[status] : "";
}
