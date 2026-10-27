import { createFileRoute } from "@tanstack/react-router";
import { ReviewDetailPage } from "../../../../features/admin/components/ReviewDetailPage";

export const Route = createFileRoute("/_protected/admin/reviews/$reviewId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { reviewId } = Route.useParams();
  return <ReviewDetailPage reviewId={reviewId} />;
}
