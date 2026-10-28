import { createFileRoute } from "@tanstack/react-router";
import { ReportDetailPage } from "../../../../features/admin/components/ReportDetailPage";

export const Route = createFileRoute("/_protected/admin/reports/$reportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { reportId } = Route.useParams();
  return <ReportDetailPage reportId={reportId} />;
}
