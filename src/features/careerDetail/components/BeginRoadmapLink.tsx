import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useCareerProgress } from "../../progress/hooks/useCareerProgress";
import { SkillLink } from "../../skillCheck/components/SkillButton";

const arrow = <ArrowRightRegular aria-hidden className="size-5" />;

/**
 * Starts a career's roadmap. If it is already their active pathway it opens My
 * Pathway, where that pathway is. Otherwise it opens this career's overview.
 */
export function BeginRoadmapLink({
  careerId,
  hasRoadmap,
}: {
  careerId: string;
  hasRoadmap: boolean;
}) {
  const { progress } = useCareerProgress(careerId);

  if (!hasRoadmap) {
    return <p className="text-base leading-5 text-grey-600">Roadmap coming soon</p>;
  }

  if (progress.kind === "active") {
    return (
      <SkillLink className="w-fit" to="/my-pathway">
        Begin roadmap
        {arrow}
      </SkillLink>
    );
  }

  return (
    <SkillLink className="w-fit" to="/my-pathway/$careerId/overview" params={{ careerId }}>
      Begin roadmap
      {arrow}
    </SkillLink>
  );
}
