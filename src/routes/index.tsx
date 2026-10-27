import { createFileRoute, redirect } from "@tanstack/react-router";
import LandingPage from "../features/landing/components/LandingPage";
import { selectIsAuthenticated, useAuthStore } from "../lib/stores/authStore";

export const Route = createFileRoute("/")({
  staticData: { shellVariant: "none" },
  // Synchronous check only, so a cold backend never delays first paint; LandingPage finishes hydration.
  beforeLoad: () => {
    if (selectIsAuthenticated(useAuthStore.getState())) {
      throw redirect({ to: "/careers", replace: true });
    }
  },
  component: LandingPage,
});
