import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { PathwayOverview } from "../overview.utils";
import { OverviewScreen } from "./OverviewScreen";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLink: ({ label = "Back" }: { label?: string }) => <button type="button">{label}</button>,
}));

afterEach(cleanup);

const overview: PathwayOverview = {
  steps: [
    { id: "s1", number: 1, title: "Foundations", description: "Learn Figma", status: "NOT_STARTED" },
    { id: "s2", number: 2, title: "Core Skills", description: "Prototype", status: "NOT_STARTED" },
  ],
  nextStepId: "s1",
  completed: 0,
  total: 2,
  started: false,
  upNext: { id: "s1", number: 1, title: "Foundations", resourceCount: 1 },
};

const screenOf = (over: Partial<PathwayOverview> = {}) =>
  render(<OverviewScreen careerId="c1" careerTitle="Product Designer" overview={{ ...overview, ...over }} />);

describe("OverviewScreen", () => {
  it("has a way back", () => {
    screenOf();

    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });

  it("is headed with the career, and says how many steps it has", () => {
    screenOf();

    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
    expect(screen.getByText("2 steps. You mark each step complete yourself.")).toBeTruthy();
  });

  it("shows the pathway's sections under the hero, with Overview current", () => {
    screenOf();

    const tabs = screen.getByRole("navigation", { name: "Pathway sections" });
    expect(tabs.textContent).toContain("Resources");
    expect(screen.getByText("Overview").getAttribute("aria-current")).toBe("page");
    const hero = screen.getByRole("heading", { level: 1 });
    expect(hero.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("lists the roadmap", () => {
    screenOf();

    expect(screen.getByRole("region", { name: "Your roadmap" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Core Skills/ })).toBeTruthy();
  });

  it("shows the step up next, with a way to start it", () => {
    screenOf();

    expect(screen.getByRole("region", { name: "Step 1 · Foundations" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start step 1" })).toBeTruthy();
  });

  it("offers to continue the step up next once they have started", () => {
    screenOf({ started: true, completed: 1 });

    expect(screen.getByRole("link", { name: "Continue step 1" })).toBeTruthy();
  });

  it("shows the overall progress", () => {
    screenOf({ completed: 1 });

    expect(screen.getByText("1 of 2 steps complete")).toBeTruthy();
  });

  it("says they finished, in place of the up next card, once every step is complete", () => {
    screenOf({ upNext: null, nextStepId: null, completed: 2 });

    expect(screen.queryByText("Up next")).toBeNull();
    expect(screen.getByRole("region", { name: "You finished your pathway" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Overall progress" })).toBeTruthy();
  });

  it("doesn't say they finished while a step is still up next", () => {
    screenOf({ completed: 1 });

    expect(screen.queryByText("You finished your pathway")).toBeNull();
  });

  it("shows neither card for a roadmap with no steps", () => {
    screenOf({ steps: [], upNext: null, nextStepId: null, completed: 0, total: 0 });

    expect(screen.queryByText("Up next")).toBeNull();
    expect(screen.queryByText("You finished your pathway")).toBeNull();
  });
});
