import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "../../../../features/pathwayRoadmap/components/OverviewPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/overview")({
  component: OverviewRoute,
});

function OverviewRoute() {
  const { careerId } = Route.useParams();
  return <OverviewPage careerId={careerId} />;
}
