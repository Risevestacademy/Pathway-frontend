import { api } from "./axios";

export type PathwayStepStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

/** The two statuses a learner can set by hand. */
export type StepCompletionStatus = Extract<
  PathwayStepStatus,
  "NOT_STARTED" | "COMPLETED"
>;

export interface ProgressCountsDto {
  completed: number;
  total: number;
  percentage: number;
}

export interface PathwayProgressDto extends ProgressCountsDto {
  /** Earliest incomplete step, at or after the starting point when one is set. */
  nextStepId: string | null;
  /** Always true: progress is self-reported, not verified. */
  selfReported: boolean;
  startStepId: string | null;
}

export interface ActivePathwayStepDto {
  id: string;
  order: number;
  title: string;
  skills: Array<{ id: string; name: string }>;
  status: PathwayStepStatus;
}

export interface ActivePathwayDto {
  career: {
    id: string;
    slug: string;
    title: string;
    roleSummary: string;
    retired: boolean;
  } | null;
  pathway: { id: string; title: string } | null;
  progress: PathwayProgressDto | null;
  steps: ActivePathwayStepDto[];
}

export interface SavedPathwayDto {
  career: { id: string; slug: string; title: string; retired: boolean };
  isActive: boolean;
  progress: ProgressCountsDto;
}

export interface StepStatusResponseDto {
  stepId: string;
  status: StepCompletionStatus;
  progress: PathwayProgressDto;
}

export async function fetchActivePathway(): Promise<ActivePathwayDto> {
  const { data } = await api.get<ActivePathwayDto>("/me/active-pathway");
  return data;
}

export async function fetchSavedPathways(): Promise<SavedPathwayDto[]> {
  const { data } = await api.get<SavedPathwayDto[]>("/me/pathways");
  return data;
}

/** Saves the career for this user and makes it their active pathway. */
export async function setActivePathway(
  careerId: string,
): Promise<ActivePathwayDto> {
  const { data } = await api.put<ActivePathwayDto>("/me/active-pathway", {
    careerId,
  });
  return data;
}

/**
 * Sets a step's status outright rather than toggling it, so retrying a failed
 * save can never count the same step twice.
 */
export async function setStepStatus(
  stepId: string,
  status: StepCompletionStatus,
): Promise<StepStatusResponseDto> {
  const { data } = await api.put<StepStatusResponseDto>(
    `/me/pathway-steps/${encodeURIComponent(stepId)}`,
    { status },
  );
  return data;
}
