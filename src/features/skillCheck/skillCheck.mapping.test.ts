import { describe, expect, it } from "vitest";
import { activePathwayDto, assessmentDto, buildAssessment } from "./skillCheck.fixtures";
import { toSkillAssessment } from "./skillCheck.mapping";

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
    const assessment = toSkillAssessment(assessmentDto, active, null);
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

  it("counts as a result once anything other than Not sure is saved", () => {
    expect(buildAssessment().hasResult).toBe(true);
  });

  it("has no result for a starting step set by hand, without a skill check", () => {
    const blank = {
      ...assessmentDto,
      stages: assessmentDto.stages.map((stage) => ({
        ...stage,
        skills: stage.skills.map((skill) => ({ ...skill, status: "NOT_SURE" as const, rating: null })),
      })),
    };
    const assessment = toSkillAssessment(blank, activePathwayDto, null);
    expect(assessment.startStepId).toBe("st3");
    expect(assessment.hasResult).toBe(false);
  });

  it("has no result when every skill reads Not sure and nothing else says otherwise", () => {
    const blank = {
      ...assessmentDto,
      stages: assessmentDto.stages.map((stage) => ({
        ...stage,
        skills: stage.skills.map((skill) => ({ ...skill, status: "NOT_SURE" as const, rating: null })),
      })),
    };
    const active = { ...activePathwayDto, progress: { ...activePathwayDto.progress!, startStepId: null } };
    expect(toSkillAssessment(blank, active, null).hasResult).toBe(false);
    expect(toSkillAssessment(blank, active, "2026-11-01T00:00:00.000Z").hasResult).toBe(true);
  });
});
