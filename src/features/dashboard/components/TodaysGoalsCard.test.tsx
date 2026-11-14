import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { DashboardSummary } from "../dashboard.utils";
import { TodaysGoalsCard } from "./TodaysGoalsCard";

afterEach(cleanup);

const summary = (pathwaysCount: number): DashboardSummary => ({
  hasActivePathway: pathwaysCount > 0,
  progressPercent: 0,
  completedSteps: 0,
  totalSteps: 0,
  nextStepId: null,
  pathwaysCount,
});

const THURSDAY = new Date(2026, 10, 12);

describe("TodaysGoalsCard", () => {
  it("shows the week with today marked", () => {
    render(<TodaysGoalsCard summary={summary(0)} today={THURSDAY} />);

    const week = screen.getByRole("list", { name: "This week" });
    expect(within(week).getAllByRole("listitem")).toHaveLength(7);
    expect(within(week).getByText("THU").closest("li")?.getAttribute("aria-current")).toBe("date");
    expect(within(week).getByText("MON").closest("li")?.getAttribute("aria-current")).toBeNull();
  });

  it("lists the goals as unchecked, with no XP chips", () => {
    render(<TodaysGoalsCard summary={summary(0)} today={THURSDAY} />);

    const goals = within(screen.getByRole("list", { name: "Goals" })).getAllByRole("listitem");
    expect(goals).toHaveLength(3);
    expect(screen.getByText("Build your first pathway")).toBeTruthy();
    expect(screen.queryByText(/XP/)).toBeNull();
    expect(screen.queryByText(/done/i)).toBeNull();
  });

  it("marks a finished goal as done for screen readers", () => {
    render(<TodaysGoalsCard summary={summary(1)} today={THURSDAY} />);

    const goal = screen.getByText("Build your first pathway").closest("li");
    expect(within(goal as HTMLElement).getByText("Done")).toBeTruthy();
    expect(screen.getAllByText("Done")).toHaveLength(1);
  });
});
