import { createFileRoute } from "@tanstack/react-router";
import OpportunitiesPage from "@/features/opportunities/components/OpportunitiesPage";

export const Route = createFileRoute("/_protected/opportunities/")({
  component: () => <OpportunitiesPage />,
});
