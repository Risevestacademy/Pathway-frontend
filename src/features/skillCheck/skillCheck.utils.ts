import type {
  SkillAnswer,
  SkillAnswerMap,
  SkillCheckArea,
  SkillCheckCareer,
  SkillCheckResult,
  SkillCheckSkill,
  SkillCheckStep,
  SkillCounts,
  SkillGap,
  StartSuggestion,
  StartingPoint,
} from "./skillCheck.types";

export interface AreaGroup {
  area: SkillCheckArea;
  skills: SkillCheckSkill[];
}

export interface AreaProgress {
  answered: number;
  total: number;
}

export function groupSkillsByArea(career: SkillCheckCareer): AreaGroup[] {
  return career.areas
    .map((area) => ({
      area,
      skills: career.skills.filter((skill) => skill.areaId === area.id),
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
  const counts: SkillCounts = { have: 0, notYet: 0, notSure: 0, unanswered: 0 };
  for (const skill of skills) {
    const answer: SkillAnswer | undefined = answers[skill.id];
    if (answer === "HAVE") counts.have += 1;
    else if (answer === "NOT_YET") counts.notYet += 1;
    else if (answer === "NOT_SURE") counts.notSure += 1;
    else counts.unanswered += 1;
  }
  return counts;
}

export function getStep(
  career: SkillCheckCareer,
  order: number,
): SkillCheckStep | undefined {
  return career.steps.find((step) => step.order === order);
}

export function buildGaps(
  career: SkillCheckCareer,
  answers: SkillAnswerMap,
): SkillGap[] {
  const gaps: SkillGap[] = [];
  for (const skill of career.skills) {
    const answer = answers[skill.id];
    const step = getStep(career, skill.stepOrder);
    if (!step || (answer !== "NOT_YET" && answer !== "NOT_SURE")) continue;
    gaps.push({ skill, answer, step });
  }
  return gaps
    .map((gap, index) => ({ gap, index }))
    .sort(
      (a, b) => a.gap.step.order - b.gap.step.order || a.index - b.index,
    )
    .map(({ gap }) => gap);
}

export function suggestStart(
  career: SkillCheckCareer,
  answers: SkillAnswerMap,
  previousAnswers: SkillAnswerMap | null = null,
): StartSuggestion | null {
  const gaps = buildGaps(career, answers);
  if (gaps.length === 0) return null;

  const stepOrder = gaps[0].step.order;
  const haveBefore = career.skills.filter(
    (skill) => answers[skill.id] === "HAVE" && skill.stepOrder < stepOrder,
  );
  const newlyHave = previousAnswers
    ? haveBefore.filter((skill) => previousAnswers[skill.id] !== "HAVE")
    : [];
  const reasonSkills = newlyHave.length > 0 ? newlyHave : haveBefore;
  const coveredStepOrders = [
    ...new Set(reasonSkills.map((skill) => skill.stepOrder)),
  ].sort((a, b) => a - b);

  return { stepOrder, reasonSkills, coveredStepOrders };
}

export function getSkillCheckResult(
  career: SkillCheckCareer,
  answers: SkillAnswerMap,
  previousAnswers: SkillAnswerMap | null = null,
): SkillCheckResult {
  return {
    counts: countAnswers(career.skills, answers),
    gaps: buildGaps(career, answers),
    suggestion: suggestStart(career, answers, previousAnswers),
  };
}

export function isNewSuggestion(
  startingPoint: StartingPoint | null,
  suggestion: StartSuggestion | null,
): boolean {
  if (!startingPoint || !suggestion) return false;
  return startingPoint.stepOrder !== suggestion.stepOrder;
}

export function getEarlierSteps(
  career: SkillCheckCareer,
  startOrder: number,
): SkillCheckStep[] {
  return career.steps.filter((step) => step.order < startOrder);
}

export function getResumeAreaId(
  career: SkillCheckCareer,
  answers: SkillAnswerMap,
): string | null {
  const groups = groupSkillsByArea(career);
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
