import { createFileRoute } from "@tanstack/react-router";
import { RevisionDiffPage } from "../../../../features/admin/components/RevisionDiffPage";

export const Route = createFileRoute("/_protected/admin/revisions/$revisionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { revisionId } = Route.useParams();
  return <RevisionDiffPage revisionId={revisionId} />;
}
