import { getRouteApi } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { AlertTriangle, SearchX } from "lucide-react";
import StateMessage from "@/components/StateMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCareer } from "@/features/careerDetail/hooks/useCareer";
import { container } from "@/features/landing/landing.styles";
import { LandingButton, LandingLinkButton } from "@/features/landing/components/LandingButton";
import PublicPageLayout from "@/features/landing/components/PublicPageLayout";
import { CAREER_PROFILE } from "../../explore.copy";
import { useCareerPathway } from "../../hooks/useCareerPathway";
import PathwayCtaSection from "../PathwayCtaSection";
import CareerProfileHero from "./CareerProfileHero";
import OutlookSection from "./OutlookSection";
import RoleSection from "./RoleSection";
import SkillsSection from "./SkillsSection";
import { panel } from "./profile.styles";

const route = getRouteApi("/explore/$careerId");

function ProfileSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <Skeleton className="h-[286px] rounded-[28px]" />
      <div className={panel}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <Skeleton className="h-[420px] rounded-[28px]" />
    </div>
  );
}

/**
 * Public career profile at /explore/$careerId, built from GET /careers/:id
 * (shared cache with the in-app detail page) and GET /careers/:id/pathway.
 */
export default function CareerProfilePage() {
  const { careerId } = route.useParams();
  const { data: career, isPending, isError, error, refetch } = useCareer(careerId);
  const pathway = useCareerPathway(careerId);
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const notFound = isError && (status === 404 || status === 400);

  return (
    <PublicPageLayout bandClassName="h-[260px] lg:h-[370px]">
      <div className={`${container} pt-10 lg:pt-[120px]`}>
        {isPending ? (
          <ProfileSkeleton />
        ) : notFound || (!isError && !career) ? (
          <div className={panel}>
            <StateMessage
              icon={SearchX}
              title={CAREER_PROFILE.notFoundTitle}
              body={CAREER_PROFILE.notFoundBody}
              action={<LandingLinkButton to="/explore" variant="secondary">{CAREER_PROFILE.browse}</LandingLinkButton>}
            />
          </div>
        ) : isError ? (
          <div className={panel}>
            <StateMessage
              icon={AlertTriangle}
              variant="error"
              title={CAREER_PROFILE.errorTitle}
              body={CAREER_PROFILE.errorBody}
              action={<LandingButton onClick={() => void refetch()}>Try again</LandingButton>}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <CareerProfileHero career={career} pathway={pathway.data} />
            <RoleSection career={career} />
            <OutlookSection career={career} />
            <SkillsSection career={career} pathway={pathway.data} pathwayLoading={pathway.isPending} />
          </div>
        )}
      </div>

      <PathwayCtaSection />
    </PublicPageLayout>
  );
}
