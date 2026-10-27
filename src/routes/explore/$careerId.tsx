import { createFileRoute } from "@tanstack/react-router";
import CareerProfilePage from "../../features/explore/components/profile/CareerProfilePage";

export const Route = createFileRoute("/explore/$careerId")({
  staticData: { shellVariant: "none" },
  component: CareerProfilePage,
});
