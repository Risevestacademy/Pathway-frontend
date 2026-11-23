import { useQuery } from "@tanstack/react-query";
import {
  fetchPathwayResource,
  fetchPathwayResources,
} from "../../../lib/api/pathwayResources.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import {
  buildResourceDetail,
  findResourceStep,
  type ResourceDetail,
} from "../resourceDetail.utils";
import { useCareerPathwayData } from "./useCareerPathwayData";

export type ResourceDetailState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or its resources can't be read. */
  | { kind: "unavailable" }
  /** The pathway loaded, but the backend has no such resource in it. */
  | { kind: "not-found" }
  | { kind: "ready"; careerTitle: string; detail: ResourceDetail };

/** One resource of a career's pathway, with the step it sits under. */
export function useResourceDetail(
  careerId: string,
  resourceId: string,
): { state: ResourceDetailState; retry: () => void } {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const { data: roadmap, retry: retryRoadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  // The same read the resources tab makes, so it is already cached on the way in.
  const listQuery = useQuery({
    queryKey: queryKeys.pathwayResources(userId, pathwayId ?? ""),
    queryFn: () => fetchPathwayResources(pathwayId as string),
    enabled: pathwayId !== null && userId !== "",
  });
  const step = listQuery.data ? findResourceStep(listQuery.data, resourceId) : null;

  // Which step it was opened under decides how the backend words its usage note,
  // so wait for the list to know the step.
  const detailQuery = useQuery({
    queryKey: queryKeys.pathwayResource(userId, pathwayId ?? "", resourceId, step?.id ?? null),
    queryFn: () => fetchPathwayResource(pathwayId as string, resourceId, step?.id),
    enabled: pathwayId !== null && userId !== "" && listQuery.isSuccess && listQuery.data !== null,
  });

  const retry = () => {
    retryRoadmap();
    void listQuery.refetch();
    void detailQuery.refetch();
  };

  if (roadmap.kind === "error" || listQuery.isError || detailQuery.isError) {
    return { state: { kind: "error" }, retry };
  }
  if (roadmap.kind === "unavailable") return { state: { kind: "unavailable" }, retry };
  if (roadmap.kind === "loading" || listQuery.isPending) return { state: { kind: "loading" }, retry };
  if (listQuery.data === null) return { state: { kind: "unavailable" }, retry };
  if (detailQuery.isPending) return { state: { kind: "loading" }, retry };
  if (!detailQuery.data) return { state: { kind: "not-found" }, retry };

  return {
    state: {
      kind: "ready",
      careerTitle: roadmap.kind === "ready" ? roadmap.careerTitle : "",
      detail: buildResourceDetail(detailQuery.data, step),
    },
    retry,
  };
}
