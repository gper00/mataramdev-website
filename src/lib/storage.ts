/**
 * Shared Supabase Storage helpers.
 *
 * Upload targets and the cleanup helper live here so the admin action and the
 * public download center agree on the same bucket and path shape.
 */

/** Free resources (cheatsheets, templates, files) — see docs/ARCHITECTURE.md §7. */
export const RESOURCE_BUCKET = "resources";

/**
 * Cap for a single resource upload. The matching Server Action body limit is
 * configured in `next.config.ts` (`serverActions.bodySizeLimit`) — raising one
 * without the other leaves uploads failing before the action ever runs.
 */
export const RESOURCE_MAX_FILE_MB = 10;

/**
 * Extracts the object path from a public Supabase Storage URL.
 *
 * Public URLs look like `<project>/storage/v1/object/public/<bucket>/<path>`.
 * Returns `null` when the URL does not point into that bucket (for example a
 * manually pasted external link) so callers skip the cleanup instead of
 * deleting an unrelated object.
 */
export function storagePathFromPublicUrl(
  url: string,
  bucket: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);

  if (index === -1) return null;

  const path = url.slice(index + marker.length).split("?")[0];
  if (path.length === 0) return null;

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
