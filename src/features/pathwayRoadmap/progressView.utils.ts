import type { CompletedStep, TickedResource } from "./components/CompletedCard";
import type { RoadmapStepRow } from "./components/YourRoadmapCard";
import type { ResourceGroup } from "./resourceGroups.utils";

/** The steps they marked complete, the latest step first. */
export function completedSteps(steps: RoadmapStepRow[]): CompletedStep[] {
  return steps
    .filter((step) => step.status === "COMPLETED")
    .map(({ id, number, title }) => ({ id, number, title }))
    .sort((a, b) => b.number - a.number);
}

/** The resources they ticked, in step order, each with its step. Paid resources have no tick. */
export function tickedResources(
  groups: ResourceGroup[],
  isTicked: (resourceId: string) => boolean,
): TickedResource[] {
  return groups.flatMap((group) =>
    group.resources
      .filter((resource) => isTicked(resource.id))
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        step: { number: group.number, title: group.title },
      })),
  );
}
