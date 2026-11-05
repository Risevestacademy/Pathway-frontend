import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayOverviewState } from "../hooks/usePathwayOverview";
import { OverviewPage } from "./OverviewPage";

const usePathwayOverview = vi.fn();

vi.mock("../hooks/usePathwayOverview", () => ({
  usePathwayOverview: (careerId: string) => usePathwayOverview(careerId),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));

afterEach(() => {
  cleanup();
  usePathwayOverview.mockReset();
});

const have = (state: PathwayOverviewState, retry = vi.fn()) => {
  usePathwayOverview.mockReturnValue({ state, retry });
  return retry;
};

describe("OverviewPage", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    render(<OverviewPage careerId="c1" />);

    expect(usePathwayOverview).toHaveBeenCalledWith("c1");
  });

  it("says it is loading, with a way back", () => {
    have({ kind: "loading" });

    render(<OverviewPage careerId="c1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading your roadmap");
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("offers a retry when the roadmap can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<OverviewPage careerId="c1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load this roadmap");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<OverviewPage careerId="c1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("shows the career's pathway overview once loaded", () => {
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      overview: {
        steps: [{ id: "s1", number: 1, title: "Foundations", description: "Learn Figma", status: "NOT_STARTED" }],
        nextStepId: "s1",
        completed: 0,
        total: 1,
        started: false,
        upNext: { id: "s1", number: 1, title: "Foundations", resourceCount: 0 },
      },
      activation: null,
    });

    render(<OverviewPage careerId="c1" />);

    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start step 1" })).toBeTruthy();
  });
});
