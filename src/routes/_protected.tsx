import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { selectIsAuthenticated, useAuthStore } from "../lib/stores/authStore";
import { ensureAuthHydrated } from "../lib/api/auth.api";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ location }) => {
    // Temporary, until the login branch lands. Never active in production builds.
    if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true") return;

    await ensureAuthHydrated();
    const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
