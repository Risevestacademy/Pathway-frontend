import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllAdminInvites } from "../../../lib/api/adminInvites.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { mergeTeamMembers, sessionToMember } from "../adminInvites.types";
import { useAdminStore } from "../adminStore";
import { queryKeys } from "../../../lib/queryKeys";
import { ADMIN_INVITES_KEY } from "./useAdminInvites";
import { useCurrentMember } from "./useCurrentMember";

/**
 * The Members list: the local team list, the signed-in person (so it is never
 * empty) and everyone who accepted an invite.
 * Accepted invites are admin-only on the server, so pass `enabled` false for
 * anyone else.
 */
export function useTeamMembers(enabled = true) {
  const local = useAdminStore((s) => s.members);
  const user = useAuthStore((s) => s.user);
  const { fullName } = useCurrentMember();
  const current = useMemo(
    () => (user ? sessionToMember(user, fullName) : null),
    [user, fullName],
  );
  const accepted = useQuery({
    queryKey: queryKeys.admin.invites.accepted,
    queryFn: () => fetchAllAdminInvites("ACCEPTED"),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    members: mergeTeamMembers(local, accepted.data ?? [], current),
    isLoadingInvites: enabled && accepted.isPending,
    invitesFailed: accepted.isError,
    refetchInvites: accepted.refetch,
  };
}
