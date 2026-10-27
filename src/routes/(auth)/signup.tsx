import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import SignupForm from "../../features/auth/components/SignupForm";
import { useSignup } from "../../features/auth/hooks/useSignup";
import { setPendingVerificationEmail } from "../../features/auth/pendingVerification";
import { loginWithGoogle } from "../../lib/api/auth.api";
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
    // A 409 surfaces as EmailAlreadyRegisteredError, and the form offers a link
    // to log in. Unverified accounts need the backend to resend the code on
    // register (or return a distinct status) before we can route them onward.
    await signup.mutateAsync({ fullName, email, password });

    setPendingVerificationEmail(email);
    await navigate({ to: "/verify-email", replace: true });
  };

  const handleGoogleAuth = async (idToken: string) => {
    const response = await loginWithGoogle(idToken);
    useAuthStore.getState().setAuth(response.user, response.accessToken);
    await navigate({ to: "/careers", replace: true });
  };

  return <SignupForm onSubmit={handleSignup} onGoogleAuth={handleGoogleAuth} />;
}
