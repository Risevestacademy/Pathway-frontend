import type { CareerPathwayDto, PathwayResourceDto } from "../../lib/api/pathways.api";
import { mapPathwayResource } from "../resources/resources.utils";
import type { Resource } from "../resources/resources.types";

/** A resource as a row shows it: its details, what it covers, and when it was last checked (YYYY-MM-DD). */
export type GroupedResource = Resource & {
  description: string | null;
  lastChecked: string;
};

export interface ResourceGroup {
  stepId: string;
  /** The step's place in the pathway, starting at 1. */
  number: number;
  title: string;
  /** The step's resources that cost nothing, or whose cost isn't known. These are the ones to tick. */
  resources: GroupedResource[];
  /** The step's paid resources: extra, and never needed to finish the step. */
  paid: GroupedResource[];
}

const toGrouped = (resource: PathwayResourceDto): GroupedResource => ({
  ...mapPathwayResource(resource),
  description: resource.description?.trim() || null,
  lastChecked: resource.lastCheckedDate,
});

/** The pathway's resources, grouped under the step each belongs to. Steps with none are left out. */
export function buildResourceGroups(pathway: CareerPathwayDto["pathway"]): ResourceGroup[] {
  return [...pathway.steps]
    .sort((a, b) => a.order - b.order)
    .flatMap((step, index) =>
      step.resources.length === 0
        ? []
        : [
            {
              stepId: step.id,
              number: index + 1,
              title: step.title,
              resources: step.resources.filter((r) => r.costStatus !== "PAID").map(toGrouped),
              paid: step.resources.filter((r) => r.costStatus === "PAID").map(toGrouped),
            },
          ],
    );
}
