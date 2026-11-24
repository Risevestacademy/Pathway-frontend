import { describe, expect, it } from "vitest";
import { ASSESSED_AT, activePathwayDto, assessmentDto, buildAssessment } from "./skillCheck.fixtures";
import { toSkillAssessment } from "./skillCheck.mapping";

/** What the server sends before any check: every skill Not sure, none dated. */
const neverChecked = {
  ...assessmentDto,
  lastAssessedAt: null,
  stages: assessmentDto.stages.map((stage) => ({
    ...stage,
    skills: stage.skills.map((skill) => ({
      ...skill,
      status: "NOT_SURE" as const,
      rating: null,
      assessedAt: null,
    })),
  })),
};

describe("toSkillAssessment", () => {
  it("turns stages into areas, in stage order, skipping empty ones", () => {
    expect(buildAssessment().areas).toEqual([
      { id: "s1", name: "Core web" },
      { id: "s2", name: "Building interfaces" },
    ]);
  });

  it("links each skill to the first step that teaches it", () => {
    const orders = Object.fromEntries(
      buildAssessment().skills.map((skill) => [skill.id, skill.stepOrder]),
    );
    expect(orders).toEqual({ html: 1, css: 2, js: 3, layout: 4, a11y: 4 });
  });

  it("leaves the step empty when no step teaches the skill", () => {
    const active = { ...activePathwayDto, steps: [] };
    const assessment = toSkillAssessment(assessmentDto, active);
    expect(assessment.skills.every((skill) => skill.stepOrder === null)).toBe(true);
  });

  it("keeps the saved answers and only the ratings on Have skills", () => {
    const assessment = buildAssessment();
    expect(assessment.saved).toMatchObject({ html: "HAVE", js: "DONT_HAVE", a11y: "NOT_SURE" });
    expect(assessment.ratings).toEqual({ html: 4 });
  });

  it("takes the name, icon and starting step from the active pathway", () => {
    const assessment = buildAssessment();
    expect(assessment.name).toBe("Frontend Developer");
    expect(assessment.icon).toBe("frontend-developer");
    expect(assessment.startStepId).toBe("st3");
  });

  it("has a result, dated by the server, once the check was taken", () => {
    const assessment = buildAssessment();
    expect(assessment.hasResult).toBe(true);
    expect(assessment.checkedAt).toBe(ASSESSED_AT);
  });

  it("has no result before the check, even with a starting step set by hand", () => {
    const assessment = toSkillAssessment(neverChecked, activePathwayDto);
    expect(assessment.startStepId).toBe("st3");
    expect(assessment.hasResult).toBe(false);
    expect(assessment.checkedAt).toBeNull();
  });

  it("has no result when a skill was only added to the profile", () => {
    // Profile skills come back as Not sure with no assessedAt.
    expect(toSkillAssessment(neverChecked, activePathwayDto).saved).toEqual({});
  });

  it("leaves skills never answered out of the saved answers", () => {
    const partial = {
      ...assessmentDto,
      stages: assessmentDto.stages.map((stage) => ({
        ...stage,
        skills: stage.skills.map((skill) =>
          skill.skillId === "a11y" ? { ...skill, assessedAt: null } : skill,
        ),
      })),
    };
    const assessment = toSkillAssessment(partial, activePathwayDto);
    expect(assessment.saved).not.toHaveProperty("a11y");
    expect(assessment.saved).toHaveProperty("js", "DONT_HAVE");
  });
});
