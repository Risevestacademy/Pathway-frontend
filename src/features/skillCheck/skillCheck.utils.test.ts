import { describe, expect, it } from "vitest";
import { SKILL_CHECK_CAREERS } from "./skillCheck.mock";
import {
  buildGaps,
  countAnswers,
  formatNameList,
  formatStepRange,
  getAreaProgress,
  getEarlierSteps,
  getResumeAreaId,
  getSkillCheckResult,
  groupSkillsByArea,
  isCheckComplete,
  isNewSuggestion,
  suggestStart,
} from "./skillCheck.utils";
import type { SkillAnswerMap } from "./skillCheck.types";

const frontend = SKILL_CHECK_CAREERS[0];
const backend = SKILL_CHECK_CAREERS[1];

const firstCheck: SkillAnswerMap = {
  html: "HAVE",
  css: "HAVE",
  "javascript-fundamentals": "NOT_YET",
  "responsive-layout": "NOT_YET",
  accessibility: "NOT_SURE",
  components: "HAVE",
  git: "NOT_YET",
  "browser-dev-tools": "HAVE",
  "package-managers": "HAVE",
  "code-review": "HAVE",
  communication: "HAVE",
};

const retake: SkillAnswerMap = {
  ...firstCheck,
  "javascript-fundamentals": "HAVE",
  "responsive-layout": "HAVE",
};

describe("groupSkillsByArea", () => {
  it("groups the frontend skills into four areas of 3, 3, 3 and 2", () => {
    expect(groupSkillsByArea(frontend).map((g) => g.skills.length)).toEqual([
      3, 3, 3, 2,
    ]);
  });

  it("returns no groups for a career with no reviewed skills", () => {
    expect(groupSkillsByArea(SKILL_CHECK_CAREERS[3])).toEqual([]);
  });
});

describe("counting answers", () => {
  it("counts 7 have, 3 not yet and 1 not sure for the first check", () => {
    expect(countAnswers(frontend.skills, firstCheck)).toEqual({
      have: 7,
      notYet: 3,
      notSure: 1,
      unanswered: 0,
    });
  });

  it("counts skills with no answer as unanswered", () => {
    expect(countAnswers(frontend.skills, { html: "HAVE" }).unanswered).toBe(10);
  });

  it("reports progress for one area", () => {
    const core = groupSkillsByArea(frontend)[0].skills;
    expect(getAreaProgress(core, { html: "HAVE", css: "HAVE" })).toEqual({
      answered: 2,
      total: 3,
    });
  });

  it("is complete only when every skill has an answer", () => {
    expect(isCheckComplete(frontend.skills, firstCheck)).toBe(true);
    expect(isCheckComplete(frontend.skills, { html: "HAVE" })).toBe(false);
    expect(isCheckComplete([], {})).toBe(false);
  });
});

describe("buildGaps", () => {
  it("lists gaps in roadmap order, each linked to its step", () => {
    expect(
      buildGaps(frontend, firstCheck).map((g) => [g.skill.name, g.step.order]),
    ).toEqual([
      ["JavaScript fundamentals", 3],
      ["Responsive layout", 4],
      ["Git", 5],
      ["Accessibility", 6],
    ]);
  });

  it("keeps the not sure answer on the gap", () => {
    const gaps = buildGaps(frontend, firstCheck);
    expect(gaps[3].answer).toBe("NOT_SURE");
  });

  it("does not list unanswered skills as gaps", () => {
    expect(buildGaps(frontend, { html: "HAVE" })).toEqual([]);
  });

  it("keeps the skill order for gaps on the same step", () => {
    const gaps = buildGaps(frontend, {
      "javascript-fundamentals": "NOT_YET",
      "browser-dev-tools": "NOT_SURE",
    });
    expect(gaps.map((g) => g.skill.id)).toEqual([
      "javascript-fundamentals",
      "browser-dev-tools",
    ]);
  });
});

