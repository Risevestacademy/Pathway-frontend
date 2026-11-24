import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import type { PathwayTaskDetailDto } from "../../lib/api/pathwayTasks.api";
import { TaskBriefScreen } from "./TaskBriefScreen";

const completionMutate = vi.fn();
const checklistMutate = vi.fn();
type Mutation = { isPending: boolean; isError: boolean; error: unknown; variables?: unknown };
const idle: Mutation = { isPending: false, isError: false, error: null };
let completion: Mutation = idle;
let checklist: Mutation = idle;

vi.mock("./useTaskMutations", () => ({
  useSetTaskCompletion: () => ({ mutate: completionMutate, ...completion }),
  useSetChecklistItem: () => ({ mutate: checklistMutate, ...checklist }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)}>
      {children}
    </a>
  ),
}));
vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("../feedback/components/ReportIssueLink", () => ({
  ReportIssueLink: ({ subject, about }: { subject: string; about: string }) => (
    <button type="button">{`Report a problem with ${subject} | ${about}`}</button>
  ),
}));

beforeEach(() => {
  completion = idle;
  checklist = idle;
});
afterEach(() => {
  cleanup();
  completionMutate.mockReset();
  checklistMutate.mockReset();
});

const task: PathwayTaskDetailDto = {
  id: "t1",
  title: "Pick one of your favourite apps",
  goal: "Recreate one screen from an app you like.",
  estimatedWeeks: 3,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 1,
  checklistTotal: 3,
  stepId: "s3",
  whatToMake: ["Pick an app.", "Build it with frames."],
  hints: ["Start with the biggest frame.", "Use auto layout."],
  checklist: [
    { id: "i1", text: "I recreated one full screen", isChecked: true, checkedAt: "2026-11-20T10:00:00.000Z" },
    { id: "i2", text: "I used frames, text and shapes", isChecked: false, checkedAt: null },
    { id: "i3", text: "I can explain what each part is for", isChecked: false, checkedAt: null },
  ],
  helpfulLinks: [
    { id: "r1", title: "Learn Design basics", provider: "Figma", type: "COURSE", costStatus: "FREE", url: "https://figma.com" },
  ],
};

const screenOf = (over: Partial<Parameters<typeof TaskBriefScreen>[0]> = {}) =>
  render(
    <TaskBriefScreen
      careerId="c1"
      careerTitle="Product Designer"
      pathwayId="p1"
      stage={{ id: "g1", title: "Foundations" }}
      step={{ id: "s3", number: 3, title: "Get comfortable in Figma" }}
      task={task}
      {...over}
    />,
  );

