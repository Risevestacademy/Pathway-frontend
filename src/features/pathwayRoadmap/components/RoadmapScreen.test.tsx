import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayCardsState } from "../hooks/usePathwayCards";
import { RoadmapScreen } from "./RoadmapScreen";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(cleanup);

const show = (state: PathwayCardsState, onRetry = vi.fn()) => {
  render(<RoadmapScreen state={state} onRetry={onRetry} />);
  return onRetry;
};

const cards = [
  {
    careerId: "c1",
    title: "Frontend Developer",
    isActive: true,
    currentStep: { title: "HTML", description: "Structure pages." },
    xp: 0,
  },
  { careerId: "c2", title: "UX Designer", isActive: false, currentStep: null, xp: 0 },
];

describe("RoadmapScreen", () => {
  it("is headed Roadmap, with a line about what it shows", () => {
    show({ kind: "ready", cards });

    expect(screen.getByRole("heading", { level: 1, name: "Roadmap" })).toBeTruthy();
    expect(screen.getByText("See your active career pathways and track your progress.")).toBeTruthy();
  });

  it("shows a card for each pathway, in the order given", () => {
    show({ kind: "ready", cards });

    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Frontend Developer",
      "UX Designer",
    ]);
  });

  it("says so, and points to Explore, when there are no saved pathways", () => {
    show({ kind: "ready", cards: [] });

    expect(screen.getByText("No pathways saved yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore careers" }).getAttribute("href")).toBe("/careers");
  });

  it("says it is loading", () => {
    show({ kind: "loading" });

    expect(screen.getByRole("status").textContent).toContain("Loading your pathways");
  });

  it("asks someone who isn't signed in to sign in", () => {
    show({ kind: "signed-out" });

    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/login");
  });

  it("offers a retry when the pathways can't be loaded", () => {
    const onRetry = show({ kind: "error" });

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load your pathways");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("keeps the heading in every state", () => {
    show({ kind: "loading" });

    expect(screen.getByRole("heading", { level: 1, name: "Roadmap" })).toBeTruthy();
  });
});
