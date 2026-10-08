import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  type RegisterCredentials,
} from "../../../lib/api/auth.api";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useSignup() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      registerUser(credentials),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuth(user, accessToken);
    },
  });
}