import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../features/landing/components/LandingPage";

// Public to everyone, signed in or not; the nav offers signed-in users a way back into the app.
export const Route = createFileRoute("/")({
  staticData: { shellVariant: "none" },
  component: LandingPage,
});
