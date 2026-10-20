import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import VerifyEmailForm from "../../features/auth/components/VerifyEmailForm";
import {
  ensureAuthHydrated,
  resendVerification,
  verifyEmail,
} from "../../lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "../../lib/stores/authStore";

export const Route = createFileRoute("/(auth)/verify-email")({
  staticData: { shellVariant: "wide" },
  validateSearch: z.object({ email: z.string().email().catch("") }),
  beforeLoad: async ({ search }) => {
    await ensureAuthHydrated();
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers" });
    }
    if (!search.email) {
      throw redirect({ to: "/signup" });
    }
  },
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();

  const handleVerify = async (otp: string) => {
    const { user, accessToken } = await verifyEmail(email, otp);
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
