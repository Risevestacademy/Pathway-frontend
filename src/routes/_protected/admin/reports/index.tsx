import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "../../../../features/admin/components/ReportsPage";

export const Route = createFileRoute("/_protected/admin/reports/")({
  component: ReportsPage,
});
