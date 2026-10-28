import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import VerifyEmailForm from "../../features/auth/components/VerifyEmailForm";
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
} from "../../features/auth/pendingVerification";
import {
  ensureAuthHydrated,
  resendVerification,
  verifyEmail,
} from "../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../lib/stores/authStore";

export const Route = createFileRoute("/(auth)/verify-email")({
  staticData: { shellVariant: "wide" },
  beforeLoad: async () => {
    await ensureAuthHydrated();
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers" });
    }
    if (!getPendingVerificationEmail()) {
      throw redirect({ to: "/signup" });
    }
  },
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const navigate = useNavigate();
  const email = getPendingVerificationEmail();

  const handleVerify = async (otp: string) => {
    const { user, accessToken } = await verifyEmail(email, otp);
    clearPendingVerificationEmail();
    useAuthStore.getState().setAuth(user, accessToken);
    await navigate({ to: "/careers", replace: true });
  };

  return (
    <VerifyEmailForm
      email={email}
      onSubmit={handleVerify}
      onResend={() => resendVerification(email)}
    />
  );
}
