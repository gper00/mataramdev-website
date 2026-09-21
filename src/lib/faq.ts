/**
 * FAQ display ordering.
 *
 * `faq.order` is a nullable integer that multiple rows may share (or leave
 * empty), so "what the visitor sees" cannot come from a plain SQL sort alone.
 * The canonical order is computed here and reused by the admin list, the public
 * page, and the reorder action — all three must agree, otherwise the admin
 * buttons move the wrong row.
 *
 * The functions below are pure so the ordering rules can be tested without a
 * database; `src/lib/actions/faq.ts` only persists what they return.
 */

export interface FaqOrderRow {
  id: string;
  order: number | null;
}

export interface FaqOrderUpdate {
  id: string;
  order: number;
}

/**
 * Ascending by `order`, rows without one last, ties broken by id so the result
 * is stable for identical input. Never mutates the input array.
 */
export function sortFaqRows<T extends FaqOrderRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * The writes needed to make the stored numbers match the canonical sequence
 * (0, 1, 2, …). Rows already in place are left out, so a two-row swap costs two
 * updates instead of rewriting the whole table — and question/answer are never
 * touched, so a reorder cannot clobber an edit.
 */
export function faqOrderUpdates(ordered: FaqOrderRow[]): FaqOrderUpdate[] {
  const updates: FaqOrderUpdate[] = [];

  ordered.forEach((row, index) => {
    if (row.order !== index) {
      updates.push({ id: row.id, order: index });
    }
  });

  return updates;
}

/**
 * Moves one entry one step up or down in the canonical order.
 *
 * Returns `null` when `faqId` is not in the list. A move at the very top or
 * bottom is not an error: the sequence is returned unchanged apart from
 * renumbering, so stale or duplicated `order` values get repaired instead of
 * silently breaking the next move.
 */
export function moveFaqRow<T extends FaqOrderRow>(
  rows: T[],
  faqId: string,
  direction: "up" | "down"
): { ordered: T[]; updates: FaqOrderUpdate[] } | null {
  const ordered = sortFaqRows(rows);
  const index = ordered.findIndex((row) => row.id === faqId);

  if (index === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex >= 0 && targetIndex < ordered.length) {
    [ordered[index], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[index],
    ];
  }

  return { ordered, updates: faqOrderUpdates(ordered) };
}
