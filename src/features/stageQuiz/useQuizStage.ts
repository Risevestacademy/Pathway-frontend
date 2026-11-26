import { useQuery } from "@tanstack/react-query";
import { fetchPathwayById, type PathwayDetailDto, type PathwayDetailStageDto } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";

export type QuizStageState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career, its pathway or the stage can't be read. */
  | { kind: "unavailable" }
  | {
      kind: "ready";
      pathwayId: string;
      careerTitle: string;
      detail: PathwayDetailDto;
      stage: PathwayDetailStageDto;
    };

/** The pathway a career's quiz belongs to, and the stage in it that the quiz is for. */
export function useQuizStage(
  careerId: string,
  stageId: string,
): { state: QuizStageState; retry: () => void } {
  const { data: roadmap, retry: retryRoadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const detailQuery = useQuery({
    queryKey: queryKeys.pathwayDetail(pathwayId ?? ""),
    queryFn: () => fetchPathwayById(pathwayId as string),
    enabled: pathwayId !== null,
  });

  const retry = () => {
    retryRoadmap();
    void detailQuery.refetch();
  };

  if (roadmap.kind === "error" || detailQuery.isError) return { state: { kind: "error" }, retry };
  if (roadmap.kind === "unavailable") return { state: { kind: "unavailable" }, retry };
  if (roadmap.kind === "loading" || detailQuery.isPending) {
    return { state: { kind: "loading" }, retry };
  }

  const detail = detailQuery.data;
  const stage = detail?.stages.find((candidate) => candidate.id === stageId);
  if (!detail || !stage) return { state: { kind: "unavailable" }, retry };

  return {
    state: {
      kind: "ready",
      pathwayId: detail.id,
      careerTitle: roadmap.careerTitle,
      detail,
      stage,
    },
    retry,
  };
}
