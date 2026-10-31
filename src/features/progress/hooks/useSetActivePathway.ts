import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setActivePathway } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * Makes a career's pathway the one the person follows. The result is the
 * pathway with its steps and their state. The saved-pathways list and the
 * active pathway are refreshed, since which one is active has changed.
 */
export function useSetActivePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (careerId: string) => setActivePathway(careerId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me.pathways }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me.activePathway }),
      ]),
  });
}
