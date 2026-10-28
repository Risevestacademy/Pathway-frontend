import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCompletedSteps, setStepComplete } from "../../../lib/api/roadmapPreview.api";
import { useSkillCheckUserId } from "./useSkillCheck";
import { queryKeys } from "../../../lib/queryKeys";

export function useCompletedSteps(careerId: string) {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.roadmapPreview(userId, careerId),
    queryFn: () => fetchCompletedSteps(userId, careerId),
  });
}

export function useSetStepComplete(careerId: string) {
  const userId = useSkillCheckUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { stepOrder: number; complete: boolean }) =>
      setStepComplete(userId, careerId, input.stepOrder, input.complete),
    onSuccess: (steps) => {
      queryClient.setQueryData(queryKeys.roadmapPreview(userId, careerId), steps);
    },
  });
}
