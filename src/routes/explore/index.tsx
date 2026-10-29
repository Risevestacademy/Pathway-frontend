import { createFileRoute } from "@tanstack/react-router";
import ExplorePage from "../../features/explore/components/ExplorePage";
import { exploreSearchSchema } from "../../features/explore/explore.search";

export const Route = createFileRoute("/explore/")({
  staticData: { shellVariant: "none" },
  validateSearch: exploreSearchSchema,
  component: ExplorePage,
});
