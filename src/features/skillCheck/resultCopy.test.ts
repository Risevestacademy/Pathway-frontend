import { describe, expect, it } from "vitest";
import { describeReason, earlierNote } from "./resultCopy";
import type { SkillCheckCareer } from "./skillCheck.types";

const career = {
  steps: [
    { order: 1, title: "One" },
    { order: 2, title: "Two" },
    { order: 3, title: "Three" },
  ],
} as unknown as SkillCheckCareer;

describe("describeReason", () => {
  it("explains a suggestion that has no covering skills", () => {
    expect(describeReason([], [], false)).toBe(
      "Why: this is the first step linked to a skill you marked Not yet or Not sure.",
    );
  });

  it("explains a retake change", () => {
    expect(describeReason(["HTML", "CSS"], [1, 2], true)).toBe(
      "Why: you now marked HTML and CSS as Have.",
    );
  });

  it("names the steps that cover a skill", () => {
    expect(describeReason(["HTML"], [1], false)).toBe(
      "Why: you marked HTML as Have, and step 1 covers it.",
    );
    expect(describeReason(["HTML", "CSS"], [1, 2], false)).toBe(
      "Why: you marked HTML and CSS as Have, and steps 1 and 2 cover those.",
    );
  });
});

describe("earlierNote", () => {
  it("has no note when starting at step 1", () => {
    expect(earlierNote(career, 1)).toBeNull();
  });

  it("says the earlier steps stay open", () => {
    expect(earlierNote(career, 2)).toBe(
      "Step 1 stays open and marked incomplete. Nothing is marked done for you.",
    );
    expect(earlierNote(career, 3)).toBe(
      "Steps 1 and 2 stay open and marked incomplete. Nothing is marked done for you.",
    );
  });
});
