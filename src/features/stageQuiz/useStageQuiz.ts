import { useQuery } from "@tanstack/react-query";
import { fetchQuiz, type QuizDto } from "../../lib/api/pathwayQuiz.api";
import { fetchPathwayById } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";

export interface QuizStage {
  id: string;
  title: string;
  /** The steps this stage covers, in order. */
  steps: { id: string; title: string; order: number }[];
}

export type StageQuizState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career, its pathway or the stage can't be read. */
  | { kind: "unavailable" }
  /** The stage exists but has no quiz. */
  | { kind: "no-quiz" }
  | {
      kind: "ready";
      pathwayId: string;
      careerTitle: string;
      stage: QuizStage;
      quiz: QuizDto;
    };

/** A stage's quiz with what the pages around it need: the pathway, the stage and its steps. */
export function useStageQuiz(
  careerId: string,
  stageId: string,
): { state: StageQuizState; retry: () => void } {
  const { data: roadmap, retry: retryRoadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const detailQuery = useQuery({
    queryKey: queryKeys.pathwayDetail(pathwayId ?? ""),
    queryFn: () => fetchPathwayById(pathwayId as string),
    enabled: pathwayId !== null,
  });

  const stage = detailQuery.data?.stages.find((candidate) => candidate.id === stageId);

  const quizQuery = useQuery({
    queryKey: queryKeys.stageQuiz.questions(pathwayId ?? "", stageId),
    queryFn: () => fetchQuiz(pathwayId as string, stageId),
    enabled: pathwayId !== null && stage !== undefined,
  });

  const retry = () => {
    retryRoadmap();
    void detailQuery.refetch();
    void quizQuery.refetch();
  };

  if (roadmap.kind === "error" || detailQuery.isError || quizQuery.isError) {
    return { state: { kind: "error" }, retry };
  }
  if (roadmap.kind === "unavailable") return { state: { kind: "unavailable" }, retry };
  if (roadmap.kind === "loading" || detailQuery.isPending) {
    return { state: { kind: "loading" }, retry };
  }
  if (!detailQuery.data || !stage) return { state: { kind: "unavailable" }, retry };
  if (quizQuery.isPending) return { state: { kind: "loading" }, retry };
  if (!quizQuery.data) return { state: { kind: "no-quiz" }, retry };

  return {
    state: {
      kind: "ready",
      pathwayId: detailQuery.data.id,
      careerTitle: roadmap.kind === "ready" ? roadmap.careerTitle : "",
      stage: {
        id: stage.id,
        title: stage.title,
        steps: stage.steps
          .map(({ id, title, order }) => ({ id, title, order }))
          .sort((a, b) => a.order - b.order),
      },
      quiz: quizQuery.data,
    },
    retry,
  };
}
