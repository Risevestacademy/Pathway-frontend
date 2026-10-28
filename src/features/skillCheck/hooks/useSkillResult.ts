import { getSkillCheckResult } from "../skillCheck.utils";
import type {
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
} from "../skillCheck.types";

/** Works out the result and where the learner is in the decision flow. */
export function useSkillResult(
  career: SkillCheckCareer,
  record: SkillCheckRecord,
  careers: SkillCheckCareerSummary[],
) {
  const result = getSkillCheckResult(career, record.answers, record.previousAnswers);
  const { suggestion } = result;
  const active = careers.find((item) => item.isActive) ?? null;
  const isActive = active?.careerId === career.careerId;
  const otherActive = active && !isActive ? active : null;
  const isRetakeChange = record.startingPoint !== null && record.needsDecision;
  const isFirstDecision = record.startingPoint === null;
  const decisionOpen = isRetakeChange || (isFirstDecision && suggestion !== null);

  const eyebrow = isRetakeChange
    ? `${career.name} · Retake`
    : otherActive
      ? `${career.name} · Not in your pathway`
      : career.name;

  return {
    result,
    suggestion,
    isActive,
    otherActive,
    isRetakeChange,
    decisionOpen,
    eyebrow,
  };
}
