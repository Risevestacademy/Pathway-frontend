import type { ActivePathwayDto } from "../../lib/api/progress.api";
import type { AssessmentDto } from "../../lib/api/skills.api";
import { toSkillAssessment } from "./skillCheck.mapping";
import type { SkillAssessment } from "./skillCheck.types";

export const ASSESSED_AT = "2026-11-20T10:00:00.000Z";

/** Test data shaped like GET /me/skills/assessment for a small frontend pathway. */
export const assessmentDto: AssessmentDto = {
  careerId: "c1",
  pathwayId: "p1",
  lastAssessedAt: ASSESSED_AT,
  stages: [
    {
      stageId: "s2",
      stageTitle: "Building interfaces",
      stageOrder: 2,
      skills: [
        { skillId: "layout", skillName: "Responsive layout", status: "DONT_HAVE", rating: null, assessedAt: ASSESSED_AT },
        { skillId: "a11y", skillName: "Accessibility", status: "NOT_SURE", rating: null, assessedAt: ASSESSED_AT },
      ],
    },
    {
      stageId: "s1",
      stageTitle: "Core web",
      stageOrder: 1,
      skills: [
        { skillId: "html", skillName: "HTML", status: "HAVE", rating: 4, assessedAt: ASSESSED_AT },
        { skillId: "css", skillName: "CSS", status: "HAVE", rating: null, assessedAt: ASSESSED_AT },
        { skillId: "js", skillName: "JavaScript", status: "DONT_HAVE", rating: null, assessedAt: ASSESSED_AT },
      ],
    },
    { stageId: "s3", stageTitle: "Empty stage", stageOrder: 3, skills: [] },
  ],
};

/** Test data shaped like GET /me/active-pathway for the same pathway. */
export const activePathwayDto: ActivePathwayDto = {
  career: {
    id: "c1",
    slug: "frontend-engineer",
    title: "Frontend Developer",
    roleSummary: "",
    retired: false,
  },
  pathway: { id: "p1", title: "Frontend" },
  progress: {
    completed: 0,
    total: 4,
    percentage: 0,
    nextStepId: "st3",
    selfReported: true,
    startStepId: "st3",
  },
  steps: [
    {
      id: "st2",
      order: 2,
      title: "CSS basics",
      skills: [{ id: "css", name: "CSS" }],
      status: "NOT_STARTED",
    },
    {
      id: "st1",
      order: 1,
      title: "HTML basics",
      skills: [{ id: "html", name: "HTML" }],
      status: "NOT_STARTED",
    },
    {
      id: "st3",
      order: 3,
      title: "JavaScript basics",
      skills: [
        { id: "js", name: "JavaScript" },
        { id: "html", name: "HTML" },
      ],
      status: "NOT_STARTED",
    },
    {
      id: "st4",
      order: 4,
      title: "Layouts",
      skills: [
        { id: "layout", name: "Responsive layout" },
        { id: "a11y", name: "Accessibility" },
      ],
      status: "NOT_STARTED",
    },
  ],
};

export function buildAssessment(): SkillAssessment {
  return toSkillAssessment(assessmentDto, activePathwayDto);
}
