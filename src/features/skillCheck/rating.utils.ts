import { RATING_SCALE_VERSION } from "./skillCheck.mock";
import type {
  RatingTrend,
  RatingValue,
  SkillRating,
} from "./skillCheck.types";

export function isNumericRating(
  rating: SkillRating,
): rating is SkillRating & { value: RatingValue } {
  return rating.value !== "NOT_SURE";
}

export function getRatingsForSkill(
  ratings: SkillRating[],
  careerId: string,
  skillId: string,
): SkillRating[] {
  return ratings
    .filter(
      (rating) => rating.careerId === careerId && rating.skillId === skillId,
    )
    .sort((a, b) => a.ratedAt.localeCompare(b.ratedAt));
}

export function getRatingTrend(ratings: SkillRating[]): RatingTrend {
  if (ratings.length === 0) return { kind: "none" };

  const numeric = ratings.filter(isNumericRating);
  if (numeric.length === 0) return { kind: "not-enough" };

  const latest = numeric[numeric.length - 1];
  const earlierOnSameScale = numeric
    .slice(0, -1)
    .filter((rating) => rating.scaleVersion === latest.scaleVersion);

  if (earlierOnSameScale.length === 0) {
    return { kind: "baseline", value: latest.value };
  }

  const previous = earlierOnSameScale[earlierOnSameScale.length - 1];
  return {
    kind: "change",
    from: previous.value,
    to: latest.value,
    delta: latest.value - previous.value,
  };
}

export function createRating(
  careerId: string,
  skillId: string,
  value: RatingValue | "NOT_SURE",
  now: Date = new Date(),
): SkillRating {
  return {
    careerId,
    skillId,
    value,
    scaleVersion: RATING_SCALE_VERSION,
    ratedAt: now.toISOString(),
  };
}
