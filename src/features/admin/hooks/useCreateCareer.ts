import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminCareer } from "../../../lib/api/adminCareers.api";
import { queryKeys } from "../../../lib/queryKeys";
import type { CreateCareerInput } from "../adminCareers.types";

/** Creates a draft career on the server and refreshes the admin list so it shows up. */
export function useCreateCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCareerInput) => createAdminCareer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.careers.all }),
  });
}
