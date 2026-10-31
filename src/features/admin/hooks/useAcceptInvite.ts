import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptInvite } from "../../../lib/api/auth.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { queryKeys } from "../../../lib/queryKeys";

/**
 * Accepts the invite and swaps in the fresh session the server returns, so the
 * new role applies without signing in again.
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvite(token),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuth(user, accessToken);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.invites.all });
    },
  });
}
