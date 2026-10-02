import { createFileRoute } from "@tanstack/react-router";
import {
  getStepContext,
  mapPathwayToRoadmap,
} from "../../../../../features/pathway/pathway.utils";
import { mapPathwayResource } from "../../../../../features/resources/resources.utils";
import { fetchCareerPathway } from "../../../../../lib/api/pathways.api";
import ResourcesPage from "../../../../../features/resources/components/ResourcesPage";

export const Route = createFileRoute(
  "/careers/$careerId/roadmap/$stepId/resources",
)({
  loader: async ({ params }) => {
    const { pathway } = await fetchCareerPathway(params.careerId);
    const result = mapPathwayToRoadmap(pathway);
    const context = getStepContext(result?.roadmap?.steps ?? [], params.stepId);
    const step = pathway.steps.find(({ id }) => id === params.stepId);

    return {
      result,
      context,
      resources: step?.resources.map(mapPathwayResource) ?? [],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { careerId, stepId } = Route.useParams();
  const data = Route.useLoaderData();
  return <ResourcesPage careerId={careerId} stepId={stepId} {...data} />;
}
