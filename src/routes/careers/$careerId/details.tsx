import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import CareerLoader from "@/features/careerDetail/components/careerLoader";
import { CareerHero } from "@/features/careerDetail/components/careerHero";
import Detail from "@/features/careerDetail/components/detail";
import DetailSkeleton from "@/features/careerDetail/components/detailSkeleton";
import { useCareerHeroMeta } from "@/features/careerDetail/hooks/useCareerHeroMeta";
import { BackLink } from "@/features/skillCheck/components/BackLink";
import { SkillLink } from "@/features/skillCheck/components/SkillButton";
import type { Career } from "@/types/career.types";
import { analytics } from "@/lib/monitoring/events";
import { useEffect } from "react";

export const Route = createFileRoute("/careers/$careerId/details")({
  pendingComponent: DetailSkeleton,
  component: DetailsRoute,
});

function DetailsRoute() {
  const { careerId } = Route.useParams();
  return (
    <CareerLoader careerId={careerId}>
      {(career) => <DetailsPage career={career} />}
    </CareerLoader>
  );
}

function DetailsPage({ career }: { career: Career }) {
  const meta = useCareerHeroMeta(career);
  const { id, title, interest, levels } = career;

  useEffect(() => {
    analytics.trackFeature.careerDetailViewed(
      id,
      title,
      interest ?? "",
      levels ?? [],
    );
  }, [id, interest, levels, title]);

  return (
    <>
      <BackLink to="/careers/$careerId" careerId={career.id} label="Back" />
      <CareerHero career={career} {...meta}>
        {career.roadmapId ? (
          <SkillLink
            className="w-fit"
            to="/careers/$careerId/roadmap"
            params={{ careerId: career.id }}
          >
            Begin roadmap
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillLink>
        ) : (
          <p className="text-base leading-5 text-grey-600">
            Roadmap coming soon
          </p>
        )}
      </CareerHero>
      <Detail career={career} />
    </>
  );
}
