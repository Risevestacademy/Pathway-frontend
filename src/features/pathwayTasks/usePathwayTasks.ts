import { useQuery } from "@tanstack/react-query";
import { fetchPathwayTasks } from "../../lib/api/pathwayTasks.api";
import { queryKeys } from "../../lib/queryKeys";
import { useAuthStore } from "../../lib/stores/authStore";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { buildTaskSections, countSteps, type TaskSection } from "./taskSections.utils";

export type PathwayTasksState =
  | { kind: "loading" }
  | { kind: "error" }
  /** The career has no roadmap yet, or its tasks can't be read. */
  | { kind: "unavailable" }
  | {
      kind: "ready";
      careerTitle: string;
      stepCount: number;
      sections: TaskSection[];
    };

/** A career's practice tasks, by stage, with the person's progress on each. */
export function usePathwayTasks(careerId: string): {
  state: PathwayTasksState;
  retry: () => void;
} {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const { data: roadmap, retry: retryRoadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const tasksQuery = useQuery({
    queryKey: queryKeys.pathwayTasks(userId, pathwayId ?? ""),
    queryFn: () => fetchPathwayTasks(pathwayId as string),
    enabled: pathwayId !== null && userId !== "",
  });

  const retry = () => {
    retryRoadmap();
    void tasksQuery.refetch();
  };

  if (roadmap.kind === "error" || tasksQuery.isError) return { state: { kind: "error" }, retry };
  if (roadmap.kind === "unavailable") return { state: { kind: "unavailable" }, retry };
  if (roadmap.kind === "loading" || tasksQuery.isPending) return { state: { kind: "loading" }, retry };
  if (!tasksQuery.data) return { state: { kind: "unavailable" }, retry };

  return {
    state: {
      kind: "ready",
      careerTitle: roadmap.careerTitle,
      stepCount: countSteps(tasksQuery.data.stages),
      sections: buildTaskSections(tasksQuery.data.stages),
    },
    retry,
  };
}
