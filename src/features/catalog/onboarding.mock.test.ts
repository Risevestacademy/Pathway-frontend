import { describe, expect, it } from "vitest";
import {
  FIELD_OF_STUDY_OPTIONS,
  GOAL_OPTIONS,
  JOB_TYPE_OPTIONS,
  SKILL_CHIP_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
} from "./onboarding.mock";

describe.each([
  ["field of study", FIELD_OF_STUDY_OPTIONS],
  ["job type", JOB_TYPE_OPTIONS],
  ["goals", GOAL_OPTIONS],
  ["time commitment", TIME_COMMITMENT_OPTIONS],
  ["skill chips", SKILL_CHIP_OPTIONS],
])("%s options", (_name, options) => {
  it("has a label and a unique value for every option", () => {
    expect(options.length).toBeGreaterThan(0);
    expect(new Set(options.map((o) => o.value)).size).toBe(options.length);
    expect(options.every((o) => o.label.trim() !== "")).toBe(true);
  });
});