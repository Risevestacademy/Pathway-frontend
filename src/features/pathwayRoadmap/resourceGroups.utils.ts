import type { CareerPathwayDto } from "../../lib/api/pathways.api";
import { mapPathwayResource } from "../resources/resources.utils";
import type { Resource } from "../resources/resources.types";

export interface ResourceGroup {
  stepId: string;
  /** The step's place in the pathway, starting at 1. */
  number: number;
  title: string;
  resources: Resource[];
}

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
              resources: step.resources.map(mapPathwayResource),
            },
          ],
    );
}
