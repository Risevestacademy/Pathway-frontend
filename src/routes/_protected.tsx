import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { selectIsAuthenticated, useAuthStore } from "../lib/stores/authStore";
import { ensureAuthHydrated } from "../lib/api/auth.api";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ location }) => {
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
