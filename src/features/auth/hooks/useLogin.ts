import { useMutation } from "@tanstack/react-query";
import { loginUser, type RegisterCredentials } from "../../../lib/api/auth.api";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => loginUser(credentials),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuth(user, accessToken);
    },
  });
}