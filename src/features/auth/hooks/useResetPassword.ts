import { passwordResetConfirm, passwordResetRequest } from "@/lib/api/auth.api";
import { useMutation } from "@tanstack/react-query";

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => passwordResetRequest(email),
  });
}

export function useConfirmResetPassword() {
  return useMutation({
    mutationFn: ({
      newPassword,
      token,
    }: {
      newPassword: string;
      token: string;
    }) => passwordResetConfirm(newPassword, token),
  });
}
