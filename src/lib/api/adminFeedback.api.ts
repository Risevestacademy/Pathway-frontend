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

export async function fetchAdminFeedback(): Promise<FeedbackItem[]> {
  const { data } = await api.get<unknown>("/admin/feedback");
  const payload = unwrap<unknown>(data);
  if (Array.isArray(payload)) return payload as FeedbackItem[];
  const items = (payload as { items?: unknown } | null)?.items;
  return Array.isArray(items) ? (items as FeedbackItem[]) : [];
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
