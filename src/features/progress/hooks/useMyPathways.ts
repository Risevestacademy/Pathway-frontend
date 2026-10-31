import { useQuery } from "@tanstack/react-query";
import { MyPathwaysError, fetchMyPathways } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * The signed-in person's saved pathways with their progress. It is refreshed
 * when a step is marked done, so the numbers stay in step with the roadmap.
 * An expired session or a server error won't clear on a retry, so only
 * failures with no response (a dropped connection) are tried again, twice.
 */
export function useMyPathways(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me.pathways,
    queryFn: fetchMyPathways,
    enabled,
    staleTime: 30 * 1000,
    retry: (failureCount, error) =>
      failureCount < 2 && error instanceof MyPathwaysError && error.status === undefined,
  });
}
