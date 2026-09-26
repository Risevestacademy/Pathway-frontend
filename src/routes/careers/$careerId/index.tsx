import { createFileRoute } from "@tanstack/react-router";
import CareerDetailPage from "../../../features/careerDetail/components/CareerDetailPage";
import { ChevronLeft } from "lucide-react";
import { getCareerInfo } from "@/features/careerDetail/careerDetail.utils";
import StateMessage from "@/components/StateMessage";
import { SearchX } from "lucide-react";
import { Button } from "@/components/Button";
import { useNavigate } from "@tanstack/react-router";
import Detail from "@/features/careerDetail/components/detail";
import DetailSkeleton from "@/features/careerDetail/components/detailSkeleton";

export const Route = createFileRoute("/careers/$careerId/")({
  loader: ({ params }) => getCareerInfo(params.careerId),
  pendingComponent: DetailSkeleton,
  component: CareerDetailRoute,
});

function CareerDetailRoute() {
  const result = Route.useLoaderData();
  const navigate = useNavigate();

  if (!result) {
    return (
      <CareerDetailPage>
        <StateMessage
          icon={SearchX}
          title="This career isn't available"
          body="It may have been removed from the catalogue."
          action={
            <Button isPrimary={false} onClick={() => navigate({ to: "/" })}>
              Browse careers
            </Button>
          }
        />
      </CareerDetailPage>
    );
  }

  return (
    <CareerDetailPage>
      <a
        href="#"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All Careers
      </a>

      <Detail career={result} />
    </CareerDetailPage>
  );
}
