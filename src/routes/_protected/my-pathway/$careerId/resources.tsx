import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "../../../../features/pathwayRoadmap/components/ResourcesPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/resources")({
  component: ResourcesRoute,
});

function ResourcesRoute() {
  const { careerId } = Route.useParams();
  return <ResourcesPage careerId={careerId} />;
}
