import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminCareer } from "../../../lib/api/adminCareers.api";
import type { AdminCareerRow } from "../admin.utils";
import { useAdminStore } from "../adminStore";

/**
 * Deletes a draft career. One created in the browser was never on the server,
 * so it is only removed locally; any other goes through the API first.
 */
export function useDeleteCareer() {
  const queryClient = useQueryClient();
  const removeCareer = useAdminStore((s) => s.removeCareer);

  return useMutation({
    mutationFn: async (row: AdminCareerRow) => {
      if (!row.isLocal) await deleteAdminCareer(row.id);
    },
    onSuccess: (_data, row) => {
      removeCareer(row.id);
      queryClient.removeQueries({ queryKey: ["career", row.id] });
      void queryClient.invalidateQueries({ queryKey: ["careers"] });
    },
  });
}
