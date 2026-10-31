import { useMutation } from "@tanstack/react-query";
import { saveCareerRevision } from "../../../lib/api/adminCareers.api";
import type { CareerRevisionSnapshot } from "../careerRevision.types";

/**
 * Saves the editor's whole career as the open draft revision `revisionId`. The
 * live career does not change until the revision is reviewed and published, so
 * no cached career data is refreshed here.
 */
export function useSaveCareerRevision(revisionId: string) {
  return useMutation({
    mutationFn: (snapshot: CareerRevisionSnapshot) => saveCareerRevision(revisionId, snapshot),
  });
}
