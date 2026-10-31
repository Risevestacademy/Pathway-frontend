/** Request and response shapes for PUT /me/pathway-steps/{stepId}. */

/** COMPLETED marks a step done; NOT_STARTED clears it. */
export type StepStatus = "COMPLETED" | "NOT_STARTED";

/** How far the signed-in person is through one pathway. */
export interface PathwayProgress {
  completed: number;
  total: number;
  percentage: number;
  /** The step to do next, or null when there isn't one. */
  nextStepId: string | null;
  /** Always true: progress is what the person says they've done, not verified. */
  selfReported: boolean;
  /** The step they chose to start from, or null. */
  startStepId: string | null;
}

export interface StepStatusResult {
  stepId: string;
  status: StepStatus;
  /** The updated progress for the step's pathway. */
  progress: PathwayProgress;
}

/** One pathway the signed-in person has saved, from GET /me/pathways. */
export interface SavedPathway {
  career: {
    id: string;
    slug: string;
    title: string;
    /** The career was retired after they saved it. They keep their pathway, but it won't change. */
    retired: boolean;
  };
  /** The pathway the dashboard follows. At most one is active. */
  isActive: boolean;
  progress: Pick<PathwayProgress, "completed" | "total" | "percentage">;
}

/** The pathway the person is following, if they have chosen one. */
export const activeSavedPathway = (pathways: SavedPathway[]): SavedPathway | undefined =>
  pathways.find((pathway) => pathway.isActive);

/** Steps done across every saved pathway, e.g. for a "Topics completed" total. */
export const totalCompletedSteps = (pathways: SavedPathway[]): number =>
  pathways.reduce((total, pathway) => total + pathway.progress.completed, 0);

/** A step's state in a pathway. The step-status call only sets COMPLETED or NOT_STARTED. */
export type StepProgress = StepStatus | "IN_PROGRESS";

export interface ActivePathwayStep {
  id: string;
  order: number;
  title: string;
  skills: { id: string; name: string }[];
  status: StepProgress;
}

/**
 * The pathway the signed-in person is following, with its steps and their
 * state. Setting one always fills these in; reading it when nothing is active
 * leaves career, pathway and progress null and steps empty.
 */
export interface ActivePathway {
  career: {
    id: string;
    slug: string;
    title: string;
    roleSummary: string;
    retired: boolean;
  } | null;
  pathway: { id: string; title: string } | null;
  progress: PathwayProgress | null;
  steps: ActivePathwayStep[];
}

/** The result of choosing where to start in a saved pathway. */
export interface StartingPointResult {
  careerId: string;
  /** The step they start from, or null once the starting point is cleared. */
  startStepId: string | null;
  /** The updated progress for the saved pathway. */
  progress: PathwayProgress;
}

/** The step to do next, from `progress.nextStepId`. */
export function nextActiveStep(active: ActivePathway): ActivePathwayStep | undefined {
  const id = active.progress?.nextStepId;
  return id ? active.steps.find((step) => step.id === id) : undefined;
}
