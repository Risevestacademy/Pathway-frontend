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

export const Route = createFileRoute("/careers/$careerId/")({
  pendingComponent: DetailSkeleton,
  component: CareerDetailRoute,
});

function CareerDetailRoute() {
  const { careerId } = Route.useParams();
  const { data: result, isPending, isError, refetch } = useCareer(careerId);
  const navigate = useNavigate();

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

      <Detail career={result} />
    </CareerDetailPage>
  );
}
