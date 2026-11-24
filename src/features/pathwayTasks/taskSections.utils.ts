import type { PathwayTaskItemDto, PathwayTasksStageDto } from "../../lib/api/pathwayTasks.api";
import type { PathwayStepStatus } from "../../lib/api/progress.api";

export interface TaskStep {
  id: string;
  /** The step's place in the whole pathway, starting at 1. */
  number: number;
  title: string;
  status: PathwayStepStatus;
  tasks: PathwayTaskItemDto[];
}

/** One stage of the practice tasks: its steps that have tasks, and how many tasks are done. */
export interface TaskSection {
  id: string;
  title: string;
  done: number;
  total: number;
  steps: TaskStep[];
}

const byOrder = <T extends { order: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.order - b.order);

/**
 * The stages in order, each with its steps that have tasks. Steps are numbered by
 * their place in the whole pathway, counting the ones with no tasks. A stage with
 * no tasks is kept so it still shows in the nav.
 */
export function buildTaskSections(stages: PathwayTasksStageDto[]): TaskSection[] {
  let number = 0;

  return byOrder(stages).map((stage) => {
    const steps: TaskStep[] = [];
    for (const step of byOrder(stage.steps)) {
      number += 1;
      if (step.tasks.length === 0) continue;
      steps.push({ id: step.id, number, title: step.title, status: step.status, tasks: step.tasks });
    }

    const tasks = steps.flatMap((step) => step.tasks);
    return {
      id: stage.id,
      title: stage.title,
      done: tasks.filter((task) => task.isCompleted).length,
      total: tasks.length,
      steps,
    };
  });
}

/** Every step in the pathway, with or without tasks. */
export function countSteps(stages: PathwayTasksStageDto[]): number {
  return stages.reduce((count, stage) => count + stage.steps.length, 0);
}
