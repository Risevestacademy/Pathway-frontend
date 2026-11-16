import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../../../lib/api/users.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? "");

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile(userId), profile);
      useAuthStore.setState((state) =>
        state.user
          ? { user: { ...state.user, fullName: profile.fullName ?? state.user.fullName } }
          : state,
      );
    },
  });
}