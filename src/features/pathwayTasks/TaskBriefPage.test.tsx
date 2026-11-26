import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TaskBriefPage } from "./TaskBriefPage";
import type { PathwayTaskState } from "./usePathwayTask";

const usePathwayTask = vi.fn();

vi.mock("./usePathwayTask", () => ({
  usePathwayTask: (careerId: string, taskId: string) => usePathwayTask(careerId, taskId),
}));
vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./TaskBriefScreen", () => ({
  TaskBriefScreen: ({ task }: { task: { title: string } }) => <p>{`Brief: ${task.title}`}</p>,
}));

afterEach(() => {
  cleanup();
  usePathwayTask.mockReset();
});

const have = (state: PathwayTaskState, retry = vi.fn()) => {
  usePathwayTask.mockReturnValue({ state, retry });
  return retry;
};

describe("TaskBriefPage", () => {
  it("asks for the task it is given, in its career", () => {
    have({ kind: "loading" });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(usePathwayTask).toHaveBeenCalledWith("c1", "t1");
  });

  it("says it is loading, with a way back to the practice tasks", () => {
    have({ kind: "loading" });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading this task");
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway/$careerId/tasks");
  });

  it("offers a retry when the task can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load this task");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
  });

  it("says so when the task can't be found", () => {
    have({ kind: "not-found" });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(screen.getByText("We couldn’t find that task")).toBeTruthy();
  });

  it("shows the brief once loaded", () => {
    have({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Product Designer",
      stage: { id: "g1", title: "Foundations" },
      step: { id: "s1", number: 1, title: "One" },
      task: {
        id: "t1",
        title: "Sketch a flow",
        goal: "",
        estimatedWeeks: 1,
        isCompleted: false,
        completedAt: null,
        checklistChecked: 0,
        checklistTotal: 0,
        stepId: "s1",
        whatToMake: [],
        hints: [],
        checklist: [],
        helpfulLinks: [],
      },
    });

    render(<TaskBriefPage careerId="c1" taskId="t1" />);

    expect(screen.getByText("Brief: Sketch a flow")).toBeTruthy();
  });
});