describe("TaskBriefScreen", () => {
  it("has a way back to the practice tasks", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway/$careerId/tasks");
  });

  it("names the stage and step above the heading, and shows what kind of thing it is and how long it takes", () => {
    screenOf();

    expect(screen.getByText("Foundations · Step 3 · Get comfortable in Figma")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Get comfortable in Figma" })).toBeTruthy();
    expect(screen.getByText("Task")).toBeTruthy();
    expect(screen.getByText("3 weeks")).toBeTruthy();
  });

  it("falls back to the task's own title when no step can be named", () => {
    screenOf({ stage: null, step: null });

    expect(screen.getByRole("heading", { level: 1, name: "Pick one of your favourite apps" })).toBeTruthy();
    expect(screen.queryByText(/· Step/)).toBeNull();
  });

  it("states the goal", () => {
    screenOf();

    const card = screen.getByRole("region", { name: "Goal" });
    expect(within(card).getByText("Recreate one screen from an app you like.")).toBeTruthy();
  });

  it("lists what to make, and the hints, numbered", () => {
    screenOf();

    const make = screen.getByRole("region", { name: "What to make" });
    expect(within(make).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "1Pick an app.",
      "2Build it with frames.",
    ]);
    const hints = screen.getByRole("region", { name: "Hints" });
    expect(within(hints).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "1Start with the biggest frame.",
      "2Use auto layout.",
    ]);
  });

  it("leaves out a card the backend has nothing for", () => {
    screenOf({ task: { ...task, whatToMake: [], hints: [], helpfulLinks: [], goal: "" } });

    expect(screen.queryByRole("region", { name: "What to make" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Hints" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Helpful links" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Goal" })).toBeNull();
  });

  it("lists the helpful links with who they are by, their type and cost, and links to each resource", () => {
    screenOf();

    const card = screen.getByRole("region", { name: "Helpful links" });
    expect(within(card).getByText("Learn Design basics")).toBeTruthy();
    expect(within(card).getByText("by Figma · Course · Free")).toBeTruthy();
    expect(within(card).getByRole("link", { name: "View details" }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources/r1",
    );
  });

  describe("check your own work", () => {
    const panel = () => within(screen.getByRole("region", { name: "Check your own work" }));

    it("explains that the list is for them to decide whether the task is done", () => {
      screenOf();

      expect(panel().getByText("Use this list to decide for yourself whether the task is done.")).toBeTruthy();
    });

    it("shows each checklist item, ticked or not", () => {
      screenOf();

      expect((panel().getByRole("checkbox", { name: "I recreated one full screen" }) as HTMLInputElement).checked).toBe(true);
      expect((panel().getByRole("checkbox", { name: "I used frames, text and shapes" }) as HTMLInputElement).checked).toBe(false);
    });

    it("saves an item when it is ticked, and unticks it when it is ticked again", () => {
      screenOf();

      fireEvent.click(panel().getByRole("checkbox", { name: "I used frames, text and shapes" }));
      fireEvent.click(panel().getByRole("checkbox", { name: "I recreated one full screen" }));

      expect(checklistMutate).toHaveBeenNthCalledWith(1, { itemId: "i2", checked: true });
      expect(checklistMutate).toHaveBeenNthCalledWith(2, { itemId: "i1", checked: false });
    });

    it("holds the item that is being saved, and no other", () => {
      checklist = { isPending: true, isError: false, error: null, variables: { itemId: "i2", checked: true } };
      screenOf();

      expect((panel().getByRole("checkbox", { name: "I used frames, text and shapes" }) as HTMLInputElement).disabled).toBe(true);
      expect((panel().getByRole("checkbox", { name: "I recreated one full screen" }) as HTMLInputElement).disabled).toBe(false);
    });

    it("marks the task done from the button, and says the work isn't marked by anyone", () => {
      screenOf();

      fireEvent.click(panel().getByRole("button", { name: "Mark task as done" }));

      expect(completionMutate).toHaveBeenCalledWith({ taskId: "t1", completed: true });
      expect(panel().getByText("We do not collect or mark your work. You decide when it is done.")).toBeTruthy();
    });

    it("says it is saving while the task is being marked", () => {
      completion = { isPending: true, isError: false, error: null };
      screenOf();

      const button = panel().getByRole("button", { name: "Saving" }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it("lets a done task be reopened", () => {
      screenOf({ task: { ...task, isCompleted: true, completedAt: "2026-11-23T15:00:00.000Z" } });

      expect(panel().queryByRole("button", { name: "Mark task as done" })).toBeNull();
      expect(panel().getByText("You marked this task done.")).toBeTruthy();

      fireEvent.click(panel().getByRole("button", { name: "Mark task as not done" }));

      expect(completionMutate).toHaveBeenCalledWith({ taskId: "t1", completed: false });
    });

    it("says it couldn't save the task, or an item", () => {
      completion = { isPending: false, isError: true, error: new Error("offline") };
      screenOf();

      expect(panel().getByRole("alert").textContent).toContain("We couldn’t save that. Try again.");
    });

    it("says the pathway has to be saved first when the server answers 409", () => {
      checklist = { isPending: false, isError: true, error: new CareerNotSavedError() };
      screenOf();

      expect(panel().getByRole("alert").textContent).toContain("Start tracking this pathway to save your progress.");
    });

    it("leaves out the checklist, but keeps the button, when the task has none", () => {
      screenOf({ task: { ...task, checklist: [], checklistChecked: 0, checklistTotal: 0 } });

      expect(panel().queryAllByRole("checkbox")).toHaveLength(0);
      expect(panel().getByRole("button", { name: "Mark task as done" })).toBeTruthy();
    });

    it("offers to report a problem with the task", () => {
      screenOf();

      expect(
        panel().getByRole("button", {
          name: "Report a problem with Pick one of your favourite apps | Product Designer · Get comfortable in Figma",
        }),
      ).toBeTruthy();
    });
  });
});
