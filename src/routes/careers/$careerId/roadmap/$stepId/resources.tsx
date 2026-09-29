import { createFileRoute } from "@tanstack/react-router";
import { getRoadmap, getStepContext } from "../../../../../features/pathway/pathway.utils";
import { getResources } from "../../../../../features/resources/resources.utils";
import ResourcesPage from "../../../../../features/resources/components/ResourcesPage";

export const Route = createFileRoute(
  "/careers/$careerId/roadmap/$stepId/resources",
)({
  loader: ({ params }) => {
    const result = getRoadmap(params.careerId);
    const context = getStepContext(result?.roadmap?.steps ?? [], params.stepId);

    return {
      result,
      context,
      resources: context ? getResources(context.step.resourceIds) : [],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { careerId, stepId } = Route.useParams();
  const data = Route.useLoaderData();
  return <ResourcesPage careerId={careerId} stepId={stepId} {...data} />;
}
