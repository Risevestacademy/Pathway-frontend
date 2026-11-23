import { isAxiosError } from "axios";
import { api } from "./axios";
import type {
  PathwayProgressDto,
  PathwayStepStatus,
  ProgressCountsDto,
  StepCompletionStatus,
} from "./progress.api";

export type PathwayResourceType =
  | "COURSE"
  | "CERTIFICATION"
  | "ARTICLE"
  | "VIDEO"
  | "BOOK";
export type PathwayCostStatus = "FREE" | "PAID" | "UNKNOWN";

export interface PathwayResourceDto {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: PathwayResourceType;
  provider: string;
  costStatus: PathwayCostStatus;
  certificationCost: string | null;
  curationRationale: string;
  lastCheckedDate: string;
  skills: Array<{ id: string; name: string }>;
}

export interface PathwayStepDto {
  id: string;
  title: string;
  description: string;
  learningObjective: string;
  prerequisites: string | null;
  expectedActivity: string;
  order: number;
  skills: Array<{ id: string; name: string }>;
  resources: PathwayResourceDto[];
}

export interface CareerPathwayDto {
  pathway: {
    id: string;
    careerId: string;
    title: string;
    description: string;
    steps: PathwayStepDto[];
  };
}

export async function fetchCareerPathway(
  careerId: string,
): Promise<CareerPathwayDto> {
  const { data } = await api.get<CareerPathwayDto>(
    `/careers/${encodeURIComponent(careerId)}/pathway`,
  );
  return data;
}

/**
 * Like fetchCareerPathway, but resolves to null when the career or its
 * pathway doesn't exist (404) or the id isn't a valid UUID (400), so pages
 * can show a "not available" state. Other failures still throw.
 */
export async function fetchPathwayOrNull(
  careerId: string,
): Promise<CareerPathwayDto["pathway"] | null> {
  try {
    const { pathway } = await fetchCareerPathway(careerId);
    return pathway;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 404 || status === 400) return null;
    throw error;
  }
}

/** A resource as the pathway read lists it, under the next and start steps only. */
export interface PathwayDetailResourceDto {
  id: string;
  title: string;
  url: string;
  type: PathwayResourceType;
  costStatus: PathwayCostStatus;
  estimatedWeeks: number;
  provider: string;
}

export interface PathwayDetailTaskDto {
  id: string;
  title: string;
  goal: string;
  estimatedWeeks: number;
  whatToMake: string[];
  hints: string[];
  checklist: string[];
}

export interface PathwayDetailStepDto {
  id: string;
  title: string;
  order: number;
  status: PathwayStepStatus;
  description: string;
  skills: string[];
  expectedActivity: string;
  careerReadiness: string;
  /** Only filled in for the next step and the start step. */
  resources: PathwayDetailResourceDto[];
  /** Only filled in for the next step and the start step. */
  tasks: PathwayDetailTaskDto[];
}

/** What every pathway read says about a stage: its self-reported progress and quiz status. */
export interface PathwayStageHeaderDto {
  id: string;
  title: string;
  order: number;
  progress: ProgressCountsDto;
  quiz: { status: string };
}

export interface PathwayDetailStageDto extends PathwayStageHeaderDto {
  description: string;
  steps: PathwayDetailStepDto[];
}

export interface PathwayDetailDto {
  id: string;
  career: {
    id: string;
    title: string;
    description: string;
    retired: boolean;
    stageCount: number;
    stepCount: number;
    resourceCount: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
    nextStepId: string | null;
    selfReported: boolean;
  };
  stages: PathwayDetailStageDto[];
}

/**
 * A GET that resolves to null when the pathway isn't readable (404) or an id
 * isn't a valid UUID (400), so pages can show a "not available" state. Other
 * failures still throw.
 */
export async function getOrNull<T>(
  url: string,
  params?: Record<string, string>,
): Promise<T | null> {
  try {
    const { data } = await api.get<T>(url, { params });
    return data;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 404 || status === 400) return null;
    throw error;
  }
}

/**
 * The pathway by its own id: career header, every stage with its steps, and
 * progress. Resolves to null when it isn't found or its career is a draft
 * (404), or the id isn't a valid UUID (400). Other failures still throw.
 */
