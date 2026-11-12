import { createFileRoute } from "@tanstack/react-router";
import { ProgressPage } from "../../../../features/pathwayRoadmap/components/ProgressPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/progress")({
  component: ProgressRoute,
});

function ProgressRoute() {
  const { careerId } = Route.useParams();
  return <ProgressPage careerId={careerId} />;
}
