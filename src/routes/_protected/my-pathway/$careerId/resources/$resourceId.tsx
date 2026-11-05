import { createFileRoute } from "@tanstack/react-router";
import { ResourceDetailPage } from "../../../../../features/pathwayRoadmap/components/ResourceDetailPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/resources/$resourceId")({
  component: ResourceDetailRoute,
});

function ResourceDetailRoute() {
  const { careerId, resourceId } = Route.useParams();
  return <ResourceDetailPage careerId={careerId} resourceId={resourceId} />;
}
