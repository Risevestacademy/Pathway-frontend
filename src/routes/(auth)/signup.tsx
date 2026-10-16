import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SignupForm from "../../features/auth/components/SignupForm";
import { useSignup } from "../../features/auth/hooks/useSignup";
import { loginWithGoogle } from "../../lib/api/auth.api";
import { useAuthStore } from "../../lib/stores/authStore";

export const Route = createFileRoute("/(auth)/signup")({
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
    await signup.mutateAsync({ fullName, email, password });
    await navigate({ to: "/careers", replace: true });
  };

  const handleGoogleAuth = async (idToken: string) => {
    const response = await loginWithGoogle(idToken);
    useAuthStore.getState().setAuth(response.user, response.accessToken);
    await navigate({ to: "/careers", replace: true });
  };

  return <SignupForm onSubmit={handleSignup} onGoogleAuth={handleGoogleAuth} />;
}
