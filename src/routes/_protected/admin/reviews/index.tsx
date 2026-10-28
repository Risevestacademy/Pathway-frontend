import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "../../../../features/admin/components/ReviewsPage";

export const Route = createFileRoute("/_protected/admin/reviews/")({
  component: ReviewsPage,
});
