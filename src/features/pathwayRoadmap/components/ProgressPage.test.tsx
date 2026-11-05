import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayProgressState } from "../hooks/usePathwayProgress";
import { ProgressPage } from "./ProgressPage";

const usePathwayProgress = vi.fn();

vi.mock("../hooks/usePathwayProgress", () => ({
  usePathwayProgress: (careerId: string) => usePathwayProgress(careerId),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./ProgressScreen", () => ({
  ProgressScreen: ({ careerTitle }: { careerTitle: string }) => <p>{`Progress: ${careerTitle}`}</p>,
}));

afterEach(() => {
  cleanup();
  usePathwayProgress.mockReset();
});

const have = (state: PathwayProgressState, retry = vi.fn()) => {
  usePathwayProgress.mockReturnValue({ state, retry });
  return retry;
};

describe("ProgressPage", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    render(<ProgressPage careerId="c1" />);

    expect(usePathwayProgress).toHaveBeenCalledWith("c1");
  });

  it("says it is loading, with a way back", () => {
    have({ kind: "loading" });

    render(<ProgressPage careerId="c1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading your progress");
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway");
  });

  it("offers a retry when the progress can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<ProgressPage careerId="c1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load your progress");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<ProgressPage careerId="c1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
  });

  it("shows the progress once loaded", () => {
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      overview: { steps: [], nextStepId: null, completed: 0, total: 0, started: false, upNext: null },
      groups: [],
      activation: null,
    });

    render(<ProgressPage careerId="c1" />);

    expect(screen.getByText("Progress: Product Designer")).toBeTruthy();
  });
});
