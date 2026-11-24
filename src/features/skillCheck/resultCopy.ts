import type { SkillAssessment } from "./skillCheck.types";
import { capitalise } from "./skillCheck.copy";
import { formatStepRange, getEarlierSteps } from "./skillCheck.utils";

export const START_REASON =
  "This is the first step that teaches a skill you marked Not yet.";

export function earlierNote(assessment: SkillAssessment, stepOrder: number): string | null {
  const earlier = getEarlierSteps(assessment, stepOrder).map((step) => step.order);
  if (earlier.length === 0) return null;
  return `${capitalise(formatStepRange(earlier))} ${earlier.length === 1 ? "stays" : "stay"} open and marked incomplete. Nothing is marked done for you.`;
}
