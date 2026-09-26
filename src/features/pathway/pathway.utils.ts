import { mockCareers, mockRoadmaps } from "./pathway.mock";
import type {
  RoadmapCareer,
  RoadmapLookup,
  RoadmapStep,
  TimeEstimate,
} from "./pathway.types";

export function getRoadmap(
  careerId: string,
  careers: RoadmapCareer[] = mockCareers,
  roadmaps = mockRoadmaps,
): RoadmapLookup {
  const career = careers.find(
    (c) => c.id === careerId && c.status === "published",
  );
  if (!career) return null;

  const roadmap = roadmaps.find((r) => r.id === career.roadmapId) ?? null;
  return { career, roadmap };
}

export function describeEstimate(estimate: TimeEstimate | undefined) {
  const assumptions = estimate?.assumptions;
  if (!estimate || !assumptions) return null;

  const parts = [
    assumptions.priorKnowledge,
    assumptions.weeklyStudyHours
      ? `at ${assumptions.weeklyStudyHours} hrs/week`
      : undefined,
  ].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;

  return { hours: `≈${estimate.hours} hours`, assumptions: parts };
}

export function getStepContext(steps: RoadmapStep[], stepId: string) {
  const index = steps.findIndex((s) => s.stepId === stepId);
  if (index === -1) return null;

  const step = steps[index];
  const requiredIndex = step.requiredPrerequisiteStepId
    ? steps.findIndex((s) => s.stepId === step.requiredPrerequisiteStepId)
    : -1;

  return {
    step,
    number: index + 1,
    previous: steps[index - 1],
    next: steps[index + 1],
    required:
      requiredIndex === -1
        ? undefined
        : { step: steps[requiredIndex], number: requiredIndex + 1 },
  };
}
