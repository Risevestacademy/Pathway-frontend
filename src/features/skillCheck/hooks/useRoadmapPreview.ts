import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setPathwayStepStatus, StepStatusError } from "../../../lib/api/progress.api";
import { fetchCompletedSteps, setStepComplete } from "../../../lib/api/roadmapPreview.api";
import { queryKeys } from "../../../lib/queryKeys";
import { activateOnServer } from "./activePathwaySync";
import { useSkillCheckUserId } from "./useSkillCheck";

export function useCompletedSteps(careerId: string) {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.roadmapPreview(userId, careerId),
    queryFn: () => fetchCompletedSteps(userId, careerId),
  });
}

/**
 * Marks a step of a My Pathway roadmap done (or not). When the step is one of a
 * real pathway (`realStepId`), the server is told first so the dashboard counts
 * it too, and if the server refuses nothing changes here either. If the server
 * says the career isn't saved yet (409), it is saved now, which also makes it
 * the active pathway, and the step is marked again once.
 */
export function useSetStepComplete(careerId: string) {
  const userId = useSkillCheckUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { stepOrder: number; complete: boolean; realStepId?: string }) => {
      if (input.realStepId) {
        const status = input.complete ? "COMPLETED" : "NOT_STARTED";
        try {
          await setPathwayStepStatus(input.realStepId, status);
        } catch (error) {
          if (!(error instanceof StepStatusError) || error.status !== 409) throw error;
          await activateOnServer(queryClient, careerId);
          await setPathwayStepStatus(input.realStepId, status);
        }
      }
      return setStepComplete(userId, careerId, input.stepOrder, input.complete);
    },
    onSuccess: (steps, input) => {
      queryClient.setQueryData(queryKeys.roadmapPreview(userId, careerId), steps);
      if (input.realStepId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.me.pathways });
        void queryClient.invalidateQueries({ queryKey: queryKeys.me.activePathway });
      }
    },
  });
}
