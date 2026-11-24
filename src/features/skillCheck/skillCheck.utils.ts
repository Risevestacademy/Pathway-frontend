import type { AssessmentSkillInput } from "../../lib/api/skills.api";
import type {
  SkillAnswer,
  SkillAnswerMap,
  SkillAssessment,
  SkillCheckArea,
  SkillCheckResult,
  SkillCheckSkill,
  SkillCheckStep,
  SkillCounts,
  SkillGap,
} from "./skillCheck.types";

export interface AreaGroup {
  area: SkillCheckArea;
  skills: SkillCheckSkill[];
}

export interface AreaProgress {
  answered: number;
  total: number;
}

export function groupSkillsByArea(assessment: SkillAssessment): AreaGroup[] {
  return assessment.areas
    .map((area) => ({
      area,
      skills: assessment.skills.filter((skill) => skill.areaId === area.id),
    }))
    .filter((group) => group.skills.length > 0);
}

export function getAreaProgress(
  skills: SkillCheckSkill[],
  answers: SkillAnswerMap,
): AreaProgress {
  return {
    answered: skills.filter((skill) => answers[skill.id] !== undefined).length,
    total: skills.length,
  };
}

export function countAnswered(
  skills: SkillCheckSkill[],
  answers: SkillAnswerMap,
): number {
  return getAreaProgress(skills, answers).answered;
}

export function isCheckComplete(
  skills: SkillCheckSkill[],
  answers: SkillAnswerMap,
): boolean {
  return skills.length > 0 && countAnswered(skills, answers) === skills.length;
}

export function countAnswers(
  skills: SkillCheckSkill[],
  answers: SkillAnswerMap,
): SkillCounts {
  const counts: SkillCounts = { have: 0, dontHave: 0, notSure: 0, unanswered: 0 };
  for (const skill of skills) {
    const answer: SkillAnswer | undefined = answers[skill.id];
    if (answer === "HAVE") counts.have += 1;
    else if (answer === "DONT_HAVE") counts.dontHave += 1;
    else if (answer === "NOT_SURE") counts.notSure += 1;
    else counts.unanswered += 1;
  }
  return counts;
}

export function getStep(
  assessment: SkillAssessment,
  order: number,
): SkillCheckStep | undefined {
  return assessment.steps.find((step) => step.order === order);
}

/** The step the server chose: the first one that teaches a skill marked Not yet. */
export function getStartStep(assessment: SkillAssessment): SkillCheckStep | null {
  if (!assessment.startStepId) return null;
  return assessment.steps.find((step) => step.id === assessment.startStepId) ?? null;
}

export function buildGaps(
  assessment: SkillAssessment,
  answers: SkillAnswerMap,
): SkillGap[] {
  const gaps: SkillGap[] = [];
  for (const skill of assessment.skills) {
    const answer = answers[skill.id];
    if (answer !== "DONT_HAVE" && answer !== "NOT_SURE") continue;
    const step = skill.stepOrder === null ? undefined : getStep(assessment, skill.stepOrder);
    if (!step) continue;
    gaps.push({ skill, answer, step });
  }
  return gaps
    .map((gap, index) => ({ gap, index }))
    .sort((a, b) => a.gap.step.order - b.gap.step.order || a.index - b.index)
    .map(({ gap }) => gap);
}

export function getSkillCheckResult(assessment: SkillAssessment): SkillCheckResult {
  return {
    counts: countAnswers(assessment.skills, assessment.saved),
    gaps: buildGaps(assessment, assessment.saved),
    startStep: getStartStep(assessment),
  };
}

/** Skills marked Have, in roadmap order, for rating. */
export function getHaveSkills(assessment: SkillAssessment): SkillCheckSkill[] {
  return assessment.skills
    .filter((skill) => assessment.saved[skill.id] === "HAVE")
    .map((skill, index) => ({ skill, index }))
    .sort(
      (a, b) =>
        (a.skill.stepOrder ?? Infinity) - (b.skill.stepOrder ?? Infinity) || a.index - b.index,
    )
    .map(({ skill }) => skill);
}

/**
 * The answers as the server takes them. A skill still marked Have keeps its
 * saved rating, since leaving the rating out would clear it.
 */
export function toAssessmentInput(
  skills: SkillCheckSkill[],
  answers: SkillAnswerMap,
  ratings: Record<string, number>,
): AssessmentSkillInput[] {
  return skills.flatMap((skill) => {
    const status = answers[skill.id];
    if (!status) return [];
    const rating = status === "HAVE" ? ratings[skill.id] : undefined;
    return [rating === undefined ? { skillId: skill.id, status } : { skillId: skill.id, status, rating }];
  });
}

/** Where the questionnaire opens: the draft on this device, else the saved answers. */
export function getInitialAnswers(
  assessment: SkillAssessment,
  draft: SkillAnswerMap | null,
): SkillAnswerMap {
  const source = draft ?? assessment.saved;
  const known = new Set(assessment.skills.map((skill) => skill.id));
  return Object.fromEntries(Object.entries(source).filter(([skillId]) => known.has(skillId)));
}

export function getEarlierSteps(
  assessment: SkillAssessment,
  startOrder: number,
): SkillCheckStep[] {
  return assessment.steps.filter((step) => step.order < startOrder);
}

export function getResumeAreaId(
  assessment: SkillAssessment,
  answers: SkillAnswerMap,
): string | null {
  const groups = groupSkillsByArea(assessment);
  const firstOpen = groups.find((group) =>
    group.skills.some((skill) => answers[skill.id] === undefined),
  );
  return (firstOpen ?? groups[groups.length - 1])?.area.id ?? null;
}

export function formatStepRange(orders: number[]): string {
  const sorted = [...orders].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return `step ${sorted[0]}`;
  const isRun = sorted.every((order, i) => i === 0 || order === sorted[i - 1] + 1);
  if (isRun && sorted.length > 2) {
    return `steps ${sorted[0]} to ${sorted[sorted.length - 1]}`;
  }
  const head = sorted.slice(0, -1).join(", ");
  return `steps ${head} and ${sorted[sorted.length - 1]}`;
}

export function formatNameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
