import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Hourglass, MapPinOff } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import RoadmapPage from "../../../../features/pathway/components/RoadmapPage";
import RoadmapStepList from "../../../../features/pathway/components/RoadmapStepList";
import StateMessage from "../../../../components/StateMessage";
import { mapPathwayToRoadmap } from "../../../../features/pathway/pathway.utils";
import RoadmapError from "../../../../features/pathway/components/RoadmapError";
import RoadmapSkeleton from "../../../../features/pathway/components/RoadmapSkeleton";
import { fetchPathwayOrNull } from "../../../../lib/api/pathways.api";
import { Link } from "@tanstack/react-router";
import { analytics } from "@/lib/monitoring/events";
import { useEffect } from "react";
import { withLoaderErrorReporting } from "@/lib/monitoring/sentry";

export const Route = createFileRoute("/careers/$careerId/roadmap/")({
  loader: ({ params }) =>
    withLoaderErrorReporting(async () => {
      const pathway = await fetchPathwayOrNull(params.careerId);
      return pathway ? mapPathwayToRoadmap(pathway) : null;
    }),
  pendingComponent: RoadmapSkeleton,
  errorComponent: RoadmapError,
  component: RoadmapRoute,
});

function RoadmapRoute() {
  const result = Route.useLoaderData();
  const roadmapId = result?.roadmap?.id;
  const careerId = result?.career.id;
  const careerTitle = result?.career.title;

  useEffect(() => {
    if (!roadmapId || !careerId || !careerTitle) return;

    analytics.trackFeature.roadmapViewed(roadmapId, careerId, careerTitle);
  }, [careerId, careerTitle, roadmapId]);

  const navigate = useNavigate();

  const homeAction = (
    <Button isPrimary={false} onClick={() => navigate({ to: "/" })}>
      Return home
    </Button>
  );

  if (!result) {
    return (
      <RoadmapPage>
        <StateMessage
          icon={MapPinOff}
          title="Roadmap not available"
          body="This career isn't available right now, so its roadmap can't be shown."
          action={homeAction}
        />
      </RoadmapPage>
    );
  }

  const { career, roadmap } = result;

  if (!roadmap) {
    return (
      <RoadmapPage>
        <StateMessage
          icon={Hourglass}
          title="Roadmap coming soon"
          body={`We're still putting together the roadmap for ${career.title}.`}
          action={homeAction}
        />
      </RoadmapPage>
    );
  }

  return (
    <RoadmapPage>
      <Link
        to="/careers/$careerId"
        params={{ careerId: career.id }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Career details
      </Link>

      <p className="text-sm font-medium text-brand-700">{career.title}</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        Your roadmap
      </h1>
      <p className="mt-2 text-ink-muted">
        {roadmap.steps.length} steps in a recommended order. You can open any
        step to look ahead.
      </p>

      <RoadmapStepList careerId={career.id} steps={roadmap.steps} />
    </RoadmapPage>
  );
}
