import { useQuery } from "@tanstack/react-query";
import { ActivePathwayError, fetchActivePathway } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * The pathway the signed-in person follows, with its steps and where they are
 * in it. It is refreshed when a step is marked, a pathway is chosen or a
 * starting point changes. Only failures with no response (a dropped
 * connection) are tried again, twice: an expired session won't clear on a retry.
 */
export function useActivePathway(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me.activePathway,
    queryFn: fetchActivePathway,
    enabled,
    staleTime: 30 * 1000,
    retry: (failureCount, error) =>
      failureCount < 2 && error instanceof ActivePathwayError && error.status === undefined,
  });
}
