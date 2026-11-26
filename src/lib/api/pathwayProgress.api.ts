import { getOrNull, type PathwayStageHeaderDto } from "./pathways.api";

/** The stage a step belongs to, as the progress read names it. */
export interface PathwayProgressStageRefDto {
  id: string;
  title: string;
  order: number;
}

export interface PathwayCompletedStepDto {
  id: string;
  title: string;
  order: number;
  stage: PathwayProgressStageRefDto;
  completedAt: string;
}

export interface PathwayNextStepDto {
  id: string;
  title: string;
  order: number;
  stage: PathwayProgressStageRefDto;
}

export interface PathwayProgressReadDto {
  pathwayId: string;
  /** Self-reported overall progress. All zero for a pathway the caller hasn't saved. */
  progress: {
    completed: number;
    total: number;
    percentage: number;
    selfReported: boolean;
  };
  /** Each stage's progress and quiz status (best score). */
  stages: PathwayStageHeaderDto[];
  /** Newest first. */
  completedSteps: PathwayCompletedStepDto[];
  /** Null once every step is complete. */
  nextStep: PathwayNextStepDto | null;
}

/**
 * The caller's self-reported progress on a pathway: overall counts, every
 * stage, the completed steps and the next step. Resolves to null when the
 * pathway isn't readable (404) or the id isn't a valid UUID (400).
 */
export function fetchPathwayProgress(
  pathwayId: string,
): Promise<PathwayProgressReadDto | null> {
  return getOrNull(`/pathways/${encodeURIComponent(pathwayId)}/progress`);
}
