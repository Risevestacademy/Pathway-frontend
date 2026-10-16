import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  type SignupCredentials,
} from "../../../lib/api/auth.api";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useSignup() {
  return useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      registerUser(credentials),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setAuth(user, accessToken);
    },
  });
}