import { createFileRoute } from "@tanstack/react-router";
import { RoadmapPage } from "../../../features/pathwayRoadmap/components/RoadmapPage";

export const Route = createFileRoute("/_protected/my-pathway/")({
  component: RoadmapPage,
});
