import type {
  PathwayResourceDetailDto,
  PathwayResourcesDto,
} from "../../lib/api/pathwayResources.api";
import { resourceKindMap } from "../resources/resources.utils";
import type { Resource } from "../resources/resources.types";

export interface ResourceDetail {
  /** The earliest step that lists the resource, or null when no step does. */
  step: { id: string; /** Starting at 1. */ number: number; title: string } | null;
  resource: Resource;
  /** What the resource covers, or null when the backend has no description. */
  description: string | null;
  /** What it teaches, in the backend's words. */
  outcomes: string[];
  /** How the step uses it, or null when there's no step to say. */
  usageNote: string | null;
  /** When it was last checked, as the backend gave it. */
  lastChecked: string;
  estimatedWeeks: number;
  /** The first task in the step they haven't done, or null when there isn't one. */
  nextTask: { id: string; title: string; goal: string; estimatedWeeks: number } | null;
}

/**
 * The earliest step that lists the resource, numbered by its place in the whole
 * pathway (stage by stage). Null when no step lists it.
 */
export function findResourceStep(
  data: PathwayResourcesDto,
  resourceId: string,
): { id: string; number: number; title: string } | null {
  const steps = [...data.stages]
    .sort((a, b) => a.order - b.order)
    .flatMap((stage) => [...stage.steps].sort((a, b) => a.order - b.order));

  for (const [index, step] of steps.entries()) {
    if (step.resources.some((resource) => resource.id === resourceId)) {
      return { id: step.id, number: index + 1, title: step.title };
    }
  }
  return null;
}

/** The detail page's view of the backend's resource read, with the step it was opened under. */
export function buildResourceDetail(
  read: PathwayResourceDetailDto,
  step: ResourceDetail["step"],
): ResourceDetail {
  return {
    step,
    resource: {
      id: read.id,
      title: read.title,
      provider: read.provider,
      kind: resourceKindMap[read.type],
      url: read.url,
      costLabel:
        read.costStatus === "UNKNOWN" ? "Cost unknown" : `Course: ${read.costStatus.toLowerCase()}`,
    },
    description: read.description?.trim() || null,
    outcomes: read.outcomes,
    usageNote: read.usageNote?.trim() || null,
    lastChecked: read.lastCheckedDate,
    estimatedWeeks: read.estimatedWeeks,
    nextTask: read.nextTask ?? null,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-12" as "12 Sep 2026". The date is read as written, so the time zone can't shift it. */
export function formatCheckedDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month} ${match[1]}` : value;
}
