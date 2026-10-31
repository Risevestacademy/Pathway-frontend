import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setPathwayStepStatus } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import type { StepStatus } from "../progress.types";

/**
 * Marks a pathway step done, or clears it. The result carries the updated
 * progress for the whole pathway, so a screen can show the new count and
 * percentage from it. The saved-pathways list and the active pathway are
 * refreshed too, since they show the same progress and step state.
 */
export function useSetStepStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, status }: { stepId: string; status: StepStatus }) =>
      setPathwayStepStatus(stepId, status),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me.pathways }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me.activePathway }),
      ]),
  });
}
