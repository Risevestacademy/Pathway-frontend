import { describe, expect, it } from "vitest";
import type { DashboardDto } from "../../lib/api/dashboard.api";
import { buildDashboardSummary, dashboardGreeting, greetingName } from "./dashboard.utils";

const dashboard = (overrides: Partial<DashboardDto> = {}): DashboardDto => ({
  totals: { savedPathways: 2, completedSteps: 9, xp: 120, badgesEarned: 1, badgesTotal: 6 },
  streak: { current: 0, longest: 0 },
  weekStrip: { days: [], currentStreak: 0 },
  heatmap: { from: "2025-11-18", to: "2026-11-18", days: [] },
  badges: [],
  activePathway: {
    pathwayId: "p1",
    career: { id: "c1", title: "Frontend", description: "", retired: false },
    progress: { completed: 3, total: 8, percentage: 37.5, nextStepId: "s4", selfReported: true },
  },
  currentProject: null,
  goals: [],
  ...overrides,
});

describe("buildDashboardSummary", () => {
  it("reports the active pathway's progress, rounded to a whole percent", () => {
    expect(buildDashboardSummary(dashboard())).toEqual({
      hasActivePathway: true,
      progressPercent: 38,
      completedSteps: 3,
      totalCompletedSteps: 9,
      totalSteps: 8,
      nextStepId: "s4",
      pathwaysCount: 2,
    });
  });

  it("counts steps across every pathway for the total, not just the active one", () => {
    const summary = buildDashboardSummary(dashboard());

    expect(summary.completedSteps).toBe(3);
    expect(summary.totalCompletedSteps).toBe(9);
  });

  it("is empty with zeros for a new user", () => {
    const empty = dashboard({
      totals: { savedPathways: 0, completedSteps: 0, xp: 0, badgesEarned: 0, badgesTotal: 0 },
      activePathway: null,
    });

    expect(buildDashboardSummary(empty)).toEqual({
      hasActivePathway: false,
      progressPercent: 0,
      completedSteps: 0,
      totalCompletedSteps: 0,
      totalSteps: 0,
      nextStepId: null,
      pathwaysCount: 0,
    });
  });

  it("still counts saved pathways when none of them is active", () => {
    const summary = buildDashboardSummary(
      dashboard({ activePathway: null, totals: { ...dashboard().totals, savedPathways: 1 } }),
    );

    expect(summary.hasActivePathway).toBe(false);
    expect(summary.pathwaysCount).toBe(1);
  });
});


describe("dashboardGreeting", () => {
  const at = (hour: number, minute = 0) => new Date(2026, 10, 13, hour, minute);

  it.each([
    [5, "Good Morning"],
    [11, "Good Morning"],
    [12, "Good Afternoon"],
    [16, "Good Afternoon"],
    [17, "Good Evening"],
    [23, "Good Evening"],
    [0, "Good Evening"],
    [4, "Good Evening"],
  ])("with an active pathway, at %i:00 says %s, with the first name", (hour, greeting) => {
    expect(dashboardGreeting("Maya Okafor", true, at(hour))).toBe(`${greeting}, Maya`);
  });

  it("changes on the hour, not before", () => {
    expect(dashboardGreeting("Maya", true, at(11, 59))).toBe("Good Morning, Maya");
    expect(dashboardGreeting("Maya", true, at(12, 0))).toBe("Good Afternoon, Maya");
  });

  it("says Welcome at any time of day when there is no active pathway", () => {
    expect(dashboardGreeting("Maya", false, at(9))).toBe("Welcome, Maya");
    expect(dashboardGreeting("Maya", false, at(20))).toBe("Welcome, Maya");
  });

  it("drops the name when there isn't one", () => {
    expect(dashboardGreeting(undefined, true, at(9))).toBe("Good Morning");
    expect(dashboardGreeting("  ", false, at(9))).toBe("Welcome");
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
