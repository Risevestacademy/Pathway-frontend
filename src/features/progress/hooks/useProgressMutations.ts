import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  setActivePathway,
  setStepStatus,
  type ActivePathwayDto,
  type StepCompletionStatus,
} from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import { applyStepStatus } from "../progress.utils";

function useUserId(): string {
  return useAuthStore((state) => state.user?.id ?? "");
}

/**
 * Saves one step's status. The cache only changes once the server confirms,
 * so a failed save never shows the step as done.
 */
export function useSetStepStatus(stepId: string) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: StepCompletionStatus) => setStepStatus(stepId, status),
    onSuccess: (response) => {
      queryClient.setQueryData<ActivePathwayDto>(
        queryKeys.progress.active(userId),
        (active) => (active ? applyStepStatus(active, response) : active),
      );
      // Saves for other steps may land out of order, so confirm the totals.
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
    },
  });
}

/** Saves the career and makes it the user's active pathway. */
export function useStartTracking(careerId: string) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => setActivePathway(careerId),
    onSuccess: (active) => {
      queryClient.setQueryData(queryKeys.progress.active(userId), active);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.progress.saved(userId),
      });
    },
  });
}
