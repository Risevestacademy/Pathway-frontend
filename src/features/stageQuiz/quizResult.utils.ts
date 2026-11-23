import type { QuizBreakdownItemDto } from "../../lib/api/pathwayQuiz.api";
import type {
  PathwayDetailDto,
  PathwayDetailStageDto,
  PathwayDetailStepDto,
} from "../../lib/api/pathways.api";

/** The stage that comes right after this one, or null after the last (or for an unknown stage). */
export function findNextStage(
  detail: PathwayDetailDto,
  stageId: string,
): PathwayDetailStageDto | null {
  const current = detail.stages.find((stage) => stage.id === stageId);
  if (!current) return null;

  const later = detail.stages
    .filter((stage) => stage.order > current.order)
    .sort((a, b) => a.order - b.order);
  return later[0] ?? null;
}

/** A step from any stage of the pathway, or null when there is no such step. */
export function findStep(
  detail: PathwayDetailDto,
  stepId: string | null,
): PathwayDetailStepDto | null {
  if (!stepId) return null;
  for (const stage of detail.stages) {
    const step = stage.steps.find((candidate) => candidate.id === stepId);
    if (step) return step;
  }
  return null;
}

/** What the first wrong answer was asked, or null when nothing was missed. */
export function firstMissedPrompt(breakdown: QuizBreakdownItemDto[]): string | null {
  return breakdown.find((item) => !item.isCorrect)?.prompt ?? null;
}
