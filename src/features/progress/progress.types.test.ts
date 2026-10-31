import { describe, expect, it } from "vitest";
import {
  activeSavedPathway,
  nextActiveStep,
  totalCompletedSteps,
  type ActivePathway,
  type SavedPathway,
} from "./progress.types";

const activePathway = (nextStepId: string | null): ActivePathway => ({
  career: { id: "c", slug: "c", title: "C", roleSummary: "", retired: false },
  pathway: { id: "p", title: "P" },
  progress: {
    completed: 1,
    total: 2,
    percentage: 50,
    nextStepId,
    selfReported: true,
    startStepId: null,
  },
  steps: [
    { id: "s1", order: 1, title: "First", skills: [], status: "COMPLETED" },
    { id: "s2", order: 2, title: "Second", skills: [], status: "NOT_STARTED" },
  ],
});

describe("nextActiveStep", () => {
  it("finds the step the server says is next", () => {
    expect(nextActiveStep(activePathway("s2"))?.title).toBe("Second");
  });

  it("is undefined when there is no next step, or it isn't in the list", () => {
    expect(nextActiveStep(activePathway(null))).toBeUndefined();
    expect(nextActiveStep(activePathway("missing"))).toBeUndefined();
    expect(
      nextActiveStep({ career: null, pathway: null, progress: null, steps: [] }),
    ).toBeUndefined();
  });
});

const pathway = (id: string, completed: number, isActive = false): SavedPathway => ({
  career: { id, slug: id, title: id, retired: false },
  isActive,
  progress: { completed, total: 10, percentage: completed * 10 },
});

describe("activeSavedPathway", () => {
  it("finds the pathway being followed", () => {
    const list = [pathway("a", 1), pathway("b", 4, true)];

    expect(activeSavedPathway(list)?.career.id).toBe("b");
  });

  it("is undefined when none is active, or none are saved", () => {
    expect(activeSavedPathway([pathway("a", 1)])).toBeUndefined();
    expect(activeSavedPathway([])).toBeUndefined();
  });
});

describe("totalCompletedSteps", () => {
  it("adds the steps done across every saved pathway", () => {
    expect(totalCompletedSteps([pathway("a", 3), pathway("b", 5)])).toBe(8);
  });

  it("is zero with nothing saved", () => {
    expect(totalCompletedSteps([])).toBe(0);
  });
});
