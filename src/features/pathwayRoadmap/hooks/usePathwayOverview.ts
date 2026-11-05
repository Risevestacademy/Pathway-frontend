import { useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useCareer } from "../../careerDetail/hooks/useCareer";
import { useCareerProgress } from "../../progress/hooks/useCareerProgress";
import { buildOverview, type PathwayOverview } from "../overview.utils";

const ROADMAP_STALE_MS = 15 * 60 * 1000;

export type PathwayOverviewState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or isn't available. */
  | { kind: "unavailable" }
  | { kind: "ready"; careerTitle: string; overview: PathwayOverview };

/** One career's pathway overview: its name, its roadmap, and the person's progress on it. */
export function usePathwayOverview(careerId: string): {
  state: PathwayOverviewState;
  retry: () => void;
} {
  const careerQuery = useCareer(careerId);
  const pathwayQuery = useQuery({
    queryKey: queryKeys.pathway(careerId),
    queryFn: () => fetchPathwayOrNull(careerId),
    staleTime: ROADMAP_STALE_MS,
    refetchOnWindowFocus: false,
  });
  const { progress, retry: retryProgress } = useCareerProgress(careerId);

  const retry = () => {
    void careerQuery.refetch();
    void pathwayQuery.refetch();
    retryProgress();
  };

  // Without their progress the roadmap would wrongly read as not started.
  if (careerQuery.isError || pathwayQuery.isError || progress.kind === "error") {
    return { state: { kind: "error" }, retry };
  }
  if (
    careerQuery.isPending ||
    pathwayQuery.isPending ||
    !careerQuery.data ||
    progress.kind === "loading"
  ) {
    return { state: { kind: "loading" }, retry };
  }
  if (!pathwayQuery.data) {
    return { state: { kind: "unavailable" }, retry };
  }

  return {
    state: {
      kind: "ready",
      careerTitle: careerQuery.data.title,
      overview: buildOverview(pathwayQuery.data, progress),
    },
    retry,
  };
}
