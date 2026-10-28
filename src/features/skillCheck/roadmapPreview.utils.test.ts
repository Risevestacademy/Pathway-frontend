import { describe, expect, it } from "vitest";
import { getRoadmapPreviewState } from "./roadmapPreview.utils";
import { SKILL_CHECK_CAREERS } from "./skillCheck.mock";

const career = SKILL_CHECK_CAREERS[0];

describe("getRoadmapPreviewState", () => {
  it("starts at the chosen step and keeps earlier steps open", () => {
    const state = getRoadmapPreviewState(career, 3, []);
    expect(state.nextStep?.order).toBe(3);
    expect(state.earlierOpen.map((step) => step.order)).toEqual([1, 2]);
    expect(state.visibleSteps[0].order).toBe(3);
  });

  it("moves to the following step once one is complete", () => {
    const state = getRoadmapPreviewState(career, 3, [3]);
    expect(state.nextStep?.order).toBe(4);
    expect(state.completedCount).toBe(1);
  });

  it("falls back to earlier open steps when everything after the start is done", () => {
    const state = getRoadmapPreviewState(career, 6, [6, 7]);
    expect(state.nextStep?.order).toBe(1);
  });

  it("has no next step when every step is complete", () => {
    const all = career.steps.map((step) => step.order);
    expect(getRoadmapPreviewState(career, 1, all).nextStep).toBeNull();
  });
});
