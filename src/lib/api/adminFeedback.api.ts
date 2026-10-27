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
const MAX_PAGES = 100;

/** GET /admin/feedback answers { items, total, page, limit }. */
interface FeedbackPage {
  items: FeedbackItem[];
  total?: number;
}

function readPage(payload: unknown): FeedbackPage {
  if (Array.isArray(payload)) return { items: payload as FeedbackItem[] };
  const body = payload as { items?: unknown; total?: unknown } | null;
  return {
    items: Array.isArray(body?.items) ? (body.items as FeedbackItem[]) : [],
    total: typeof body?.total === "number" ? body.total : undefined,
  };
}

/**
 * Whether another page is worth asking for. The response's `total` says how
 * many reports exist, so this keeps going until that many are collected (the
 * server may return fewer per page than asked for). Without a total, a full
 * page means there may be more.
 */
export function hasMorePages(page: FeedbackPage, collected: number): boolean {
  if (page.items.length === 0) return false;
  if (page.total !== undefined) return collected < page.total;
  return page.items.length >= FETCH_PAGE_SIZE;
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
    const current = readPage(unwrap<unknown>(data));

    const before = all.size;
    for (const item of current.items) all.set(item.id, item);
    // A server that ignores paging repeats page 1, which adds nothing new.
    if (all.size === before) break;
    if (!hasMorePages(current, all.size)) break;
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
