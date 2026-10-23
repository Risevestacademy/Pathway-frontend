import type {
  SkillAnswer,
  StartingPoint,
} from "./skillCheck.types";

export const ESTIMATED_MINUTES = 3;

export const HOW_IT_WORKS_STEPS = [
  "Mark the skills you have, from a reviewed list",
  "See your gaps, each linked to a step in your roadmap",
  "Get a suggested starting step.",
];

export const DIALOG_STEPS = [
  "Mark the skills as Have, Not yet or Not sure",
  "See your gaps, each linked to a roadmap step",
  "Get a suggested starting step.",
];

export const ANSWER_LABELS: Record<SkillAnswer, string> = {
  HAVE: "Have",
  NOT_YET: "Not yet",
  NOT_SURE: "Not sure",
};

export function pluralise(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function describeStartingPoint(startingPoint: StartingPoint): string {
  return startingPoint.source === "ACCEPTED"
    ? `Step ${startingPoint.stepOrder} · accepted`
    : `Step ${startingPoint.stepOrder} · from the beginning`;
}

export function formatCheckedDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
