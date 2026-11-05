import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { YourRoadmapCard, type RoadmapStepRow } from "./YourRoadmapCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(cleanup);

const steps: RoadmapStepRow[] = [
  { id: "s1", number: 1, title: "Foundations", description: "Learn what design is and use Figma", status: "NOT_STARTED" },
  { id: "s2", number: 2, title: "Core Skills", description: "Research, wireframe, prototype, test", status: "NOT_STARTED" },
  { id: "s3", number: 3, title: "Practical Experience", description: "Redesign an app, solve a local problem", status: "NOT_STARTED" },
];

const card = (over: Partial<Parameters<typeof YourRoadmapCard>[0]> = {}) =>
  render(<YourRoadmapCard careerId="career-1" steps={steps} nextStepId="s1" {...over} />);

describe("YourRoadmapCard", () => {
  it("is a titled section that says how to use it", () => {
    card();

    const section = screen.getByRole("region", { name: "Your roadmap" });
    expect(within(section).getByRole("heading", { level: 2, name: "Your roadmap" })).toBeTruthy();
    expect(
      within(section).getByText(
        "Do the steps in order. Later steps build on earlier ones, but you can look ahead.",
      ),
    ).toBeTruthy();
  });

  it("lists every step in order with its number, title and what it covers", () => {
    card();

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText("1")).toBeTruthy();
    expect(within(rows[0]).getByText("Foundations")).toBeTruthy();
    expect(within(rows[0]).getByText("Learn what design is and use Figma")).toBeTruthy();
    expect(within(rows[2]).getByText("Practical Experience")).toBeTruthy();
  });

  it("shows where each step stands", () => {
    card({
      steps: [
        { ...steps[0], status: "COMPLETED" },
        { ...steps[1], status: "IN_PROGRESS" },
        { ...steps[2], status: "NOT_STARTED" },
      ],
      nextStepId: "s2",
    });

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("Complete")).toBeTruthy();
    expect(within(rows[1]).getByText("In progress")).toBeTruthy();
    expect(within(rows[2]).getByText("Not started")).toBeTruthy();
  });

  it("marks the step that is up next", () => {
    card({ nextStepId: "s2" });

    const rows = screen.getAllByRole("listitem");
    expect(rows[1].getAttribute("aria-current")).toBe("step");
    expect(rows[0].getAttribute("aria-current")).toBeNull();
    expect(within(rows[1]).getByText("(up next)")).toBeTruthy();
  });

  it("marks none when there is no next step", () => {
    card({ nextStepId: null });

    for (const row of screen.getAllByRole("listitem")) {
      expect(row.getAttribute("aria-current")).toBeNull();
    }
  });

  it("opens a step from its title", () => {
    card();

    const link = screen.getByRole("link", { name: /Foundations/ });
    expect(link.getAttribute("href")).toBe("/careers/$careerId/roadmap/$stepId");
  });

  it("says so when the pathway has no steps", () => {
    card({ steps: [], nextStepId: null });

    expect(screen.getByText("This roadmap has no steps yet")).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
  });
});
