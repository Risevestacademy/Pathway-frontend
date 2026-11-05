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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-12" as "12 Sep 2026". The date is read as written, so the time zone can't shift it. */
export function formatCheckedDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month} ${match[1]}` : value;
}
