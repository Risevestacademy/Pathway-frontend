import { createFileRoute } from "@tanstack/react-router";
import OpportunityPage from "@/features/opportunities/components/OpportunityPage";

export const Route = createFileRoute(
  "/_protected/opportunities/$opportunitiesId/",
)({
  component: OpportunityPage,
});
