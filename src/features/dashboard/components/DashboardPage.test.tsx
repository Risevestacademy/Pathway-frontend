import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { useAuthStore } from "../../../lib/stores/authStore";
import type { DashboardSummaryState } from "../hooks/useDashboardSummary";
import { DashboardPage } from "./DashboardPage";

let state: DashboardSummaryState;
const retry = vi.fn();
vi.mock("../hooks/useDashboardSummary", () => ({
  useDashboardSummary: () => ({ state, retry }),
}));

beforeEach(() => {
  act(() => {
    useAuthStore
      .getState()
      .setAuth({ id: "u1", email: "a@b.c", role: "USER", fullName: "Maya Okafor" }, "token");
  });
});

afterEach(() => {
  cleanup();
  retry.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const ready = (overrides = {}): DashboardSummaryState => ({
  kind: "ready",
  summary: {
    hasActivePathway: true,
    progressPercent: 38,
    completedSteps: 3,
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
    expect(screen.getByRole("heading", { name: "Pathways" }).parentElement?.textContent).toContain("2");
    expect(screen.getByRole("heading", { name: "Steps Completed" }).parentElement?.textContent).toContain("3");
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
