import { buildOverview, type PathwayOverview } from "../overview.utils";
import { useCareerPathwayData } from "./useCareerPathwayData";

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
  const { data, retry } = useCareerPathwayData(careerId);

  if (data.kind !== "ready") return { state: data, retry };

  return {
    state: {
      kind: "ready",
      careerTitle: data.careerTitle,
      overview: buildOverview(data.pathway, data.progress),
    },
    retry,
  };
}
