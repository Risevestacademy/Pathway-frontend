import type { CareerPathwayDto } from "../../lib/api/pathways.api";
import { getStepStatus } from "../progress/progress.utils";
import type { CareerProgress } from "../progress/progress.types";
import type { UpNextCardProps } from "./components/UpNextCard";
import type { RoadmapStepRow } from "./components/YourRoadmapCard";

/** Everything the pathway overview shows, worked out from the pathway and the person's progress. */
export interface PathwayOverview {
  steps: RoadmapStepRow[];
  /** The step to do next, or null when there is none (no steps, or all done). */
  nextStepId: string | null;
  completed: number;
  total: number;
  /** Whether any step has been marked complete. */
  started: boolean;
  upNext: UpNextCardProps["step"] | null;
}

export function buildOverview(
  pathway: CareerPathwayDto["pathway"],
  progress: CareerProgress,
): PathwayOverview {
  const ordered = [...pathway.steps].sort((a, b) => a.order - b.order);

  // Step statuses only exist for the active pathway. For anything else every
  // step reads as not started, and a saved pathway still has its own counts.
  const statuses = progress.kind === "active" ? progress.statuses : {};
  const steps: RoadmapStepRow[] = ordered.map((step, index) => ({
    id: step.id,
    number: index + 1,
    title: step.title,
    description: step.description.trim() || step.learningObjective,
    status: getStepStatus(statuses, step.id),
  }));

  const completed =
    progress.kind === "active"
      ? progress.progress.completed
      : progress.kind === "inactive"
        ? progress.counts.completed
        : 0;
  const total =
    progress.kind === "active"
      ? progress.progress.total
      : progress.kind === "inactive"
        ? progress.counts.total
        : steps.length;

  // The server names the next step only for the active pathway. For a saved one
  // it is the step after those completed, by number; otherwise the first.
  const nextStepId =
    progress.kind === "active"
      ? progress.progress.nextStepId
      : (steps[progress.kind === "inactive" ? progress.counts.completed : 0]?.id ?? null);

  const nextIndex = ordered.findIndex((step) => step.id === nextStepId);
  const upNext =
    nextIndex === -1
      ? null
      : {
          id: ordered[nextIndex].id,
          number: nextIndex + 1,
          title: ordered[nextIndex].title,
          resourceCount: ordered[nextIndex].resources.length,
        };

  return { steps, nextStepId, completed, total, started: completed > 0, upNext };
}
