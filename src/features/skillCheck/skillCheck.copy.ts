import type { RatingValue, SkillAnswer } from "./skillCheck.types";

export const ESTIMATED_MINUTES = 3;

export const HOW_IT_WORKS_STEPS = [
  "Mark the skills you have, from your pathway's skill list",
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
  DONT_HAVE: "Not yet",
  NOT_SURE: "Not sure",
};

export const RATING_VALUES: RatingValue[] = [1, 2, 3, 4, 5];

export const RATING_LABELS: Record<RatingValue, string> = {
  1: "I have seen it but cannot do it alone",
  2: "I can do simple tasks with help",
  3: "I can do common tasks on my own",
  4: "I can handle harder tasks and explain them",
  5: "I could teach it to someone else",
};

export function pluralise(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
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
