import { createFileRoute, redirect } from "@tanstack/react-router";

// The other Skill Check screens moved under My Pathway too. Keep the rest of the path.
export const Route = createFileRoute("/skill-check/$")({
  beforeLoad: ({ params }) => {
    const rest = params._splat?.replace(/^\/+|\/+$/g, "");
    throw redirect({
      to: (rest ? `/my-pathway/skill-check/${rest}` : "/my-pathway/skill-check") as "/my-pathway/skill-check",
      replace: true,
    });
  },
});
