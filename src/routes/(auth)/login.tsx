import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loginSearchSchema } from "../../lib/validation/auth.schema";
import LoginForm from "../../features/auth/components/LoginForm";
import { useLogin } from "../../features/auth/hooks/useLogin";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const login = useLogin();

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    await login.mutateAsync({ email, password });

    await navigate({
      to: "/careers",
      replace: true,
    });
  };

  return <LoginForm onSubmit={handleLogin} />;
}
