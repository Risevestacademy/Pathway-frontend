import { describe, expect, it } from "vitest";
import type {
  ActivePathwayDto,
  SavedPathwayDto,
} from "../../lib/api/progress.api";
import {
  applyStepStatus,
  describeProgress,
  getCareerProgress,
  getStepStatus,
} from "./progress.utils";

const progress = {
  completed: 1,
  total: 3,
  percentage: 33,
  nextStepId: "s2",
  selfReported: true,
  startStepId: null,
};

const active: ActivePathwayDto = {
  career: {
    id: "c1",
    slug: "frontend",
    title: "Frontend Developer",
    roleSummary: "",
    retired: false,
  },
  pathway: { id: "p1", title: "Frontend" },
  progress,
  steps: [
    { id: "s1", order: 1, title: "HTML", skills: [], status: "COMPLETED" },
    { id: "s2", order: 2, title: "CSS", skills: [], status: "NOT_STARTED" },
    { id: "s3", order: 3, title: "JS", skills: [], status: "NOT_STARTED" },
  ],
};

const noActive: ActivePathwayDto = {
  career: null,
  pathway: null,
  progress: null,
  steps: [],
};

const savedData: SavedPathwayDto = {
  career: { id: "c2", slug: "data", title: "Data Analyst", retired: false },
  isActive: false,
  progress: { completed: 2, total: 5, percentage: 40 },
};

describe("getCareerProgress", () => {
  it("returns step statuses when the career is the active pathway", () => {
    const result = getCareerProgress("c1", active, []);
    expect(result).toEqual({
      kind: "active",
      progress,
      statuses: { s1: "COMPLETED", s2: "NOT_STARTED", s3: "NOT_STARTED" },
    });
  });

  it("returns saved counts and the active title for a saved, inactive career", () => {
    expect(getCareerProgress("c2", active, [savedData])).toEqual({
      kind: "inactive",
      counts: savedData.progress,
      activeCareerTitle: "Frontend Developer",
    });
  });

  it("returns untracked for a career the user hasn't saved", () => {
    expect(getCareerProgress("c9", active, [savedData])).toEqual({
      kind: "untracked",
      activeCareerTitle: "Frontend Developer",
    });
  });

  it("returns untracked with no title when nothing is active", () => {
    expect(getCareerProgress("c1", noActive, [])).toEqual({
      kind: "untracked",
      activeCareerTitle: null,
    });
  });
});

describe("getStepStatus", () => {
  it("treats a step with no saved status as not started", () => {
    expect(getStepStatus({}, "s1")).toBe("NOT_STARTED");
    expect(getStepStatus({ s1: "COMPLETED" }, "s1")).toBe("COMPLETED");
  });
});

describe("applyStepStatus", () => {
  const nextProgress = { ...progress, completed: 2, percentage: 67, nextStepId: "s3" };

  it("updates the step and replaces progress with the server's numbers", () => {
    const result = applyStepStatus(active, {
      stepId: "s2",
      status: "COMPLETED",
      progress: nextProgress,
    });
    expect(result.progress).toEqual(nextProgress);
    expect(result.steps.find((step) => step.id === "s2")?.status).toBe("COMPLETED");
    expect(result.steps.find((step) => step.id === "s1")?.status).toBe("COMPLETED");
  });

  it("leaves the cache alone when the step belongs to another pathway", () => {
    const result = applyStepStatus(active, {
      stepId: "other",
      status: "COMPLETED",
      progress: nextProgress,
    });
    expect(result).toBe(active);
  });
});

describe("describeProgress", () => {
  it("pluralises steps", () => {
    expect(describeProgress(0, 1)).toBe("0 of 1 step complete");
    expect(describeProgress(2, 5)).toBe("2 of 5 steps complete");
  });
});
