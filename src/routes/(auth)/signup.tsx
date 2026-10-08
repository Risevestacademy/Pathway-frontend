import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SignupForm from "../../features/auth/components/SignupForm";
import { useSignup } from "../../features/auth/hooks/useSignup";

export const Route = createFileRoute("/(auth)/signup")({
  component: SignupRoute,
});

function SignupRoute() {
  const navigate = useNavigate();
  const signup = useSignup();

  const handleSignup = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    await signup.mutateAsync({ email, password });
    await navigate({ to: "/careers", replace: true });
  };

  return <SignupForm onSubmit={handleSignup} />;
}
