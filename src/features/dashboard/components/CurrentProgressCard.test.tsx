import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderWithRouter } from "../../../test/renderWithRouter";
import type { DashboardSummary } from "../dashboard.utils";
import { CurrentProgressCard } from "./CurrentProgressCard";

afterEach(cleanup);

const summary = (overrides: Partial<DashboardSummary> = {}): DashboardSummary => ({
  hasActivePathway: true,
  progressPercent: 38,
  completedSteps: 3,
  totalSteps: 8,
  nextStepId: "s4",
  pathwaysCount: 1,
  ...overrides,
});

describe("CurrentProgressCard", () => {
  it("shows the percent, a progress bar and a link back into the pathway", async () => {
    await renderWithRouter(() => <CurrentProgressCard summary={summary()} />);

    expect(screen.getByText("38%")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("3");
    expect(screen.getByRole("link", { name: /continue your pathway/i }).getAttribute("href")).toBe(
      "/my-pathway",
    );
  });

  it("invites someone with no pathway to build one", async () => {
    await renderWithRouter(() => (
      <CurrentProgressCard
        summary={summary({ hasActivePathway: false, progressPercent: 0, completedSteps: 0, totalSteps: 0 })}
      />
    ));

    expect(screen.getByText("0%")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByRole("link", { name: "Build my pathway" }).getAttribute("href")).toBe("/careers");
  });
});