describe("suggestStart", () => {
  it("suggests step 3 when HTML and CSS are the only skills covered before it", () => {
    const suggestion = suggestStart(frontend, firstCheck);
    expect(suggestion?.stepOrder).toBe(3);
    expect(suggestion?.reasonSkills.map((s) => s.name)).toEqual(["HTML", "CSS"]);
    expect(suggestion?.coveredStepOrders).toEqual([1, 2]);
  });

  it("suggests step 5 after a retake and names the skills that changed", () => {
    const suggestion = suggestStart(frontend, retake, firstCheck);
    expect(suggestion?.stepOrder).toBe(5);
    expect(suggestion?.reasonSkills.map((s) => s.name)).toEqual([
      "JavaScript fundamentals",
      "Responsive layout",
    ]);
  });

  it("falls back to every covered skill when none changed", () => {
    const suggestion = suggestStart(frontend, firstCheck, firstCheck);
    expect(suggestion?.reasonSkills.map((s) => s.name)).toEqual(["HTML", "CSS"]);
  });

  it("suggests step 4 for the backend example", () => {
    const answers: SkillAnswerMap = {
      "programming-basics": "HAVE",
      git: "HAVE",
      node: "HAVE",
      "databases-and-sql": "NOT_YET",
      apis: "NOT_YET",
      authentication: "NOT_YET",
      testing: "NOT_SURE",
      "problem-solving": "HAVE",
      "linux-basics": "HAVE",
      deployment: "HAVE",
    };
    const suggestion = suggestStart(backend, answers);
    expect(suggestion?.stepOrder).toBe(4);
    expect(suggestion?.reasonSkills.map((s) => s.name)).toEqual([
      "Programming basics",
      "Git",
      "Node",
    ]);
    expect(suggestion?.coveredStepOrders).toEqual([1, 3]);
  });

  it("suggests step 1 when the first gap is on step 1", () => {
    const suggestion = suggestStart(frontend, { html: "NOT_YET", css: "HAVE" });
    expect(suggestion?.stepOrder).toBe(1);
    expect(suggestion?.reasonSkills).toEqual([]);
  });

  it("returns no suggestion when there are no gaps", () => {
    const allHave = Object.fromEntries(
      frontend.skills.map((s) => [s.id, "HAVE" as const]),
    );
    expect(suggestStart(frontend, allHave)).toBeNull();
  });
});

describe("getSkillCheckResult", () => {
  it("combines counts, gaps and the suggestion", () => {
    const result = getSkillCheckResult(frontend, firstCheck);
    expect(result.counts.have).toBe(7);
    expect(result.gaps).toHaveLength(4);
    expect(result.suggestion?.stepOrder).toBe(3);
  });

  it("reports 9 have, 1 not yet and 1 not sure after the retake", () => {
    expect(getSkillCheckResult(frontend, retake, firstCheck).counts).toEqual({
      have: 9,
      notYet: 1,
      notSure: 1,
      unanswered: 0,
    });
  });
});

describe("isNewSuggestion", () => {
  const suggestion = suggestStart(frontend, retake, firstCheck);

  it("is true when the suggested step differs from the starting point", () => {
    expect(
      isNewSuggestion({ stepOrder: 3, source: "ACCEPTED" }, suggestion),
    ).toBe(true);
  });

  it("is false when the suggested step matches the starting point", () => {
    expect(
      isNewSuggestion({ stepOrder: 5, source: "ACCEPTED" }, suggestion),
    ).toBe(false);
  });

  it("is false when there is no starting point yet", () => {
    expect(isNewSuggestion(null, suggestion)).toBe(false);
  });

  it("is false when there is no suggestion", () => {
    expect(isNewSuggestion({ stepOrder: 3, source: "ACCEPTED" }, null)).toBe(
      false,
    );
  });
});

describe("getEarlierSteps", () => {
  it("returns the steps before the starting point", () => {
    expect(getEarlierSteps(frontend, 3).map((s) => s.order)).toEqual([1, 2]);
  });

  it("returns nothing when starting at step 1", () => {
    expect(getEarlierSteps(frontend, 1)).toEqual([]);
  });
});

describe("getResumeAreaId", () => {
  it("returns the first area that still has an unanswered skill", () => {
    expect(
      getResumeAreaId(frontend, { html: "HAVE", css: "HAVE", git: "HAVE" }),
    ).toBe("core-web");
  });

  it("moves on once an area is fully answered", () => {
    const answers: SkillAnswerMap = {
      html: "HAVE",
      css: "HAVE",
      "javascript-fundamentals": "HAVE",
    };
    expect(getResumeAreaId(frontend, answers)).toBe("building-interfaces");
  });

  it("returns the last area when everything is answered", () => {
    expect(getResumeAreaId(frontend, firstCheck)).toBe("working-with-others");
  });

  it("returns null when the career has no skills", () => {
    expect(getResumeAreaId(SKILL_CHECK_CAREERS[3], {})).toBeNull();
  });
});

describe("formatting", () => {
  it("formats step ranges", () => {
    expect(formatStepRange([1])).toBe("step 1");
    expect(formatStepRange([1, 2])).toBe("steps 1 and 2");
    expect(formatStepRange([1, 3])).toBe("steps 1 and 3");
    expect(formatStepRange([1, 2, 3])).toBe("steps 1 to 3");
    expect(formatStepRange([1, 2, 4])).toBe("steps 1, 2 and 4");
    expect(formatStepRange([])).toBe("");
  });

  it("formats name lists", () => {
    expect(formatNameList(["HTML"])).toBe("HTML");
    expect(formatNameList(["HTML", "CSS"])).toBe("HTML and CSS");
    expect(formatNameList(["Programming basics", "Git", "Node"])).toBe(
      "Programming basics, Git and Node",
    );
    expect(formatNameList([])).toBe("");
  });
});
