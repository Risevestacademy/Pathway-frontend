import { createFileRoute, redirect } from "@tanstack/react-router";
import LandingPage from "../features/landing/components/LandingPage";
import { selectIsAuthenticated, useAuthStore } from "../lib/stores/authStore";

export const Route = createFileRoute("/")({
  staticData: { shellVariant: "none" },
  // Signed-in users skip the marketing page. Only the synchronous check runs
  // here so a cold backend never delays first paint; LandingPage finishes the
  // hydration and redirects once the session is known.
  beforeLoad: () => {
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers", replace: true });
    }
  },
  component: LandingPage,
});
