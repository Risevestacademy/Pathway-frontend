import type { ActivePathwayDto } from "../../lib/api/progress.api";
import type { AssessmentDto } from "../../lib/api/skills.api";
import { careerIconKey } from "../explore/explore.utils";
import type {
  SkillAnswerMap,
  SkillAssessment,
  SkillCheckArea,
  SkillCheckSkill,
  SkillCheckStep,
} from "./skillCheck.types";

/**
 * Joins the assessment (skills by stage, with saved answers) to the active
 * pathway (steps, the skills each teaches, and the starting step).
 */
export function toSkillAssessment(
  assessment: AssessmentDto,
  active: ActivePathwayDto,
): SkillAssessment {
  const steps: SkillCheckStep[] = [...active.steps]
    .sort((a, b) => a.order - b.order)
    .map(({ id, order, title }) => ({ id, order, title }));

  const firstStepOrder = new Map<string, number>();
  for (const step of [...active.steps].sort((a, b) => a.order - b.order)) {
    for (const skill of step.skills) {
      if (!firstStepOrder.has(skill.id)) firstStepOrder.set(skill.id, step.order);
    }
  }

  const stages = [...assessment.stages]
    .sort((a, b) => a.stageOrder - b.stageOrder)
    .filter((stage) => stage.skills.length > 0);

  const areas: SkillCheckArea[] = stages.map((stage) => ({
    id: stage.stageId,
    name: stage.stageTitle,
  }));

  const skills: SkillCheckSkill[] = [];
  const saved: SkillAnswerMap = {};
  const ratings: Record<string, number> = {};
  for (const stage of stages) {
    for (const skill of stage.skills) {
      skills.push({
        id: skill.skillId,
        areaId: stage.stageId,
        name: skill.skillName,
        stepOrder: firstStepOrder.get(skill.skillId) ?? null,
      });
      // A skill never answered also reads NOT_SURE; only answered ones count.
      if (skill.assessedAt === null) continue;
      saved[skill.skillId] = skill.status;
      if (skill.status === "HAVE" && skill.rating !== null) {
        ratings[skill.skillId] = skill.rating;
      }
    }
  }

  // The starting step is no sign of a result: learners can also set it by hand.
  const startStepId = active.progress?.startStepId ?? null;

  return {
    careerId: assessment.careerId,
    name: active.career?.title ?? "Your pathway",
    icon: active.career ? careerIconKey(active.career.slug) : null,
    areas,
    skills,
    steps,
    saved,
    ratings,
    startStepId,
    hasResult: assessment.lastAssessedAt !== null,
    checkedAt: assessment.lastAssessedAt,
  };
}
