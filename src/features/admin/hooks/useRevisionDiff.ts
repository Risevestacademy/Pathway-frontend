import { useQuery } from "@tanstack/react-query";
import { fetchRevisionDiff } from "../../../lib/api/adminRevisions.api";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * What a revision would change, for a reviewer to look at. A missing or
 * off-limits revision won't appear on a retry, so a failure is shown straight
 * away, and the diff is not refetched on focus because it is only a preview.
 */
export function useRevisionDiff(revisionId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.revisionDiff(revisionId),
    queryFn: () => fetchRevisionDiff(revisionId),
    enabled,
    retry: false,
    staleTime: 30 * 1000,
  });
}
