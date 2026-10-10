import { passwordResetRequest } from "@/lib/api/auth.api";
import { useMutation } from "@tanstack/react-query";

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => passwordResetRequest(email),
  });
}
