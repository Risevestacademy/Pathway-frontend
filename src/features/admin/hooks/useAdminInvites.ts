import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminInvite,
  fetchAdminInvites,
  revokeAdminInvite,
  type FetchInvitesParams,
} from "../../../lib/api/adminInvites.api";
import type { CreateInviteInput } from "../adminInvites.types";

export const ADMIN_INVITES_KEY = ["admin", "invites"] as const;

export function useAdminInvites(params: FetchInvitesParams, enabled = true) {
  return useQuery({
    queryKey: [...ADMIN_INVITES_KEY, params],
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADMIN_INVITES_KEY }),
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInviteInput) => createAdminInvite(input),
    // The new invite shows up under Invites; re-inviting replaces a pending one.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_INVITES_KEY }),
  });
}
