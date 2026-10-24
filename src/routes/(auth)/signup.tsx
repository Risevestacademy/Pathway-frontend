import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import SignupForm from "../../features/auth/components/SignupForm";
import { useSignup } from "../../features/auth/hooks/useSignup";
import {
  EmailAlreadyRegisteredError,
  loginUser,
  loginWithGoogle,
  logoutWithToken,
  resendVerification,
} from "../../lib/api/auth.api";
import { useAuthStore } from "../../lib/stores/authStore";
import { ensureAuthHydrated } from "../../lib/api/auth.api";
import { selectIsAuthenticated } from "../../lib/stores/authStore";

export const Route = createFileRoute("/(auth)/signup")({
  staticData: { shellVariant: "wide" },
  beforeLoad: async () => {
    await ensureAuthHydrated();
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers" });
    }
  },
  component: SignupRoute,
});

function SignupRoute() {
  const navigate = useNavigate();
  const signup = useSignup();

  const handleSignup = async ({
    fullName,
    email,
    password,
  }: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      await signup.mutateAsync({ fullName, email, password });
    } catch (error) {
      if (!(error instanceof EmailAlreadyRegisteredError)) throw error;

      // The email may belong to an account that never finished verifying.
      // Login only succeeds for verified accounts, so a success means the
      // email is taken: drop the probe session and send them to log in.
      let probeToken: string | null = null;
      try {
        probeToken = (await loginUser({ email, password })).accessToken;
      } catch {
        // Login rejects unverified accounts (and wrong passwords) with 401.
      }
      if (probeToken) {
        await logoutWithToken(probeToken);
        throw new EmailAlreadyRegisteredError();
      }

      try {
        await resendVerification(email);
      } catch {
        throw error;
      }
    }

    await navigate({ to: "/verify-email", search: { email }, replace: true });
  };

  const handleGoogleAuth = async (idToken: string) => {
    const response = await loginWithGoogle(idToken);
    useAuthStore.getState().setAuth(response.user, response.accessToken);
    await navigate({ to: "/careers", replace: true });
  };

  return <SignupForm onSubmit={handleSignup} onGoogleAuth={handleGoogleAuth} />;
}
