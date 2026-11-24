import { describe, expect, it } from "vitest";
import { buildAssessment } from "./skillCheck.fixtures";
import {
  buildGaps,
  countAnswers,
  formatNameList,
  formatStepRange,
  getAreaProgress,
  getEarlierSteps,
  getHaveSkills,
  getInitialAnswers,
  getResumeAreaId,
  getSkillCheckResult,
  getStartStep,
  groupSkillsByArea,
  isCheckComplete,
  toAssessmentInput,
} from "./skillCheck.utils";

const assessment = buildAssessment();

describe("groupSkillsByArea", () => {
  it("groups skills under their stage, in stage order", () => {
    expect(
      groupSkillsByArea(assessment).map((group) => [
        group.area.name,
        group.skills.map((skill) => skill.id),
      ]),
    ).toEqual([
      ["Core web", ["html", "css", "js"]],
      ["Building interfaces", ["layout", "a11y"]],
    ]);
  });
});

describe("progress through the questionnaire", () => {
  it("counts answered skills in an area", () => {
    const [core] = groupSkillsByArea(assessment);
    expect(getAreaProgress(core.skills, { html: "HAVE" })).toEqual({ answered: 1, total: 3 });
  });

  it("is only complete once every skill has an answer", () => {
    expect(isCheckComplete(assessment.skills, { html: "HAVE" })).toBe(false);
    expect(isCheckComplete(assessment.skills, assessment.saved)).toBe(true);
  });

  it("resumes at the first area with an open skill", () => {
    expect(getResumeAreaId(assessment, { html: "HAVE", css: "HAVE", js: "HAVE" })).toBe("s2");
    expect(getResumeAreaId(assessment, {})).toBe("s1");
  });

  it("resumes at the last area when everything is answered", () => {
    expect(getResumeAreaId(assessment, assessment.saved)).toBe("s2");
  });
});

describe("countAnswers", () => {
  it("counts each answer and the skills left blank", () => {
    expect(countAnswers(assessment.skills, { html: "HAVE", js: "DONT_HAVE" })).toEqual({
      have: 1,
      dontHave: 1,
      notSure: 0,
      unanswered: 3,
    });
  });
});

describe("buildGaps", () => {
  it("lists Not yet and Not sure skills in roadmap order, with their step", () => {
    expect(
      buildGaps(assessment, assessment.saved).map((gap) => [gap.skill.id, gap.answer, gap.step.order]),
    ).toEqual([
      ["js", "DONT_HAVE", 3],
      ["layout", "DONT_HAVE", 4],
      ["a11y", "NOT_SURE", 4],
    ]);
  });

  it("leaves out a skill no step teaches", () => {
    const orphan = {
      ...assessment,
      skills: assessment.skills.map((skill) =>
        skill.id === "js" ? { ...skill, stepOrder: null } : skill,
      ),
    };
    expect(buildGaps(orphan, assessment.saved).map((gap) => gap.skill.id)).not.toContain("js");
  });
});

describe("getStartStep", () => {
  it("is the step the server set", () => {
    expect(getStartStep(assessment)).toEqual({ id: "st3", order: 3, title: "JavaScript basics" });
  });

  it("is null when no starting step is set", () => {
    expect(getStartStep({ ...assessment, startStepId: null })).toBeNull();
  });
});

describe("getSkillCheckResult", () => {
  it("brings counts, gaps and the starting step together from the saved answers", () => {
    const result = getSkillCheckResult(assessment);
    expect(result.counts).toEqual({ have: 2, dontHave: 2, notSure: 1, unanswered: 0 });
    expect(result.gaps).toHaveLength(3);
    expect(result.startStep?.order).toBe(3);
  });
});

describe("getHaveSkills", () => {
  it("lists the Have skills in roadmap order", () => {
    expect(getHaveSkills(assessment).map((skill) => skill.id)).toEqual(["html", "css"]);
  });
});

describe("toAssessmentInput", () => {
  it("sends every answered skill", () => {
    expect(toAssessmentInput(assessment.skills, { css: "HAVE", js: "NOT_SURE" }, {})).toEqual([
      { skillId: "css", status: "HAVE" },
      { skillId: "js", status: "NOT_SURE" },
    ]);
  });

  it("keeps the saved rating on a skill still marked Have", () => {
    expect(toAssessmentInput(assessment.skills, { html: "HAVE" }, { html: 4 })).toEqual([
      { skillId: "html", status: "HAVE", rating: 4 },
    ]);
  });

  it("drops the rating once the skill is no longer Have, since the server rejects it", () => {
    expect(toAssessmentInput(assessment.skills, { html: "DONT_HAVE" }, { html: 4 })).toEqual([
      { skillId: "html", status: "DONT_HAVE" },
    ]);
  });
});

describe("getInitialAnswers", () => {
  it("opens on the draft when there is one", () => {
    expect(getInitialAnswers(assessment, { css: "DONT_HAVE" })).toEqual({ css: "DONT_HAVE" });
  });

  it("drops draft answers for skills no longer in the pathway", () => {
    expect(getInitialAnswers(assessment, { gone: "HAVE", css: "HAVE" })).toEqual({ css: "HAVE" });
  });

  it("opens on the saved answers when there is no draft", () => {
    expect(getInitialAnswers(assessment, null)).toEqual(assessment.saved);
  });

  it("opens blank before the first check", () => {
    expect(getInitialAnswers({ ...assessment, saved: {} }, null)).toEqual({});
  });
});

describe("getEarlierSteps", () => {
  it("lists the steps before the start", () => {
    expect(getEarlierSteps(assessment, 3).map((step) => step.order)).toEqual([1, 2]);
  });
});

describe("formatStepRange", () => {
  it.each([
    [[3], "step 3"],
    [[1, 2], "steps 1 and 2"],
    [[1, 2, 3], "steps 1 to 3"],
    [[1, 3, 5], "steps 1, 3 and 5"],
    [[], ""],
  ])("formats %j as %s", (orders, text) => {
    expect(formatStepRange(orders)).toBe(text);
  });
});

describe("formatNameList", () => {
  it.each([
    [[], ""],
    [["HTML"], "HTML"],
    [["HTML", "CSS"], "HTML and CSS"],
    [["HTML", "CSS", "Git"], "HTML, CSS and Git"],
  ])("formats %j as %s", (names, text) => {
    expect(formatNameList(names)).toBe(text);
  });
});
