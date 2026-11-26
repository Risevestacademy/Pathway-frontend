import type {
  ChecklistItemResponseDto,
  TaskCompletionResponseDto,
} from "../../lib/api/pathways.api";
import type {
  PathwayTaskDetailDto,
  PathwayTaskItemDto,
  PathwayTasksDto,
} from "../../lib/api/pathwayTasks.api";

/** Changes one task in the tasks list, leaving every other task as it was. */
function updateTaskInList(
  data: PathwayTasksDto | undefined,
  taskId: string,
  update: (task: PathwayTaskItemDto) => PathwayTaskItemDto,
): PathwayTasksDto | undefined {
  if (!data) return data;
  return {
    ...data,
    stages: data.stages.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => ({
        ...step,
        tasks: step.tasks.map((task) => (task.id === taskId ? update(task) : task)),
      })),
    })),
  };
}

/** Folds a confirmed task save into the tasks list. */
export function applyCompletionToList(data: PathwayTasksDto, response: TaskCompletionResponseDto): PathwayTasksDto;
export function applyCompletionToList(
  data: PathwayTasksDto | undefined,
  response: TaskCompletionResponseDto,
): PathwayTasksDto | undefined;
export function applyCompletionToList(
  data: PathwayTasksDto | undefined,
  response: TaskCompletionResponseDto,
): PathwayTasksDto | undefined {
  return updateTaskInList(data, response.taskId, (task) => ({
    ...task,
    isCompleted: response.completed,
    completedAt: response.completedAt,
    checklistChecked: response.checklistChecked,
    checklistTotal: response.checklistTotal,
  }));
}

/** Folds a confirmed checklist save into the tasks list: only the task's counts change. */
export function applyChecklistToList(data: PathwayTasksDto, response: ChecklistItemResponseDto): PathwayTasksDto;
export function applyChecklistToList(
  data: PathwayTasksDto | undefined,
  response: ChecklistItemResponseDto,
): PathwayTasksDto | undefined;
export function applyChecklistToList(
  data: PathwayTasksDto | undefined,
  response: ChecklistItemResponseDto,
): PathwayTasksDto | undefined {
  return updateTaskInList(data, response.taskId, (task) => ({
    ...task,
    checklistChecked: response.checklistChecked,
    checklistTotal: response.checklistTotal,
  }));
}

/** Folds a confirmed task save into the task's own page. */
export function applyCompletionToDetail(data: PathwayTaskDetailDto, response: TaskCompletionResponseDto): PathwayTaskDetailDto;
export function applyCompletionToDetail(
  data: PathwayTaskDetailDto | undefined,
  response: TaskCompletionResponseDto,
): PathwayTaskDetailDto | undefined;
export function applyCompletionToDetail(
  data: PathwayTaskDetailDto | undefined,
  response: TaskCompletionResponseDto,
): PathwayTaskDetailDto | undefined {
  if (!data) return data;
  return {
    ...data,
    isCompleted: response.completed,
    completedAt: response.completedAt,
    checklistChecked: response.checklistChecked,
    checklistTotal: response.checklistTotal,
  };
}

/** Folds a confirmed checklist save into the task's own page. */
export function applyChecklistToDetail(data: PathwayTaskDetailDto, response: ChecklistItemResponseDto): PathwayTaskDetailDto;
export function applyChecklistToDetail(
  data: PathwayTaskDetailDto | undefined,
  response: ChecklistItemResponseDto,
): PathwayTaskDetailDto | undefined;
export function applyChecklistToDetail(
  data: PathwayTaskDetailDto | undefined,
  response: ChecklistItemResponseDto,
): PathwayTaskDetailDto | undefined {
  if (!data) return data;
  return {
    ...data,
    checklistChecked: response.checklistChecked,
    checklistTotal: response.checklistTotal,
    checklist: data.checklist.map((item) =>
      item.id === response.itemId
        ? { ...item, isChecked: response.checked, checkedAt: response.checkedAt }
        : item,
    ),
  };
}
