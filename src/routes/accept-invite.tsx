import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod/mini";
import { AcceptInvitePage } from "../features/admin/components/AcceptInvitePage";
import { ensureAuthHydrated } from "../lib/api/auth.api";
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
  component: AcceptInviteRoute,
});

function AcceptInviteRoute() {
  const { token } = Route.useSearch();
  return <AcceptInvitePage token={token} />;
}
