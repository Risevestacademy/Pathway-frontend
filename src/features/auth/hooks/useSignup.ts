import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  type SignupCredentials,
} from "../../../lib/api/auth.api";

export function useSignup() {
  return useMutation({
    mutationFn: (credentials: SignupCredentials) => registerUser(credentials),
  });
}
