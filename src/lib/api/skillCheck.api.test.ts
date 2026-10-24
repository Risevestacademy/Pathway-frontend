import { beforeEach, describe, expect, it } from "vitest";
import {
  completeSkillCheck,
  fetchActiveCareerId,
  fetchSkillCheckCareers,
  fetchSkillCheckRecord,
  fetchSkillRatings,
  resolveStartingPoint,
  saveSkillCheckDraft,
  saveSkillRating,
  SkillCheckError,
  startSkillCheck,
  switchActiveCareer,
} from "./skillCheck.api";
import { SKILL_CHECK_CAREERS } from "../../features/skillCheck/skillCheck.mock";
import { createRating } from "../../features/skillCheck/rating.utils";
import type { SkillAnswerMap } from "../../features/skillCheck/skillCheck.types";

const FRONTEND = "frontend-developer";
const frontend = SKILL_CHECK_CAREERS[0];

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

let userId = "";
let counter = 0;

beforeEach(() => {
  window.localStorage.clear();
  counter += 1;
  userId = `user-${counter}`;
});

async function finishCheck(answers: SkillAnswerMap, id = userId) {
  await startSkillCheck(id, FRONTEND);
  await saveSkillCheckDraft(id, FRONTEND, answers, null);
  return completeSkillCheck(id, FRONTEND);
}

describe("career list", () => {
  it("marks careers without a reviewed skill list as not reviewed", async () => {
    const careers = await fetchSkillCheckCareers(userId);
    expect(careers.map((c) => [c.careerId, c.reviewed])).toEqual([
      ["frontend-developer", true],
      ["backend-developer", true],
      ["ux-designer", true],
      ["data-analyst", false],
    ]);
  });

  it("starts with no active pathway and no results", async () => {
    const careers = await fetchSkillCheckCareers(userId);
    expect(careers.some((c) => c.isActive || c.hasResult)).toBe(false);
    expect(await fetchActiveCareerId(userId)).toBeNull();
  });
});

describe("starting and resuming a check", () => {
  it("starts with an empty draft", async () => {
    const record = await startSkillCheck(userId, FRONTEND);
    expect(record.draft).toEqual({});
  });

  it("keeps saved answers when the check is started again", async () => {
    await startSkillCheck(userId, FRONTEND);
    await saveSkillCheckDraft(userId, FRONTEND, { html: "HAVE" }, "core-web");
    const resumed = await startSkillCheck(userId, FRONTEND);
    expect(resumed.draft).toEqual({ html: "HAVE" });
    expect(resumed.draftAreaId).toBe("core-web");
  });

  it("refuses a career with no reviewed skill list", async () => {
    await expect(startSkillCheck(userId, "data-analyst")).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
  });

  it("refuses an unknown career", async () => {
    await expect(startSkillCheck(userId, "nope")).rejects.toBeInstanceOf(
      SkillCheckError,
    );
  });
});

describe("completing a check", () => {
  it("refuses to finish while skills are unanswered", async () => {
    await startSkillCheck(userId, FRONTEND);
    await saveSkillCheckDraft(userId, FRONTEND, { html: "HAVE" }, null);
    await expect(completeSkillCheck(userId, FRONTEND)).rejects.toMatchObject({
      code: "INCOMPLETE",
    });
  });

  it("records the answers and asks for a decision on the first suggestion", async () => {
    const record = await finishCheck(firstCheck);
    expect(record.answers).toEqual(firstCheck);
    expect(record.draft).toBeNull();
    expect(record.completedAt).not.toBeNull();
    expect(record.startingPoint).toBeNull();
    expect(record.needsDecision).toBe(true);
  });

  it("does not ask for a decision when there are no gaps", async () => {
    const allHave = Object.fromEntries(
      frontend.skills.map((s) => [s.id, "HAVE" as const]),
    );
    expect((await finishCheck(allHave)).needsDecision).toBe(false);
  });
});

describe("starting point", () => {
  it("saves an accepted starting point", async () => {
    await finishCheck(firstCheck);
    const record = await resolveStartingPoint(userId, FRONTEND, {
      stepOrder: 3,
      source: "ACCEPTED",
    });
    expect(record.startingPoint).toEqual({ stepOrder: 3, source: "ACCEPTED" });
    expect(record.needsDecision).toBe(false);
  });

  it("saves a declined suggestion as step 1", async () => {
    await finishCheck(firstCheck);
    const record = await resolveStartingPoint(userId, FRONTEND, {
      stepOrder: 1,
      source: "DECLINED",
    });
    expect(record.startingPoint).toEqual({ stepOrder: 1, source: "DECLINED" });
  });
});

describe("retaking", () => {
  const retaken: SkillAnswerMap = {
    ...firstCheck,
    "javascript-fundamentals": "HAVE",
    "responsive-layout": "HAVE",
  };

  async function acceptFirst() {
    await finishCheck(firstCheck);
    await resolveStartingPoint(userId, FRONTEND, {
      stepOrder: 3,
      source: "ACCEPTED",
    });
  }

  it("prefills the draft with the last answers", async () => {
    await acceptFirst();
    const record = await startSkillCheck(userId, FRONTEND);
    expect(record.draft).toEqual(firstCheck);
  });

  it("keeps the accepted starting point and flags a new suggestion", async () => {
    await acceptFirst();
    const record = await finishCheck(retaken);
    expect(record.startingPoint).toEqual({ stepOrder: 3, source: "ACCEPTED" });
    expect(record.previousAnswers).toEqual(firstCheck);
    expect(record.needsDecision).toBe(true);
  });

  it("does not flag a decision when the suggestion is unchanged", async () => {
    await acceptFirst();
    const record = await finishCheck({ ...firstCheck, communication: "NOT_YET" });
    expect(record.needsDecision).toBe(false);
  });

  it("keeps the current starting point when the user keeps it", async () => {
    await acceptFirst();
    await finishCheck(retaken);
    const record = await resolveStartingPoint(userId, FRONTEND, null);
    expect(record.startingPoint).toEqual({ stepOrder: 3, source: "ACCEPTED" });
    expect(record.needsDecision).toBe(false);
  });

  it("changes the starting point only when the user accepts", async () => {
    await acceptFirst();
    await finishCheck(retaken);
    const record = await resolveStartingPoint(userId, FRONTEND, {
      stepOrder: 5,
      source: "ACCEPTED",
    });
    expect(record.startingPoint?.stepOrder).toBe(5);
  });
});

describe("pathway switching and storage", () => {
  it("sets the active pathway and keeps earlier results", async () => {
    await finishCheck(firstCheck);
    await switchActiveCareer(userId, "backend-developer");
    expect(await fetchActiveCareerId(userId)).toBe("backend-developer");
    expect((await fetchSkillCheckRecord(userId, FRONTEND))?.completedAt).not.toBeNull();
  });

  it("keeps each user's answers separate", async () => {
    await finishCheck(firstCheck, "user-a");
    expect(await fetchSkillCheckRecord("user-b", FRONTEND)).toBeNull();
  });

  it("recovers from corrupted stored data", async () => {
    window.localStorage.setItem(`pathway.skill-check.v1.${userId}`, "{oops");
    expect(await fetchActiveCareerId(userId)).toBeNull();
  });
});

describe("ratings", () => {
  it("saves ratings in order and returns them", async () => {
    await saveSkillRating(userId, createRating(FRONTEND, "html", 2));
    await saveSkillRating(userId, createRating(FRONTEND, "html", "NOT_SURE"));
    const ratings = await fetchSkillRatings(userId);
    expect(ratings.map((r) => r.value)).toEqual([2, "NOT_SURE"]);
  });
});
