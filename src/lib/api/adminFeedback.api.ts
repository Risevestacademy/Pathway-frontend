import { api } from "./axios";
import type {
  FeedbackItem,
  FeedbackStatus,
} from "../../features/admin/adminFeedback.types";

export async function fetchAdminFeedback(): Promise<FeedbackItem[]> {
  const { data } = await api.get<FeedbackItem[]>("/admin/feedback");
  return data;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<FeedbackItem> {
  const { data } = await api.patch<FeedbackItem>(
    `/admin/feedback/${id}/status`,
    { status },
  );
  return data;
}
