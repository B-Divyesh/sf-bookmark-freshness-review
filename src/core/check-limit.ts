import type { BookmarkRecord } from './types';

export const FREE_CHECK_LIMIT = 50;

/** Counts requests, including retries, rather than merely bookmarks with a result. */
export function usedCheckAttempts(records: BookmarkRecord[]): number {
  return records.reduce((total, record) => total + (record.checkAttempts ?? (record.checkedAt ? 1 : 0)), 0);
}

export function checkAllowance(records: BookmarkRecord[], licensed: boolean): number {
  return licensed ? Number.POSITIVE_INFINITY : Math.max(0, FREE_CHECK_LIMIT - usedCheckAttempts(records));
}
