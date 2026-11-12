import { createFileRoute } from "@tanstack/react-router";
import { BeginRoadmapLink } from "@/features/careerDetail/components/BeginRoadmapLink";
import CareerLoader from "@/features/careerDetail/components/CareerLoader";
import { CareerHero } from "@/features/careerDetail/components/CareerHero";
import Detail from "@/features/careerDetail/components/Detail";
import DetailSkeleton from "@/features/careerDetail/components/DetailSkeleton";
import { useCareerHeroMeta } from "@/features/careerDetail/hooks/useCareerHeroMeta";
import { BackLink } from "@/features/skillCheck/components/BackLink";
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
        <BeginRoadmapLink careerId={career.id} hasRoadmap={Boolean(career.roadmapId)} />
      </CareerHero>
      <Detail career={career} />
    </>
  );
}
