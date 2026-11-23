import type { ResourceGroup } from "./resourceGroups.utils";

/** One entry of the resources nav: a stage with its steps, or a single step when it has no stage. */
export interface ResourceSection {
  id: string;
  title: string;
  /** The stage this is, or null for a step shown on its own. */
  stageId: string | null;
  /** The steps it holds, in the pathway's order. */
  groups: ResourceGroup[];
}

/** A stage and the ids of the steps in it. */
export interface ResourceStageRef {
  id: string;
  title: string;
  stepIds: string[];
}

/**
 * The nav's entries. Each stage holds its steps, in the order given for the
 * stages; a stage none of whose steps are shown is left out. A step that is in
 * no stage, or every step when the stages aren't known, gets an entry of its own.
 */
export function buildResourceSections(
  groups: ResourceGroup[],
  stages: ResourceStageRef[],
): ResourceSection[] {
  const placed = new Set<string>();
  const sections: ResourceSection[] = [];

  for (const stage of stages) {
    const inStage = groups.filter((group) => stage.stepIds.includes(group.stepId));
    if (inStage.length === 0) continue;
    inStage.forEach((group) => placed.add(group.stepId));
    sections.push({ id: stage.id, title: stage.title, stageId: stage.id, groups: inStage });
  }

  for (const group of groups) {
    if (placed.has(group.stepId)) continue;
    sections.push({
      id: `step:${group.stepId}`,
      title: `Step ${group.number} · ${group.title}`,
      stageId: null,
      groups: [group],
    });
  }
  return sections;
}
