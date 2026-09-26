import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Hourglass, MapPinOff } from "lucide-react";
import { Button } from "../../../../components/Button";
import RoadmapPage from "../../../../features/pathway/components/RoadmapPage";
import RoadmapStepList from "../../../../features/pathway/components/RoadmapStepList";
import StateMessage from "../../../../components/StateMessage";
import { getRoadmap } from "../../../../features/pathway/pathway.utils";

export const Route = createFileRoute("/careers/$careerId/roadmap/")({
  loader: ({ params }) => getRoadmap(params.careerId),
  component: RoadmapRoute,
});

function RoadmapRoute() {
  const result = Route.useLoaderData();
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
      {/*TODO: Change to the career detail route (FR-02) when it exists */}
      <a
        href={`/careers/${career.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Career details
      </a>

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
