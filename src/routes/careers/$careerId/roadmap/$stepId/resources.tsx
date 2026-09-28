import { createFileRoute } from "@tanstack/react-router";
import ResourcesPage from "../../../../../features/resources/components/ResourcesPage";

export const Route = createFileRoute(
  "/careers/$careerId/roadmap/$stepId/resources",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { careerId, stepId } = Route.useParams();
  return <ResourcesPage careerId={careerId} stepId={stepId} />;
}
