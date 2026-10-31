import { useMutation } from "@tanstack/react-query";
import { deleteRevision } from "../../../lib/api/adminRevisions.api";

/**
 * Discards a draft revision. The career itself stays as it is, so no career
 * data is refreshed here; whatever shows the revision should refetch it.
 */
export function useDeleteRevision() {
  return useMutation({
    mutationFn: (revisionId: string) => deleteRevision(revisionId),
  });
}
