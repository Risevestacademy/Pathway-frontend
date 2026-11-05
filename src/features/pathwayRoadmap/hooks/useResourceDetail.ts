import { findResourceDetail, type ResourceDetail } from "../resourceDetail.utils";
import { useCareerPathwayData } from "./useCareerPathwayData";

export type ResourceDetailState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or isn't available. */
  | { kind: "unavailable" }
  /** The roadmap loaded, but none of its steps has this resource. */
  | { kind: "not-found" }
  | { kind: "ready"; careerTitle: string; detail: ResourceDetail };

/** One resource of a career's pathway, with the step it sits under. */
export function useResourceDetail(
  careerId: string,
  resourceId: string,
): { state: ResourceDetailState; retry: () => void } {
  const { data, retry } = useCareerPathwayData(careerId);

  if (data.kind !== "ready") return { state: data, retry };

  const detail = findResourceDetail(data.pathway, resourceId);
  if (!detail) return { state: { kind: "not-found" }, retry };

  return { state: { kind: "ready", careerTitle: data.careerTitle, detail }, retry };
}
