import type { SkillCheckCareer, SkillCheckStep } from "./skillCheck.types";

export interface RoadmapPreviewState {
  startOrder: number;
  nextStep: SkillCheckStep | null;
  earlierOpen: SkillCheckStep[];
  visibleSteps: SkillCheckStep[];
  completedCount: number;
}

export function getRoadmapPreviewState(
  career: SkillCheckCareer,
  startOrder: number,
  completed: number[],
): RoadmapPreviewState {
  const done = new Set(completed);
  const steps = [...career.steps].sort((a, b) => a.order - b.order);
  const earlierOpen = steps.filter((step) => step.order < startOrder && !done.has(step.order));
  const visibleSteps = steps.filter((step) => step.order >= startOrder || done.has(step.order));
  const nextStep =
    steps.find((step) => step.order >= startOrder && !done.has(step.order)) ??
    earlierOpen[0] ??
    null;
  return {
    startOrder,
    nextStep,
    earlierOpen,
    visibleSteps,
    completedCount: steps.filter((step) => done.has(step.order)).length,
  };
}
