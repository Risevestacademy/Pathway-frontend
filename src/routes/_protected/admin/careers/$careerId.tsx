import { createFileRoute } from "@tanstack/react-router";
import { CareerEditorPage } from "../../../../features/admin/components/CareerEditorPage";

export const Route = createFileRoute("/_protected/admin/careers/$careerId")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { careerId } = Route.useParams();
  const { tab } = Route.useSearch();
  return <CareerEditorPage careerId={careerId} initialTab={tab} />;
}
