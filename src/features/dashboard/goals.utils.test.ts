import { describe, expect, it } from "vitest";
import type { DashboardSummary } from "./dashboard.utils";
import { buildTodaysGoals, buildWeek } from "./goals.utils";

const summary = (pathwaysCount: number): DashboardSummary => ({
  hasActivePathway: pathwaysCount > 0,
  progressPercent: 0,
  completedSteps: 0,
  totalSteps: 0,
  nextStepId: null,
  pathwaysCount,
});

describe("buildTodaysGoals", () => {
  it("lists the three goals, none done for someone with no pathway", () => {
    expect(buildTodaysGoals(summary(0))).toEqual([
      { id: "explore", title: "Explore a career that interests you", done: false },
      { id: "build", title: "Build your first pathway", done: false },
      { id: "compare", title: "Save a career to compare", done: false },
    ]);
  });

  it("ticks 'Build your first pathway' once they have a pathway, and nothing else", () => {
    const done = buildTodaysGoals(summary(1)).filter((goal) => goal.done);

    expect(done.map((goal) => goal.id)).toEqual(["build"]);
  });
});

describe("buildWeek", () => {
  it("runs Monday to Sunday", () => {
    expect(buildWeek(new Date(2026, 10, 13)).map((day) => day.label)).toEqual([
      "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN",
    ]);
  });

  it.each([
    [new Date(2026, 10, 9), "MON"], // Monday
    [new Date(2026, 10, 12), "THU"],
    [new Date(2026, 10, 15), "SUN"], // Sunday is getDay() 0
  ])("marks only today (%s) as today", (date, label) => {
    const today = buildWeek(date).filter((day) => day.isToday);

    expect(today.map((day) => day.label)).toEqual([label]);
  });
});
