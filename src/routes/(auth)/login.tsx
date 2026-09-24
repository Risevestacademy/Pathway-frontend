import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loginSearchSchema } from "../../lib/validation/auth.schema";
import { isInternalPath } from "../../lib/utils/route.util";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const handleLogin = async () => {
    // login logic here

    const redirectTo = isInternalPath(redirect) ? redirect : "/";

    await navigate({
      to: redirectTo,
      replace: true,
    });
  };

  return (
    <button type="button" onClick={handleLogin}>
      Log in
    </button>
  );
}
