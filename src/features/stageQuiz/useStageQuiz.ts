import { useQuery } from "@tanstack/react-query";
import { fetchQuiz, type QuizDto } from "../../lib/api/pathwayQuiz.api";
import { queryKeys } from "../../lib/queryKeys";
import { useQuizStage } from "./useQuizStage";

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
  const { state: stageState, retry: retryStage } = useQuizStage(careerId, stageId);
  const pathwayId = stageState.kind === "ready" ? stageState.pathwayId : null;

  const quizQuery = useQuery({
    queryKey: queryKeys.stageQuiz.questions(pathwayId ?? "", stageId),
    queryFn: () => fetchQuiz(pathwayId as string, stageId),
    enabled: pathwayId !== null,
  });

  const retry = () => {
    retryStage();
    void quizQuery.refetch();
  };

  if (stageState.kind !== "ready") return { state: stageState, retry };
  if (quizQuery.isError) return { state: { kind: "error" }, retry };
  if (quizQuery.isPending) return { state: { kind: "loading" }, retry };
  if (!quizQuery.data) return { state: { kind: "no-quiz" }, retry };

  const { stage } = stageState;
  return {
    state: {
      kind: "ready",
      pathwayId: stageState.pathwayId,
      careerTitle: stageState.careerTitle,
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
