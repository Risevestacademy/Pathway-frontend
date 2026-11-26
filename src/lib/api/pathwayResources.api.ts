import {
  getOrNull,
  type PathwayCostStatus,
  type PathwayResourceType,
  type PathwayStageHeaderDto,
} from "./pathways.api";
import type { PathwayStepStatus } from "./progress.api";

/** A resource as the lists show it, with the caller's completion. */
export interface PathwayResourceItemDto {
  id: string;
  title: string;
  provider: string;
  type: PathwayResourceType;
  costStatus: PathwayCostStatus;
  estimatedWeeks: number;
  lastCheckedDate: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface PathwayResourcesStepDto {
  id: string;
  title: string;
  order: number;
  status: PathwayStepStatus;
  completedAt: string | null;
  /** Only the step's ACTIVE resources. */
  resources: PathwayResourceItemDto[];
}

export interface PathwayResourcesStageDto extends PathwayStageHeaderDto {
  steps: PathwayResourcesStepDto[];
}

export interface PathwayResourcesDto {
  pathwayId: string;
  stages: PathwayResourcesStageDto[];
  /** The career's PAID courses that no step uses. */
  optionalPaidCourses: PathwayResourceItemDto[];
}

/**
 * Every stage with its steps and their resources, each with the caller's
 * completion. Resolves to null when the pathway isn't readable (404) or the id
 * isn't a valid UUID (400).
 */
export function fetchPathwayResources(
  pathwayId: string,
): Promise<PathwayResourcesDto | null> {
  return getOrNull(`/pathways/${encodeURIComponent(pathwayId)}/resources`);
}

export interface PathwayResourceDetailDto extends PathwayResourceItemDto {
  description: string;
  outcomes: string[];
  url: string;
  /** Only with a stepId: how that step uses the resource. */
  usageNote?: string | null;
  /** Only with a stepId: the first task in that step the caller hasn't completed. */
  nextTask?: {
    id: string;
    title: string;
    goal: string;
    estimatedWeeks: number;
  } | null;
}

/**
 * One resource's description, outcomes and link, with the caller's completion.
 * Pass the step it was opened from to also get the step's usage note and next
 * task. Resolves to null when it isn't readable (404) or an id isn't a valid
 * UUID (400).
 */
export function fetchPathwayResource(
  pathwayId: string,
  resourceId: string,
  stepId?: string,
): Promise<PathwayResourceDetailDto | null> {
  return getOrNull(
    `/pathways/${encodeURIComponent(pathwayId)}/resources/${encodeURIComponent(resourceId)}`,
    stepId ? { stepId } : undefined,
  );
}
