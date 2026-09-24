import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loginSearchSchema } from "../../lib/validation/auth.schema";
import { normalizeRedirect } from "../../lib/utils/route.util";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const handleLogin = async () => {
    // login logic here

    await navigate({
      to: normalizeRedirect(redirect),
      replace: true,
    });
  };

  return (
    <button type="button" onClick={handleLogin}>
      Log in
    </button>
  );
}
