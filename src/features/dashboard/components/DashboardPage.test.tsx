import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { useAuthStore } from "../../../lib/stores/authStore";
import type { DashboardDto } from "../../../lib/api/dashboard.api";
import type { DashboardSummaryState } from "../hooks/useDashboardSummary";
import { DashboardPage } from "./DashboardPage";

let state: DashboardSummaryState;
const retry = vi.fn();
vi.mock("../hooks/useDashboardSummary", () => ({
  useDashboardSummary: () => ({ state, retry }),
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 13, 9, 0));
  act(() => {
    useAuthStore
      .getState()
      .setAuth({ id: "u1", email: "a@b.c", role: "USER", fullName: "Maya Okafor" }, "token");
  });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  retry.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const dashboard: DashboardDto = {
  totals: { savedPathways: 2, completedSteps: 9, xp: 0, badgesEarned: 0, badgesTotal: 0 },
  streak: { current: 0, longest: 0 },
  weekStrip: { days: [], currentStreak: 0 },
  heatmap: { from: "2025-11-14", to: "2026-11-13", days: [{ date: "2026-11-13", count: 3 }] },
  badges: [],
  activePathway: null,
  currentProject: null,
  goals: [],
};

const ready = (overrides = {}, withDashboard: DashboardDto = dashboard): DashboardSummaryState => ({
  kind: "ready",
  dashboard: withDashboard,
  summary: {
    hasActivePathway: true,
    progressPercent: 38,
    completedSteps: 3,
    totalCompletedSteps: 9,
    totalSteps: 8,
    nextStepId: "s4",
    pathwaysCount: 2,
    ...overrides,
  },
});

describe("DashboardPage", () => {
  it("greets someone with an active pathway and shows their numbers", async () => {
    state = ready();
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Good Morning, Maya" })).toBeTruthy();
    expect(screen.getByText("38%")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Today's Goals" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Current Projects" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Activity" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Trophies" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pathways" }).parentElement?.textContent).toContain("2");
    expect(screen.getByRole("heading", { name: "Steps Completed" }).parentElement?.textContent).toContain("9");
  });

  it("shows the activity from the dashboard on the heatmap", async () => {
    state = ready();
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("img", { name: "3 activities in the last year" })).toBeTruthy();
  });

  it("shows the badges the person has earned", async () => {
    state = ready(
      {},
      {
        ...dashboard,
        totals: { ...dashboard.totals, badgesEarned: 1, badgesTotal: 4 },
        badges: [
          {
            id: "b1",
            name: "First Step",
            description: "Completed a step",
            iconKey: "star",
            xpThreshold: 10,
            awardedAt: "2026-11-10T08:00:00.000Z",
          },
        ],
      },
    );
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByText("First Step")).toBeTruthy();
    expect(screen.getByText("of 4")).toBeTruthy();
  });

  it("shows today's goals from the dashboard", async () => {
    state = ready(
      {},
      {
        ...dashboard,
        goals: [
          { kind: "STEP", id: "g1", title: "Learn flexbox", xp: 20, done: false, goalDescription: "Build a layout" },
        ],
      },
    );
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByText("Learn flexbox")).toBeTruthy();
    expect(screen.getByText("+20 XP")).toBeTruthy();
  });

  it("says Good Afternoon in the afternoon", async () => {
    vi.setSystemTime(new Date(2026, 10, 13, 14, 30));
    state = ready();
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Good Afternoon, Maya" })).toBeTruthy();
  });

  it("uses the first name when the backend sends no full name", async () => {
    act(() => {
      useAuthStore
        .getState()
        .setAuth({ id: "u1", email: "a@b.c", role: "USER", firstName: "Ada", fullName: undefined }, "token");
    });
    state = ready();
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Good Morning, Ada" })).toBeTruthy();
  });

  it("welcomes someone with no pathway and shows zeros", async () => {
    state = ready({
      hasActivePathway: false,
      progressPercent: 0,
      completedSteps: 0,
      totalCompletedSteps: 0,
      totalSteps: 0,
      nextStepId: null,
      pathwaysCount: 0,
    });
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Welcome, Maya" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Build my pathway" })).toBeTruthy();
  });

  it("shows a loading state while the numbers arrive", async () => {
    state = { kind: "loading" };
    await renderWithRouter(() => <DashboardPage />);

    expect(screen.getByRole("status", { name: /loading your dashboard/i })).toBeTruthy();
  });

  it("shows an error with a way to try again", async () => {
    state = { kind: "error" };
    await renderWithRouter(() => <DashboardPage />);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalled();
  });
});
