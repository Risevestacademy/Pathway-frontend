import { buildOverview, type PathwayOverview } from "../overview.utils";
import { buildResourceGroups, type ResourceGroup } from "../resourceGroups.utils";
import { useCareerPathwayData } from "./useCareerPathwayData";

export type PathwayProgressState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or isn't available. */
  | { kind: "unavailable" }
  | {
      kind: "ready";
      careerTitle: string;
      overview: PathwayOverview;
      groups: ResourceGroup[];
      /** Set when this career isn't their active pathway, naming the one it would replace (or null). */
      activation: { activeCareerTitle: string | null } | null;
    };

/** What the Progress tab needs: the overview of the pathway, and its resources by step. */
export function usePathwayProgress(careerId: string): {
  state: PathwayProgressState;
  retry: () => void;
} {
  const { data, retry } = useCareerPathwayData(careerId);

  if (data.kind !== "ready") return { state: data, retry };

  return {
    state: {
      kind: "ready",
      careerTitle: data.careerTitle,
      overview: buildOverview(data.pathway, data.progress),
      groups: buildResourceGroups(data.pathway),
      activation:
        data.progress.kind === "active"
          ? null
          : {
              activeCareerTitle:
                "activeCareerTitle" in data.progress ? data.progress.activeCareerTitle : null,
            },
    },
    retry,
  };
}
