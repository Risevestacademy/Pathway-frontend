import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchCareers } from "../../lib/api/careers.api";
import { matchesSkillCheckCareer } from "../../features/skillCheck/careerMatch";
import { SKILL_CHECK_CAREERS } from "../../features/skillCheck/skillCheck.mock";

// The other Skill Check screens moved under My Pathway too.
export const Route = createFileRoute("/skill-check/$")({
  beforeLoad: async ({ params }) => {
    const rest = params._splat?.replace(/^\/+|\/+$/g, "");
    const [careerId, destination] = rest?.split("/") ?? [];

    if (careerId && destination === "roadmap") {
      const skillCheckCareer = SKILL_CHECK_CAREERS.find((career) => career.careerId === careerId);
      const careers = skillCheckCareer ? await fetchCareers({}) : [];
      const realCareer = careers.find(
        (career) =>
          skillCheckCareer &&
          matchesSkillCheckCareer(skillCheckCareer, {
            title: career.title,
            slug: career.slug,
          }),
      );

      throw redirect({
        to: realCareer
          ? "/my-pathway/$careerId/overview"
          : "/my-pathway/skill-check",
        ...(realCareer ? { params: { careerId: realCareer.id } } : {}),
        replace: true,
      });
    }

    throw redirect({
      to: (rest ? `/my-pathway/skill-check/${rest}` : "/my-pathway/skill-check") as "/my-pathway/skill-check",
      replace: true,
    });
  },
});
