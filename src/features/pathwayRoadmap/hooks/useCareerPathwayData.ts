import { useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull, type CareerPathwayDto } from "../../../lib/api/pathways.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useCareer } from "../../careerDetail/hooks/useCareer";
import { useCareerProgress } from "../../progress/hooks/useCareerProgress";
import type { CareerProgress } from "../../progress/progress.types";

const ROADMAP_STALE_MS = 15 * 60 * 1000;

export type CareerPathwayData =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or isn't available. */
  | { kind: "unavailable" }
  | {
      kind: "ready";
      careerTitle: string;
      pathway: CareerPathwayDto["pathway"];
      progress: CareerProgress;
    };

/** Everything the pages of one career's pathway share: its name, its roadmap, and the person's progress. */
export function useCareerPathwayData(careerId: string): {
  data: CareerPathwayData;
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
    return { data: { kind: "error" }, retry };
  }
  if (
    careerQuery.isPending ||
    pathwayQuery.isPending ||
    !careerQuery.data ||
    progress.kind === "loading"
  ) {
    return { data: { kind: "loading" }, retry };
  }
  if (!pathwayQuery.data) {
    return { data: { kind: "unavailable" }, retry };
  }

  return {
    data: {
      kind: "ready",
      careerTitle: careerQuery.data.title,
      pathway: pathwayQuery.data,
      progress,
    },
    retry,
  };
}
