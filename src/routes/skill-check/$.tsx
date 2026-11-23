import { createFileRoute, redirect } from "@tanstack/react-router";

// The other Skill Check screens moved under My Pathway. Their old addresses
// used placeholder career ids, so they all land on the Skill Check hub.
export const Route = createFileRoute("/skill-check/$")({
  beforeLoad: () => {
    throw redirect({ to: "/my-pathway/skill-check", replace: true });
  },
});
