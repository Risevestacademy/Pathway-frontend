import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminFeedback,
  updateFeedbackStatus,
} from "../../../lib/api/adminFeedback.api";
import type { FeedbackItem, FeedbackStatus } from "../adminFeedback.types";
import { queryKeys } from "../../../lib/queryKeys";

export function useAdminFeedback() {
  return useQuery({
    queryKey: queryKeys.admin.feedback,
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
      queryClient.setQueryData<FeedbackItem[]>(queryKeys.admin.feedback, (old) =>
        old?.map((f) => (f.id === updated.id ? updated : f)),
      );
    },
  });
}
