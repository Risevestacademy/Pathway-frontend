import { createFileRoute } from "@tanstack/react-router";
import OpportunityPage from "@/features/opportunities/components/OpportunityPage";
import { fetchOpportunity } from "@/lib/api/opportunities.api";
import ErrorComponent from "@/features/opportunities/components/ErrorComponents";
import { OpportunitySkeleton } from "@/features/opportunities/components/OpportunitySkeleton";
import { withLoaderErrorReporting } from "@/lib/monitoring/sentry";

export const Route = createFileRoute(
  "/_protected/opportunities/$opportunitiesId/",
)({
  component: OpportunityPage,
  loader: ({ params }) =>
    withLoaderErrorReporting(() => {
      return fetchOpportunity(params.opportunitiesId);
    }),
  errorComponent: ErrorComponent,
  pendingComponent: OpportunitySkeleton,
});
