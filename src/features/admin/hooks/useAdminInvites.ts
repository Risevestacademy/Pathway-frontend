import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminInvites,
  revokeAdminInvite,
  type FetchInvitesParams,
} from "../../../lib/api/adminInvites.api";
import { queryKeys } from "../../../lib/queryKeys";

export function useAdminInvites(params: FetchInvitesParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.invites.list(params),
    queryFn: () => fetchAdminInvites(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeAdminInvite(id),
    // Also after a failure: a 409 or 404 means the list on screen is out of date.
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.invites.all }),
  });
}
