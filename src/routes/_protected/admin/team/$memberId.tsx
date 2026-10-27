import { createFileRoute } from "@tanstack/react-router";
import { MemberPage } from "../../../../features/admin/components/MemberPage";

export const Route = createFileRoute("/_protected/admin/team/$memberId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { memberId } = Route.useParams();
  return <MemberPage memberId={memberId} />;
}
