import { createFileRoute } from "@tanstack/react-router";
import CareerDetailPage from "../../../features/careerDetail/components/CareerDetailPage";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import StateMessage from "@/components/StateMessage";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate, Link } from "@tanstack/react-router";
import Detail from "@/features/careerDetail/components/detail";
import DetailSkeleton from "@/features/careerDetail/components/detailSkeleton";
import { useCareer } from "@/features/careerDetail/hooks/useCareer";
// import { DiscoverHero } from "@/features/catalog/components/DiscoverHero";
import { DetailHero } from "@/features/careerDetail/components/detailHero";
import { analytics } from "@/lib/monitoring/events";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { isAxiosError } from "axios";

export const Route = createFileRoute("/careers/$careerId/")({
  pendingComponent: DetailSkeleton,
  component: CareerDetailRoute,
});

function CareerDetailRoute() {
  const { careerId } = Route.useParams();
  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
  } = useCareer(careerId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!result) return;

    analytics.trackFeature.careerViewed(
      result.id,
      result.title,
      result.interest ?? "",
      result.level ?? "",
    );
  }, [result]);

  useEffect(() => {
    if (isError && !isAxiosError(error)) {
      Sentry.captureException(error);
    }
  }, [error, isError]);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    return (
      <CareerDetailPage>
        <StateMessage
          icon={AlertTriangle}
          variant="error"
          title="We couldn’t load this career"
          body="Something went wrong while loading the career details. Please try again."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      </CareerDetailPage>
    );
  }

  if (!result) {
    return (
      <CareerDetailPage>
        <StateMessage
          icon={SearchX}
          title="This career isn't available"
          body="It may have been removed from the catalogue."
          action={
            <Button
              isPrimary={false}
              onClick={() => navigate({ to: "/careers" })}
            >
              Browse careers
            </Button>
          }
        />
      </CareerDetailPage>
    );
  }

  return (
    <CareerDetailPage>
      <Link
        to="/careers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All Careers
      </Link>

      <DetailHero career={result} />

      <Detail career={result} />
    </CareerDetailPage>
  );
}
