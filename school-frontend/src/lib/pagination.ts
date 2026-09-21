// Shared pagination helpers. Safe to import from server AND client files.
//
// How paging works: to know whether a "Next" page exists we ask the backend
// for ONE EXTRA row (take = pageSize + 1). If that extra row comes back there
// is a next page; we then drop it before showing the rows. This is the same
// trick the Students and Teachers lists already use.

export const DEFAULT_PAGE_SIZE = 10; // matches the backend's own default
export const LARGE_PAGE_SIZE = 20; // for long lists: invoices, books, loans, audit logs

export type Paged<T> = { rows: T[]; page: number; hasNextPage: boolean };

/** The query-string shape every list page receives. */
export type ListSearchParams = { search?: string; page?: string };

/** "?page=abc", "0", "-3", "2.7" -> always a whole number >= 1 */
export function parsePage(value?: string | string[] | number | null): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** skip/take to send to the backend for a given page. */
export function pageArgs(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = parsePage(page);
  return { page: safePage, skip: (safePage - 1) * pageSize, take: pageSize + 1 };
}

/** Turn the (pageSize + 1) rows we fetched into one page + a hasNextPage flag. */
export function toPaged<T>(rows: T[], page: number, pageSize = DEFAULT_PAGE_SIZE): Paged<T> {
  return { rows: rows.slice(0, pageSize), page, hasNextPage: rows.length > pageSize };
}

/** What a fetcher returns when the backend call fails. */
export function emptyPage(): Paged<never> {
  return { rows: [], page: 1, hasNextPage: false };
}