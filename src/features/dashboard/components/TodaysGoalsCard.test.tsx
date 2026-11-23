import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { DashboardDto, DashboardGoalDto } from "../../../lib/api/dashboard.api";
import { TodaysGoalsCard } from "./TodaysGoalsCard";

afterEach(cleanup);

const THURSDAY = "2026-11-12";
const noWeek: DashboardDto["weekStrip"] = { days: [], currentStreak: 0 };

const goal = (overrides: Partial<DashboardGoalDto> = {}): DashboardGoalDto => ({
  kind: "STEP",
  id: "g1",
  title: "Learn flexbox",
  xp: 20,
  done: false,
  goalDescription: "Build a centred layout",
  ...overrides,
});

describe("TodaysGoalsCard", () => {
  it("shows the week with today marked", () => {
    render(<TodaysGoalsCard goals={[]} weekStrip={noWeek} today={THURSDAY} />);

    const week = screen.getByRole("list", { name: "This week" });
    expect(within(week).getAllByRole("listitem")).toHaveLength(7);
    expect(within(week).getByText("THU").closest("li")?.getAttribute("aria-current")).toBe("date");
    expect(within(week).getByText("MON").closest("li")?.getAttribute("aria-current")).toBeNull();
  });

  it("marks the days the person was active, for screen readers too", () => {
    render(
      <TodaysGoalsCard
        goals={[]}
        today={THURSDAY}
        weekStrip={{
          currentStreak: 2,
          days: [
            { date: "2026-11-11", active: true },
            { date: "2026-11-12", active: false },
          ],
        }}
      />,
    );

    const week = screen.getByRole("list", { name: "This week" });
    const [wed, thu] = within(week).getAllByRole("listitem");
    expect(within(wed).getByText("Active")).toBeTruthy();
    expect(within(thu).queryByText("Active")).toBeNull();
  });

  it("lists the goals with their XP and description", () => {
    render(<TodaysGoalsCard goals={[goal(), goal({ id: "g2", title: "Read a guide", xp: 5 })]} weekStrip={noWeek} today={THURSDAY} />);

    const items = within(screen.getByRole("list", { name: "Goals" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Learn flexbox")).toBeTruthy();
    expect(within(items[0]).getByText("Build a centred layout")).toBeTruthy();
    expect(within(items[0]).getByText("+20 XP")).toBeTruthy();
    expect(within(items[1]).getByText("+5 XP")).toBeTruthy();
  });

  it("shows no XP badge for a goal that awards none", () => {
    render(<TodaysGoalsCard goals={[goal({ kind: "CHECKLIST", xp: null })]} weekStrip={noWeek} today={THURSDAY} />);

    expect(screen.getByText("Learn flexbox")).toBeTruthy();
    expect(screen.queryByText(/XP/)).toBeNull();
    expect(screen.queryByText(/null/)).toBeNull();
  });

  it("skips the description line when a goal has none", () => {
    render(<TodaysGoalsCard goals={[goal({ goalDescription: null })]} weekStrip={noWeek} today={THURSDAY} />);

    expect(screen.getByText("Learn flexbox")).toBeTruthy();
    expect(screen.queryByText("null")).toBeNull();
  });

  it("marks a finished goal as done for screen readers", () => {
    render(<TodaysGoalsCard goals={[goal({ done: true }), goal({ id: "g2", title: "Read a guide" })]} weekStrip={noWeek} today={THURSDAY} />);

    const done = screen.getByText("Learn flexbox").closest("li");
    expect(within(done as HTMLElement).getByText("Done")).toBeTruthy();
    expect(screen.getAllByText("Done")).toHaveLength(1);
  });

  it("says there are no goals yet instead of inventing some", () => {
    render(<TodaysGoalsCard goals={[]} weekStrip={noWeek} today={THURSDAY} />);

    expect(screen.queryByRole("list", { name: "Goals" })).toBeNull();
    expect(screen.getByText("No goals for today yet.")).toBeTruthy();
  });
});
