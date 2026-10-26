import { api } from "./axios";
import type {
  FeedbackItem,
  FeedbackStatus,
} from "../../features/admin/adminFeedback.types";

/** Some endpoints wrap their payload ({ data }, or { data: { items } } when paginated). */
function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

const FETCH_PAGE_SIZE = 100;
/** Safety stop in case the server keeps answering with pages. */
const MAX_PAGES = 50;

function itemsOf(payload: unknown): FeedbackItem[] {
  if (Array.isArray(payload)) return payload as FeedbackItem[];
  const items = (payload as { items?: unknown } | null)?.items;
  return Array.isArray(items) ? (items as FeedbackItem[]) : [];
}

/**
 * Whether another page is worth asking for. Reads whichever paging info the
 * response carries (totalPages, hasNext or total, at the top or under
 * meta/pagination); without any, a full page means there may be more.
 */
export function hasMorePages(
  payload: unknown,
  page: number,
  collected: number,
  received: number,
): boolean {
  if (received === 0) return false;
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  for (const source of [root, root.meta, root.pagination]) {
    if (!source || typeof source !== "object") continue;
    const info = source as Record<string, unknown>;
    if (typeof info.totalPages === "number") return page < info.totalPages;
    if (typeof info.hasNext === "boolean") return info.hasNext;
    if (typeof info.hasNextPage === "boolean") return info.hasNextPage;
    if (typeof info.total === "number") return collected < info.total;
  }
  return received >= FETCH_PAGE_SIZE;
}

/**
 * Every report, following the API's pages so counts and the sidebar badge cover
 * all of them. (The reports page then shows them a few at a time.)
 */
export async function fetchAdminFeedback(): Promise<FeedbackItem[]> {
  const all = new Map<string, FeedbackItem>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data } = await api.get<unknown>("/admin/feedback", {
      params: { page, limit: FETCH_PAGE_SIZE },
    });
    const payload = unwrap<unknown>(data);
    const items = itemsOf(payload);

    const before = all.size;
    for (const item of items) all.set(item.id, item);
    // A server that ignores paging repeats page 1, which adds nothing new.
    if (all.size === before) break;
    if (!hasMorePages(payload, page, all.size, items.length)) break;
  }

  return [...all.values()];
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<FeedbackItem> {
  const { data } = await api.patch<unknown>(`/admin/feedback/${id}/status`, {
    status,
  });
  return unwrap<FeedbackItem>(data);
}
