/**
 * Shared resource vocabulary.
 *
 * The admin list and the public download center render the same labels,
 * colours and fallback icons, so they live here instead of being copied per
 * page. Mirrors `eventStatus.ts` / `projectStatus.ts` / `postStatus.ts`.
 */

export const RESOURCE_CATEGORIES = ["code", "doc", "design", "video"] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  code: "Kode",
  doc: "Dokumen",
  design: "Desain",
  video: "Video",
};

export const RESOURCE_CATEGORY_BADGE_CLASSES: Record<ResourceCategory, string> =
  {
    code: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    doc: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    design:
      "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    video:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };

/** Used when an admin uploads a resource without picking a custom icon. */
export const RESOURCE_CATEGORY_ICONS: Record<ResourceCategory, string> = {
  code: "💻",
  doc: "📄",
  design: "🎨",
  video: "🎬",
};

export function isResourceCategory(
  value: string | undefined
): value is ResourceCategory {
  return RESOURCE_CATEGORIES.includes(value as ResourceCategory);
}

/** Falls back to the raw value for categories this build does not know about. */
export function resourceCategoryLabel(category: string): string {
  return isResourceCategory(category)
    ? RESOURCE_CATEGORY_LABELS[category]
    : category;
}

export function resourceCategoryBadgeClasses(category: string): string {
  return isResourceCategory(category)
    ? RESOURCE_CATEGORY_BADGE_CLASSES[category]
    : "";
}

/** The uploaded `icon` wins; otherwise fall back to the category's icon. */
export function resourceIcon(category: string, icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return isResourceCategory(category) ? RESOURCE_CATEGORY_ICONS[category] : "📦";
}
