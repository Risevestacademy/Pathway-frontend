import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "../../../../features/admin/components/TeamPage";

export const Route = createFileRoute("/_protected/admin/team/")({
  component: TeamPage,
});
