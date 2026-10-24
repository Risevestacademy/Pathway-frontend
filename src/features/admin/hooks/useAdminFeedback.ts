import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminFeedback,
  updateFeedbackStatus,
} from "../../../lib/api/adminFeedback.api";
import type { FeedbackItem, FeedbackStatus } from "../adminFeedback.types";

export const ADMIN_FEEDBACK_KEY = ["admin", "feedback"] as const;

export function useAdminFeedback() {
  return useQuery({
    queryKey: ADMIN_FEEDBACK_KEY,
    queryFn: fetchAdminFeedback,
    staleTime: 60 * 1000,
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      updateFeedbackStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<FeedbackItem[]>(ADMIN_FEEDBACK_KEY, (old) =>
        old?.map((f) => (f.id === updated.id ? updated : f)),
      );
    },
  });
}
