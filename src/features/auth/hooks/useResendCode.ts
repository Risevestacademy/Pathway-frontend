import { useNavigate } from "@tanstack/react-router";
import { resendVerification } from "../../../lib/api/auth.api";
import { setPendingVerificationEmail } from "../pendingVerification";

/** Sends a fresh verification code, remembers the email and opens the code page. */
export function useResendCode() {
  const navigate = useNavigate();

  return async (email: string) => {
    await resendVerification(email);
    setPendingVerificationEmail(email);
    await navigate({ to: "/verify-email", replace: true });
  };
}
