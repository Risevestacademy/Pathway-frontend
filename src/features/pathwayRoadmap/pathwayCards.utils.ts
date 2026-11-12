import type { CareerPathwayDto, PathwayStepDto } from "../../lib/api/pathways.api";
import type { ActivePathwayDto, SavedPathwayDto } from "../../lib/api/progress.api";
import type { PathwayCardProps } from "./components/PathwayCard";

type PublicPathway = CareerPathwayDto["pathway"] | null | undefined;

const describe = (step: PathwayStepDto): string =>
  step.description.trim() || step.learningObjective;

/**
 * One card for each pathway the person has saved, the active one first.
 *
 * The active pathway says exactly which step is next. For the others the server
 * gives only how many steps are done, so the step they are at is the one after
 * those, by number. Descriptions come from the career's own roadmap.
 */
export function buildPathwayCards({
  saved,
  active,
  pathways,
}: {
  saved: SavedPathwayDto[];
  active: ActivePathwayDto | null | undefined;
  /** Each saved career's roadmap, by career id, once it has loaded. */
  pathways: Record<string, PublicPathway>;
}): PathwayCardProps[] {
  const ordered = [...saved].sort((a, b) => Number(b.isActive) - Number(a.isActive));

  return ordered.map(({ career, isActive, progress }) => {
    const roadmap = pathways[career.id];
    const steps = [...(roadmap?.steps ?? [])].sort((a, b) => a.order - b.order);

    let currentStep: PathwayCardProps["currentStep"] = null;
    if (isActive && active?.career?.id === career.id && active.progress) {
      const next = active.steps.find((step) => step.id === active.progress?.nextStepId);
      if (next) {
        const detail = steps.find((step) => step.id === next.id);
        currentStep = { title: next.title, description: detail ? describe(detail) : "" };
      }
    } else {
      const step = steps[progress.completed];
      if (step) currentStep = { title: step.title, description: describe(step) };
    }

    return { careerId: career.id, title: career.title, isActive, currentStep, xp: 0 };
  });
}
