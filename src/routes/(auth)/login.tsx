import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { loginSearchSchema } from "../../lib/validation/auth.schema";
import LoginForm from "../../features/auth/components/LoginForm";
import { useLogin } from "../../features/auth/hooks/useLogin";
import { useResendCode } from "../../features/auth/hooks/useResendCode";
import { normalizeRedirect } from "../../lib/utils/route.util";
import { loginWithGoogle } from "../../lib/api/auth.api";
import { useAuthStore } from "../../lib/stores/authStore";
import { ensureAuthHydrated } from "../../lib/api/auth.api";
import { selectIsAuthenticated } from "../../lib/stores/authStore";

export const Route = createFileRoute("/(auth)/login")({
  staticData: { shellVariant: "wide" },
  validateSearch: loginSearchSchema,
  beforeLoad: async () => {
    await ensureAuthHydrated();
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const login = useLogin();
  const resendCode = useResendCode();
  const { redirect } = Route.useSearch();

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    await login.mutateAsync({ email, password });

    await navigate({
      to: redirect ? normalizeRedirect(redirect) : "/careers",
      replace: true,
    });
  };

  const handleGoogleAuth = async (idToken: string) => {
    const response = await loginWithGoogle(idToken);
    useAuthStore.getState().setAuth(response.user, response.accessToken);
    await navigate({
      to: redirect ? normalizeRedirect(redirect) : "/careers",
      replace: true,
    });
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onGoogleAuth={handleGoogleAuth}
      onResendCode={resendCode}
    />
  );
}
