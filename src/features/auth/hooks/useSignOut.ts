import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { logout } from "../../../lib/api/auth.api";
import { analytics } from "../../../lib/monitoring/events";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Leave first, so protected pages unmount before their session goes.
      await navigate({ to: "/", replace: true });
      useAuthStore.getState().clearAuth();
      analytics.logout();
      queryClient.clear();
    },
  });
}
