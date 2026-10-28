import type { SkillCheckCareer } from "./skillCheck.types";
import { capitalise } from "./skillCheck.copy";
import { formatNameList, formatStepRange, getEarlierSteps } from "./skillCheck.utils";

export function describeReason(
  names: string[],
  coveredStepOrders: number[],
  retake: boolean,
): string {
  if (names.length === 0) {
    return "Why: this is the first step linked to a skill you marked Not yet or Not sure.";
  }
  if (retake) {
    return `Why: you now marked ${formatNameList(names)} as Have.`;
  }
  return `Why: you marked ${formatNameList(names)} as Have, and ${formatStepRange(coveredStepOrders)} cover${coveredStepOrders.length === 1 ? "s" : ""} ${names.length === 1 ? "it" : "those"}.`;
}

export function earlierNote(career: SkillCheckCareer, stepOrder: number): string | null {
  const earlier = getEarlierSteps(career, stepOrder).map((step) => step.order);
  if (earlier.length === 0) return null;
  return `${capitalise(formatStepRange(earlier))} ${earlier.length === 1 ? "stays" : "stay"} open and marked incomplete. Nothing is marked done for you.`;
}
