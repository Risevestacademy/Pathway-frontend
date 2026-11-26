import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "../../../../../features/pathwayRoadmap/components/ResourcesPage";

const text = (value: unknown) => (typeof value === "string" && value !== "" ? value : undefined);

export const Route = createFileRoute("/_protected/my-pathway/$careerId/resources/")({
  // A step or stage to open on, e.g. from a quiz result. Anything else is ignored.
  validateSearch: (search: Record<string, unknown>): { step?: string; stage?: string } => ({
    step: text(search.step),
    stage: text(search.stage),
  }),
  component: ResourcesRoute,
});

function ResourcesRoute() {
  const { careerId } = Route.useParams();
  const { step, stage } = Route.useSearch();
  return <ResourcesPage careerId={careerId} openStepId={step} openStageId={stage} />;
}
