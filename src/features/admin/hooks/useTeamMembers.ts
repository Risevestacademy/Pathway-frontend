import { useQuery } from "@tanstack/react-query";
import { fetchAllAdminInvites } from "../../../lib/api/adminInvites.api";
import { mergeTeamMembers } from "../adminInvites.types";
import { useAdminStore } from "../adminStore";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * The Members list: the local team list plus everyone who accepted an invite.
 * Accepted invites are admin-only on the server, so pass `enabled` false for
 * anyone else.
 */
export function useTeamMembers(enabled = true) {
  const local = useAdminStore((s) => s.members);
  const accepted = useQuery({
    queryKey: queryKeys.admin.invites.accepted,
    queryFn: () => fetchAllAdminInvites("ACCEPTED"),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    members: mergeTeamMembers(local, accepted.data ?? []),
    isLoadingInvites: enabled && accepted.isPending,
    invitesFailed: accepted.isError,
    refetchInvites: accepted.refetch,
  };
}
