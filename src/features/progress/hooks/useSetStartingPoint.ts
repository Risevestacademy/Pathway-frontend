import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStartingPoint } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * Chooses the step a person starts from in a saved pathway, or clears it with
 * a null `stepId`. Everything about progress is refreshed, since the saved
 * pathways and the active pathway both carry the starting step.
 */
export function useSetStartingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ careerId, stepId }: { careerId: string; stepId: string | null }) =>
      setStartingPoint(careerId, stepId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.progress.all }),
  });
}
