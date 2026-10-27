import { createFileRoute } from "@tanstack/react-router";
import { CareersPage } from "../../../../features/admin/components/CareersPage";

export const Route = createFileRoute("/_protected/admin/careers/")({
  component: CareersPage,
});
