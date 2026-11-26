import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setChecklistItem, setTaskCompletion } from "../../lib/api/pathways.api";
import type { PathwayTaskDetailDto, PathwayTasksDto } from "../../lib/api/pathwayTasks.api";
import { queryKeys } from "../../lib/queryKeys";
import { useAuthStore } from "../../lib/stores/authStore";
import {
  applyChecklistToDetail,
  applyChecklistToList,
  applyCompletionToDetail,
  applyCompletionToList,
} from "./taskCache.utils";

/**
 * Completes or reopens a task. The screens only change once the server confirms,
 * so a failed save never shows a task as done.
 */
export function useSetTaskCompletion(pathwayId: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      setTaskCompletion(pathwayId, taskId, completed),
    onSuccess: (response) => {
      queryClient.setQueryData<PathwayTasksDto>(queryKeys.pathwayTasks(userId, pathwayId), (data) =>
        applyCompletionToList(data, response),
      );
      queryClient.setQueryData<PathwayTaskDetailDto>(
        queryKeys.pathwayTask(userId, pathwayId, response.taskId),
        (data) => applyCompletionToDetail(data, response),
      );
    },
  });
}

/**
 * Checks or unchecks one item on a task's checklist. It awards no XP and never
 * completes the task, so only the checklist changes.
 */
export function useSetChecklistItem(pathwayId: string, taskId: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, checked }: { itemId: string; checked: boolean }) =>
      setChecklistItem(pathwayId, taskId, itemId, checked),
    onSuccess: (response) => {
      queryClient.setQueryData<PathwayTasksDto>(queryKeys.pathwayTasks(userId, pathwayId), (data) =>
        applyChecklistToList(data, response),
      );
      queryClient.setQueryData<PathwayTaskDetailDto>(
        queryKeys.pathwayTask(userId, pathwayId, taskId),
        (data) => applyChecklistToDetail(data, response),
      );
    },
  });
}
