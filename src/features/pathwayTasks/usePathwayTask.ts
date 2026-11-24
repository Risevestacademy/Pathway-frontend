import { useQuery } from "@tanstack/react-query";
import { fetchPathwayTask, type PathwayTaskDetailDto } from "../../lib/api/pathwayTasks.api";
import { queryKeys } from "../../lib/queryKeys";
import { useAuthStore } from "../../lib/stores/authStore";
import { usePathwayTasks } from "./usePathwayTasks";

export type PathwayTaskState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or its tasks can't be read. */
  | { kind: "unavailable" }
  /** The pathway loaded, but the backend has no such task in it. */
  | { kind: "not-found" }
  | {
      kind: "ready";
      pathwayId: string;
      careerTitle: string;
      /** The stage and step the task belongs to, or null when the list doesn't have them. */
      stage: { id: string; title: string } | null;
      step: { id: string; number: number; title: string } | null;
      task: PathwayTaskDetailDto;
    };

/** One practice task with its brief, and the stage and step it sits under. */
export function usePathwayTask(
  careerId: string,
  taskId: string,
): { state: PathwayTaskState; retry: () => void } {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  // The list says which stage and step the task is under, and gives the pathway's id.
  const { state: tasks, retry: retryTasks } = usePathwayTasks(careerId);
  const pathwayId = tasks.kind === "ready" ? tasks.pathwayId : null;

  const taskQuery = useQuery({
    queryKey: queryKeys.pathwayTask(userId, pathwayId ?? "", taskId),
    queryFn: () => fetchPathwayTask(pathwayId as string, taskId),
    enabled: pathwayId !== null && userId !== "",
  });

  const retry = () => {
    retryTasks();
    void taskQuery.refetch();
  };

  if (tasks.kind !== "ready") return { state: tasks, retry };
  if (taskQuery.isError) return { state: { kind: "error" }, retry };
  if (taskQuery.isPending) return { state: { kind: "loading" }, retry };
  if (!taskQuery.data) return { state: { kind: "not-found" }, retry };

  const task = taskQuery.data;
  const section = tasks.sections.find((candidate) =>
    candidate.steps.some((step) => step.id === task.stepId),
  );
  const step = section?.steps.find((candidate) => candidate.id === task.stepId);

  return {
    state: {
      kind: "ready",
      pathwayId: tasks.pathwayId,
      careerTitle: tasks.careerTitle,
      stage: section ? { id: section.id, title: section.title } : null,
      step: step ? { id: step.id, number: step.number, title: step.title } : null,
      task,
    },
    retry,
  };
}
