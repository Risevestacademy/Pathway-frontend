import { createFileRoute, redirect } from "@tanstack/react-router";

// Skill Check moved under My Pathway. Old links and bookmarks still land in the right place.
export const Route = createFileRoute("/skill-check/")({
  beforeLoad: () => {
    throw redirect({ to: "/my-pathway/skill-check", replace: true });
  },
});
