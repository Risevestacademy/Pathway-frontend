import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { RoadmapStep } from "../pathway.types";
import RoadmapStepList from "./RoadmapStepList";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(cleanup);

const step = (id: string, title: string, over: Partial<RoadmapStep> = {}): RoadmapStep => ({
  stepId: id,
  title,
  learningObjective: `Learn ${title}`,
  prerequisites: [],
  expectedEvidence: "",
  resourceIds: [],
  ...over,
});

const steps = [step("s1", "HTML"), step("s2", "CSS", { requiredPrerequisiteStepId: "s1" })];

describe("RoadmapStepList", () => {
  it("lists the steps in order, each a link to its page", () => {
    render(<RoadmapStepList careerId="c1" steps={steps} />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/careers/c1/roadmap/s1",
      "/careers/c1/roadmap/s2",
    ]);
    expect(screen.getByText("Learn HTML")).toBeTruthy();
  });

  it("shows what a step needs first", () => {
    render(<RoadmapStepList careerId="c1" steps={steps} />);

    expect(screen.getByText(/Requires step 1/)).toBeTruthy();
  });

  it("is only for reading: nothing on it tracks progress or marks a step done", () => {
    // Even if a caller still hands it someone's progress, it doesn't show it.
    const tracking = { statuses: { s1: "COMPLETED" }, nextStepId: "s2", startStepId: "s1" };
    const props = { careerId: "c1", steps, tracking } as unknown as Parameters<typeof RoadmapStepList>[0];

    render(<RoadmapStepList {...props} />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("Up next")).toBeNull();
    expect(screen.queryByText("Your starting point")).toBeNull();
    expect(screen.queryByText(/\(done\)/)).toBeNull();
  });
});
