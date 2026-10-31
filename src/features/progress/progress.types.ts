import type {
  ActivePathwayDto,
  ActivePathwayStepDto,
  PathwayProgressDto,
  PathwayStepStatus,
  ProgressCountsDto,
  SavedPathwayDto,
  StartingPointResponseDto,
  StepCompletionStatus,
  StepStatusResponseDto,
} from "../../lib/api/progress.api";

/**
 * Where the signed-in user stands on one career's roadmap. Step statuses only
 * exist for the active pathway, because that's the only one the API returns
 * them for.
 */
export type CareerProgress =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  /** Not saved yet. activeCareerTitle is the pathway it would replace. */
  | { kind: "untracked"; activeCareerTitle: string | null }
  /** Saved earlier, but another pathway is active now. */
  | {
      kind: "inactive";
      counts: ProgressCountsDto;
      activeCareerTitle: string | null;
    }
  | {
      kind: "active";
      progress: PathwayProgressDto;
      statuses: Record<string, PathwayStepStatus>;
    };

// The API's own types, under the names the dashboard and My Pathway use.
/** COMPLETED marks a step done; NOT_STARTED clears it. */
export type StepStatus = StepCompletionStatus;
/** A step's state in a pathway. The step-status call only sets COMPLETED or NOT_STARTED. */
export type StepProgress = PathwayStepStatus;
/** How far the signed-in person is through one pathway. */
export type PathwayProgress = PathwayProgressDto;
export type ActivePathwayStep = ActivePathwayStepDto;
/**
 * The pathway the signed-in person is following, with its steps and their
 * state. When nothing is active, career, pathway and progress are null and
 * steps is empty.
 */
export type ActivePathway = ActivePathwayDto;
/** One pathway the signed-in person has saved. */
export type SavedPathway = SavedPathwayDto;
export type StepStatusResult = StepStatusResponseDto;
/** The result of choosing where to start in a saved pathway. */
export type StartingPointResult = StartingPointResponseDto;

/** The pathway the person is following, if they have chosen one. */
export const activeSavedPathway = (pathways: SavedPathway[]): SavedPathway | undefined =>
  pathways.find((pathway) => pathway.isActive);

/** Steps done across every saved pathway, e.g. for a "Topics completed" total. */
export const totalCompletedSteps = (pathways: SavedPathway[]): number =>
  pathways.reduce((total, pathway) => total + pathway.progress.completed, 0);

/** The step to do next, from `progress.nextStepId`. */
export function nextActiveStep(active: ActivePathway): ActivePathwayStep | undefined {
  const id = active.progress?.nextStepId;
  return id ? active.steps.find((step) => step.id === id) : undefined;
}
