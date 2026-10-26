import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import CareerLoader from "@/features/careerDetail/components/careerLoader";
import CareerOverview from "@/features/careerDetail/components/careerOverview";
import { CareerHero } from "@/features/careerDetail/components/careerHero";
import DetailSkeleton from "@/features/careerDetail/components/detailSkeleton";
import { useCareerHeroMeta } from "@/features/careerDetail/hooks/useCareerHeroMeta";
import { hasSkillCheck } from "@/features/skillCheck/careerMatch";
import { BackLink } from "@/features/skillCheck/components/BackLink";
import { SkillGapEntry } from "@/features/skillCheck/components/SkillGapEntry";
import { SkillLink } from "@/features/skillCheck/components/SkillButton";
import type { Career } from "@/types/career.types";

export const Route = createFileRoute("/careers/$careerId/")({
  pendingComponent: DetailSkeleton,
  component: CareerRoute,
});

function CareerRoute() {
  const { careerId } = Route.useParams();

  return (
    <CareerLoader careerId={careerId}>
      {(career) => <CareerOverviewPage career={career} />}
    </CareerLoader>
  );
}

function CareerOverviewPage({ career }: { career: Career }) {
  const meta = useCareerHeroMeta(career);
  const withSkillCheck = hasSkillCheck(career.title, career.slug);

  return (
    <>
      <BackLink to="/careers" label="All careers" />
      <CareerHero career={career} {...meta}>
        <div className="flex flex-wrap items-center gap-3">
          <SkillLink
            to="/careers/$careerId/details"
            params={{ careerId: career.id }}
          >
            View career
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillLink>
          {career.roadmapId ? (
            <SkillLink
              isPrimary={false}
              to="/careers/$careerId/roadmap"
              params={{ careerId: career.id }}
            >
              View roadmap
            </SkillLink>
          ) : (
            <p className="text-base leading-5 text-grey-600">
              Roadmap coming soon
            </p>
          )}
        </div>
      </CareerHero>
      <div
        className={
          withSkillCheck
            ? "mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px]"
            : "mt-4"
        }
      >
        <SkillGapEntry
          title={career.title}
          slug={career.slug}
          roadmapId={career.roadmapId}
          careerId={career.id}
        />
        <CareerOverview career={career} />
      </div>
    </>
  );
}
