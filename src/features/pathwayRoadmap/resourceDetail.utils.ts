import type { CareerPathwayDto } from "../../lib/api/pathways.api";
import { mapPathwayResource } from "../resources/resources.utils";
import type { Resource } from "../resources/resources.types";

export interface ResourceDetail {
  step: { id: string; /** Starting at 1. */ number: number; title: string };
  resource: Resource;
  /** What the resource covers, or null when the backend has no description. */
  description: string | null;
  /** Why this resource was chosen. */
  curationRationale: string;
  /** The date it was last checked, as the backend gave it (YYYY-MM-DD). */
  lastChecked: string;
  skills: string[];
}

/** One resource of the pathway, with the step it sits under. Null when no step has it. */
export function findResourceDetail(
  pathway: CareerPathwayDto["pathway"],
  resourceId: string,
): ResourceDetail | null {
  const steps = [...pathway.steps].sort((a, b) => a.order - b.order);

  for (const [index, step] of steps.entries()) {
    const found = step.resources.find((resource) => resource.id === resourceId);
    if (!found) continue;

    return {
      step: { id: step.id, number: index + 1, title: step.title },
      resource: mapPathwayResource(found),
      description: found.description?.trim() || null,
      curationRationale: found.curationRationale,
      lastChecked: found.lastCheckedDate,
      skills: found.skills.map((skill) => skill.name),
    };
  }
  return null;
}
