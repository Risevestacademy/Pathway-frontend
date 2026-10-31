import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod/mini";
import {
  AcceptInvitePage,
  AcceptInvitePending,
} from "../features/admin/components/AcceptInvitePage";
import { ensureAuthHydrated, logout } from "../lib/api/auth.api";
import { analytics } from "../lib/monitoring/events";
import { selectIsAuthenticated, useAuthStore } from "../lib/stores/authStore";

const acceptInviteSearchSchema = z.object({
  token: z.optional(z.string()),
});

export const Route = createFileRoute("/accept-invite")({
  validateSearch: acceptInviteSearchSchema,
  beforeLoad: async ({ location, search }) => {
    // An invite is for a signed-in person: send everyone else to sign in and bring them back here.
    if (!search.token) return;
    await ensureAuthHydrated();
    if (!selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  // Checking the session can wait on a backend that is still waking up.
  pendingComponent: AcceptInvitePending,
  pendingMs: 200,
  component: AcceptInviteRoute,
});

function AcceptInviteRoute() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const useDifferentAccount = async () => {
    // Throws if the server can't revoke the session: a surviving cookie would sign them straight back in.
    await logout();
    // Cleared before leaving: the login page sends anyone who is still signed in away.
    useAuthStore.getState().clearAuth();
    analytics.logout();
    // Nothing cached for the old account should show for the next one.
    queryClient.clear();
    await navigate({
      to: "/login",
      search: { redirect: `/accept-invite?token=${encodeURIComponent(token ?? "")}` },
      replace: true,
    });
  };

  return <AcceptInvitePage token={token} onUseDifferentAccount={useDifferentAccount} />;
}