export function fetchPathwayById(
  pathwayId: string,
): Promise<PathwayDetailDto | null> {
  return getOrNull(`/pathways/${encodeURIComponent(pathwayId)}`);
}

/** The server refused a save because the user hasn't saved this pathway's career (409). */
export class CareerNotSavedError extends Error {
  constructor() {
    super("The user hasn't saved this pathway's career");
    this.name = "CareerNotSavedError";
  }
}

export interface StepCompletionResponseDto {
  stepId: string;
  status: StepCompletionStatus;
  completedAt: string | null;
  progress: Omit<PathwayProgressDto, "startStepId">;
  stageProgress: ProgressCountsDto & { stageId: string };
  nextStepId: string | null;
  /** XP this save awarded. Only the first completion of a step awards any. */
  xpAwarded: number;
}

/** Rethrows a save's failure, as a CareerNotSavedError when the server answered 409. */
export function rethrowCareerNotSaved(error: unknown): never {
  if (isAxiosError(error) && error.response?.status === 409) {
    throw new CareerNotSavedError();
  }
  throw error;
}

/**
 * Every save is a PUT that sets the state outright rather than toggling it, so
 * retrying one can never count the same item twice. A 409 means the user
 * hasn't saved the pathway's career, which no retry can fix, so it gets its
 * own error.
 */
async function putState<T>(url: string, body: { completed: boolean } | { checked: boolean }): Promise<T> {
  try {
    const { data } = await api.put<T>(url, body);
    return data;
  } catch (error) {
    return rethrowCareerNotSaved(error);
  }
}

/**
 * Sets a step's completion outright rather than toggling it. Completing
 * awards the step's XP once; undoing keeps the XP.
 */
export function setStepCompletion(
  pathwayId: string,
  stepId: string,
  completed: boolean,
): Promise<StepCompletionResponseDto> {
  return putState(
    `/pathways/${encodeURIComponent(pathwayId)}/steps/${encodeURIComponent(stepId)}/completion`,
    { completed },
  );
}

export interface ResourceCompletionResponseDto {
  resourceId: string;
  completed: boolean;
  completedAt: string | null;
  /** XP this save awarded. Only the first completion awards any. */
  xpAwarded: number;
}

/**
 * Ticks or unticks a resource. Completion is per user and shared across every
 * step the resource appears in. It awards the resource's XP once and never
 * completes a step.
 */
export function setResourceCompletion(
  pathwayId: string,
  resourceId: string,
  completed: boolean,
): Promise<ResourceCompletionResponseDto> {
  return putState(
    `/pathways/${encodeURIComponent(pathwayId)}/resources/${encodeURIComponent(resourceId)}/completion`,
    { completed },
  );
}

export interface TaskCompletionResponseDto {
  taskId: string;
  completed: boolean;
  completedAt: string | null;
  /** XP this save awarded. Only the first completion awards any. */
  xpAwarded: number;
  checklistChecked: number;
  checklistTotal: number;
}

/** Completes or reopens a task. It awards the task's XP once and never completes a step. */
export function setTaskCompletion(
  pathwayId: string,
  taskId: string,
  completed: boolean,
): Promise<TaskCompletionResponseDto> {
  return putState(
    `/pathways/${encodeURIComponent(pathwayId)}/tasks/${encodeURIComponent(taskId)}/completion`,
    { completed },
  );
}

export interface ChecklistItemResponseDto {
  itemId: string;
  taskId: string;
  checked: boolean;
  checkedAt: string | null;
  checklistChecked: number;
  checklistTotal: number;
}

/**
 * Checks or unchecks one item on a task's checklist. It awards no XP and never
 * completes the task.
 */
export function setChecklistItem(
  pathwayId: string,
  taskId: string,
  itemId: string,
  checked: boolean,
): Promise<ChecklistItemResponseDto> {
  return putState(
    `/pathways/${encodeURIComponent(pathwayId)}/tasks/${encodeURIComponent(taskId)}/checklist/${encodeURIComponent(itemId)}`,
    { checked },
  );
}
