import {
  getOrNull,
  type PathwayCostStatus,
  type PathwayResourceType,
  type PathwayStageHeaderDto,
} from "./pathways.api";
import type { PathwayStepStatus } from "./progress.api";

/** A task as the list shows it, with the caller's completion and checklist counts. */
export interface PathwayTaskItemDto {
  id: string;
  title: string;
  goal: string;
  estimatedWeeks: number;
  isCompleted: boolean;
  completedAt: string | null;
  checklistChecked: number;
  checklistTotal: number;
}

export interface PathwayTasksStepDto {
  id: string;
  title: string;
  order: number;
  status: PathwayStepStatus;
  completedAt: string | null;
  tasks: PathwayTaskItemDto[];
}

export interface PathwayTasksStageDto extends PathwayStageHeaderDto {
  steps: PathwayTasksStepDto[];
}

export interface PathwayTasksDto {
  pathwayId: string;
  stages: PathwayTasksStageDto[];
}

/**
 * Every stage with its steps and their tasks, each with the caller's
 * completion and checklist counts (no hints or checklist items). Resolves to
 * null when the pathway isn't readable (404) or the id isn't a valid UUID (400).
 */
export function fetchPathwayTasks(
  pathwayId: string,
): Promise<PathwayTasksDto | null> {
  return getOrNull(`/pathways/${encodeURIComponent(pathwayId)}/tasks`);
}

export interface PathwayChecklistItemDto {
  id: string;
  text: string;
  isChecked: boolean;
  checkedAt: string | null;
}

export interface PathwayHelpfulLinkDto {
  id: string;
  title: string;
  provider: string;
  type: PathwayResourceType;
  costStatus: PathwayCostStatus;
  url: string;
}

export interface PathwayTaskDetailDto extends PathwayTaskItemDto {
  stepId: string;
  whatToMake: string[];
  hints: string[];
  checklist: PathwayChecklistItemDto[];
  /** The task's ACTIVE linked resources. */
  helpfulLinks: PathwayHelpfulLinkDto[];
}

/**
 * One task with what to make, hints, its checklist with the caller's ticks,
 * and its linked resources. Resolves to null when it isn't readable (404) or
 * an id isn't a valid UUID (400).
 */
export function fetchPathwayTask(
  pathwayId: string,
  taskId: string,
): Promise<PathwayTaskDetailDto | null> {
  return getOrNull(
    `/pathways/${encodeURIComponent(pathwayId)}/tasks/${encodeURIComponent(taskId)}`,
  );
}
