import type { PathwayStepStatus } from "../../lib/api/progress.api";

/** A stage and the steps it holds, which is all the quiz entry point needs to know about it. */
export interface QuizStageRef {
  id: string;
  title: string;
  stepIds: string[];
}

/**
 * The stage this step belongs to, but only once every step in that stage has
 * been marked complete. Null while any is left, for a step in no stage, or
 * when there are no statuses because they aren't tracking this pathway.
 */
export function completedStageOf(
  stages: QuizStageRef[],
  statuses: Record<string, PathwayStepStatus> | null,
  stepId: string,
): QuizStageRef | null {
  if (!statuses) return null;

  const stage = stages.find((candidate) => candidate.stepIds.includes(stepId));
  if (!stage || stage.stepIds.length === 0) return null;

  return stage.stepIds.every((id) => statuses[id] === "COMPLETED") ? stage : null;
}
