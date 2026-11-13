import { describe, expect, it } from "vitest";
import type { ActivePathwayDto, SavedPathwayDto } from "../../lib/api/progress.api";
import { buildDashboardSummary, dashboardGreeting, greetingName } from "./dashboard.utils";

const saved = (id: string, isActive = false): SavedPathwayDto => ({
  career: { id, slug: id, title: id, retired: false },
  isActive,
  progress: { completed: 0, total: 0, percentage: 0 },
});

const active: ActivePathwayDto = {
  career: { id: "c1", slug: "c1", title: "Frontend", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Roadmap" },
  progress: {
    completed: 3,
    total: 8,
    percentage: 37.5,
    nextStepId: "s4",
    selfReported: true,
    startStepId: null,
  },
  steps: [],
};

const noActive: ActivePathwayDto = { career: null, pathway: null, progress: null, steps: [] };

describe("buildDashboardSummary", () => {
  it("reports the active pathway's progress, rounded to a whole percent", () => {
    expect(buildDashboardSummary(active, [saved("c1", true)])).toEqual({
      hasActivePathway: true,
      progressPercent: 38,
      completedSteps: 3,
      totalSteps: 8,
      nextStepId: "s4",
      pathwaysCount: 1,
    });
  });

  it("counts completed steps for the active pathway only, not other saved ones", () => {
    const other = { ...saved("c2"), progress: { completed: 5, total: 5, percentage: 100 } };

    const summary = buildDashboardSummary(active, [saved("c1", true), other]);

    expect(summary.completedSteps).toBe(3);
    expect(summary.pathwaysCount).toBe(2);
  });

  it("is empty with zeros when there is no active pathway", () => {
    expect(buildDashboardSummary(noActive, [])).toEqual({
      hasActivePathway: false,
      progressPercent: 0,
      completedSteps: 0,
      totalSteps: 0,
      nextStepId: null,
      pathwaysCount: 0,
    });
  });

  it("still counts saved pathways when none of them is active", () => {
    const summary = buildDashboardSummary(noActive, [saved("c2")]);

    expect(summary.hasActivePathway).toBe(false);
    expect(summary.pathwaysCount).toBe(1);
  });
});

describe("dashboardGreeting", () => {
  it("says Good Morning, with the first name, once there is an active pathway", () => {
    expect(dashboardGreeting("Maya Okafor", true)).toBe("Good Morning, Maya");
  });

  it("says Welcome when there is no active pathway", () => {
    expect(dashboardGreeting("Maya", false)).toBe("Welcome, Maya");
  });

  it("drops the name when there isn't one", () => {
    expect(dashboardGreeting(undefined, true)).toBe("Good Morning");
    expect(dashboardGreeting("  ", false)).toBe("Welcome");
  });
});

describe("greetingName", () => {
  it("prefers the first name", () => {
    expect(greetingName({ firstName: "Maya", fullName: "Maya Okafor" })).toBe("Maya");
  });

  it("falls back to the first word of the full name, then of name", () => {
    expect(greetingName({ firstName: null, fullName: "Maya Okafor" })).toBe("Maya");
    expect(greetingName({ fullName: null, name: "Maya Okafor" })).toBe("Maya");
  });

  it("skips blank and missing names", () => {
    expect(greetingName({ firstName: "  ", fullName: "" })).toBeUndefined();
    expect(greetingName(null)).toBeUndefined();
  });
});
