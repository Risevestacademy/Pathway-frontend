import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { buildResourceGroups, type ResourceGroup } from "../resourceGroups.utils";
import { useCareerPathwayData } from "./useCareerPathwayData";

export type PathwayResourcesState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or isn't available. */
  | { kind: "unavailable" }
  | {
      kind: "ready";
      careerTitle: string;
      stepCount: number;
      groups: ResourceGroup[];
      /** Each step's saved status, or null when this isn't their active pathway. */
      statuses: Record<string, PathwayStepStatus> | null;
      /** How many steps they have marked complete, out of how many, or null when this isn't their active pathway. */
      progress: { completed: number; total: number } | null;
    };

/** One career's pathway resources, grouped by step, with the person's progress on each step. */
export function usePathwayResources(careerId: string): {
  state: PathwayResourcesState;
  retry: () => void;
} {
  const { data, retry } = useCareerPathwayData(careerId);

  if (data.kind !== "ready") return { state: data, retry };

  return {
    state: {
      kind: "ready",
      careerTitle: data.careerTitle,
      stepCount: data.pathway.steps.length,
      groups: buildResourceGroups(data.pathway),
      statuses: data.progress.kind === "active" ? data.progress.statuses : null,
      progress:
        data.progress.kind === "active"
          ? { completed: data.progress.progress.completed, total: data.progress.progress.total }
          : null,
    },
    retry,
  };
}
