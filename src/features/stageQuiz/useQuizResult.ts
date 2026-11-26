import { useQuery } from "@tanstack/react-query";
import { fetchQuizResult, type QuizResultDto } from "../../lib/api/pathwayQuiz.api";
import { queryKeys } from "../../lib/queryKeys";
import { findNextStage, findStep, firstMissedPrompt } from "./quizResult.utils";
import { useQuizStage } from "./useQuizStage";

export type QuizResultState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career, its pathway or the stage can't be read. */
  | { kind: "unavailable" }
  /** The quiz hasn't been submitted yet, so there is no result. */
  | { kind: "not-taken" }
  | {
      kind: "ready";
      pathwayId: string;
      careerTitle: string;
      stage: { id: string; title: string };
      /** The stage after this one, or null after the last. */
      nextStage: { id: string; title: string } | null;
      /** The step worth another look, and the first question they missed, when there is one. */
      revisit: {
        step: { id: string; title: string; order: number };
        missedPrompt: string | null;
      } | null;
      result: QuizResultDto;
    };

/** A stage quiz's latest result, with the stage around it: what comes next and what to revisit. */
export function useQuizResult(
  careerId: string,
  stageId: string,
): { state: QuizResultState; retry: () => void } {
  const { state: stageState, retry: retryStage } = useQuizStage(careerId, stageId);
  const pathwayId = stageState.kind === "ready" ? stageState.pathwayId : null;

  const resultQuery = useQuery({
    queryKey: queryKeys.stageQuiz.result(pathwayId ?? "", stageId),
    queryFn: () => fetchQuizResult(pathwayId as string, stageId),
    enabled: pathwayId !== null,
  });

  const retry = () => {
    retryStage();
    void resultQuery.refetch();
  };

  if (stageState.kind !== "ready") return { state: stageState, retry };
  if (resultQuery.isError) return { state: { kind: "error" }, retry };
  if (resultQuery.isPending) return { state: { kind: "loading" }, retry };
  const result = resultQuery.data;
  if (!result) return { state: { kind: "not-taken" }, retry };

  const { detail, stage } = stageState;
  const next = findNextStage(detail, stage.id);
  const revisitStep = findStep(detail, result.revisitStepId);

  return {
    state: {
      kind: "ready",
      pathwayId: stageState.pathwayId,
      careerTitle: stageState.careerTitle,
      stage: { id: stage.id, title: stage.title },
      nextStage: next ? { id: next.id, title: next.title } : null,
      revisit: revisitStep
        ? {
            step: { id: revisitStep.id, title: revisitStep.title, order: revisitStep.order },
            missedPrompt: firstMissedPrompt(result.breakdown),
          }
        : null,
      result,
    },
    retry,
  };
}
