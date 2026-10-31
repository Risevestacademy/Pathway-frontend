import type {
  ActivePathwayDto,
  PathwayStepStatus,
  SavedPathwayDto,
  StepStatusResponseDto,
} from "../../lib/api/progress.api";
import type { CareerProgress } from "./progress.types";

export function getCareerProgress(
  careerId: string,
  active: ActivePathwayDto,
  saved: SavedPathwayDto[],
): CareerProgress {
  const activeCareerTitle = active.career?.title ?? null;

  if (active.career?.id === careerId && active.progress) {
    return {
      kind: "active",
      progress: active.progress,
      statuses: Object.fromEntries(
        active.steps.map((step) => [step.id, step.status]),
      ),
    };
  }

  const savedPathway = saved.find((item) => item.career.id === careerId);
  if (savedPathway) {
    return {
      kind: "inactive",
      counts: savedPathway.progress,
      activeCareerTitle,
    };
  }

  return { kind: "untracked", activeCareerTitle };
}

/** Steps with no saved status read as not started, matching the API. */
export function getStepStatus(
  statuses: Record<string, PathwayStepStatus>,
  stepId: string,
): PathwayStepStatus {
  return statuses[stepId] ?? "NOT_STARTED";
}

/** Folds a confirmed save into the cached active pathway. */
export function applyStepStatus(
  active: ActivePathwayDto,
  response: StepStatusResponseDto,
): ActivePathwayDto {
  if (!active.steps.some((step) => step.id === response.stepId)) {
    return active;
  }

  return {
    ...active,
    progress: response.progress,
    steps: active.steps.map((step) =>
      step.id === response.stepId ? { ...step, status: response.status } : step,
    ),
  };
}

export function describeProgress(completed: number, total: number): string {
  return `${completed} of ${total} step${total === 1 ? "" : "s"} complete`;
}
