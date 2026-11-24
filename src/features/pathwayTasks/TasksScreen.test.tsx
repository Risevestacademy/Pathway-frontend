import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import type { PathwayTaskItemDto } from "../../lib/api/pathwayTasks.api";
import { TasksScreen } from "./TasksScreen";
import type { TaskSection } from "./taskSections.utils";

const mutate = vi.fn();
let mutation: { isPending: boolean; isError: boolean; error: unknown; variables?: { taskId: string } } = {
  isPending: false,
  isError: false,
  error: null,
};

vi.mock("./useTaskMutations", () => ({
  useSetTaskCompletion: () => ({ mutate, ...mutation }),
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

beforeEach(() => {
  mutation = { isPending: false, isError: false, error: null };
});
afterEach(() => {
  cleanup();
  mutate.mockReset();
});

const task = (id: string, over: Partial<PathwayTaskItemDto> = {}): PathwayTaskItemDto => ({
  id,
  title: `Task title ${id}`,
  goal: `Goal ${id}`,
  estimatedWeeks: 4,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 0,
  checklistTotal: 3,
  ...over,
});

const sections: TaskSection[] = [
  {
    id: "g1",
    title: "Foundations",
    done: 1,
    total: 4,
    steps: [
      { id: "s1", number: 1, title: "Learn what design is for", status: "COMPLETED", tasks: [task("a", { isCompleted: true })] },
      { id: "s2", number: 2, title: "Learn how people think", status: "NOT_STARTED", tasks: [task("b", { estimatedWeeks: 1 })] },
    ],
  },
  { id: "g2", title: "Core Skills", done: 0, total: 5, steps: [] },
];

const screenOf = (over: Partial<Parameters<typeof TasksScreen>[0]> = {}) =>
  render(
    <TasksScreen
      careerId="c1"
      careerTitle="Product Designer"
      stepCount={16}
      pathwayId="p1"
      sections={sections}
      {...over}
    />,
  );

const stageNav = () => within(screen.getByRole("navigation", { name: "Stages" }));

describe("TasksScreen", () => {
  it("has a way back to My Pathway, the career's hero, and the tabs with Practice tasks current", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway");
    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
    const tabs = screen.getByRole("navigation", { name: "Pathway sections" });
    expect(within(tabs).getByText("Practice tasks").getAttribute("aria-current")).toBe("page");
  });

  it("tells the hero how many stages there are", () => {
    screenOf();

    expect(screen.getByText("2 stages, 16 steps. You mark each step complete yourself.")).toBeTruthy();
  });

  it("lists the stages down the side, each with its steps complete", () => {
    screenOf();

    expect(stageNav().getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Foundations1 of 4",
      "Core Skills0 of 5",
    ]);
  });

  it("starts on the first stage, with its name and how many steps are complete", () => {
    screenOf();

    expect(screen.getByRole("heading", { level: 2, name: "Foundations" })).toBeTruthy();
    expect(screen.getByText("1 of 4 steps complete")).toBeTruthy();
    expect(stageNav().getByRole("button", { name: /Foundations/ }).getAttribute("aria-current")).toBe("true");
  });

  it("says each task is a brief to follow alone, and the tick is their own record", () => {
    screenOf();

    expect(
      screen.getByText("Each task is a brief you can follow alone. Tick a task when you decide it is done. It is your own record."),
    ).toBeTruthy();
  });

  it("lists each task with its step, the step's title, what the task is, its tags and how long it takes", () => {
    screenOf();

    const rows = within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Step 1")).toBeTruthy();
    expect(within(rows[0]).getByText("Learn what design is for")).toBeTruthy();
    expect(within(rows[0]).getByText("Task title a")).toBeTruthy();
    expect(within(rows[0]).getByText("Task")).toBeTruthy();
    expect(within(rows[0]).getByText("4 weeks")).toBeTruthy();
    expect(within(rows[1]).getByText("1 week")).toBeTruthy();
  });

  it("links each task to its brief", () => {
    screenOf();

    const rows = within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    expect(within(rows[0]).getByRole("link", { name: /View brief/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/tasks/a",
    );
    expect(within(rows[1]).getByRole("link", { name: /View brief/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/tasks/b",
    );
  });

  it("shows which tasks are ticked", () => {
    screenOf();

    expect((screen.getByRole("checkbox", { name: "Mark Task title a as done" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Mark Task title b as done" }) as HTMLInputElement).checked).toBe(false);
  });

  it("completes a task when it is ticked, for this pathway", () => {
    screenOf();

    fireEvent.click(screen.getByRole("checkbox", { name: "Mark Task title b as done" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "b", completed: true });
  });

  it("reopens a task when it is unticked", () => {
    screenOf();

    fireEvent.click(screen.getByRole("checkbox", { name: "Mark Task title a as done" }));

    expect(mutate).toHaveBeenCalledWith({ taskId: "a", completed: false });
  });

  it("holds the tick of a task that is being saved, and no other", () => {
    mutation = { isPending: true, isError: false, error: null, variables: { taskId: "b" } };
    screenOf();

    expect((screen.getByRole("checkbox", { name: "Mark Task title b as done" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Mark Task title a as done" }) as HTMLInputElement).disabled).toBe(false);
  });

  it("says it couldn't save, when it couldn't", () => {
    mutation = { isPending: false, isError: true, error: new Error("offline") };
    screenOf();

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t save that. Try again.");
  });

  it("says the pathway has to be saved first when the server answers 409", () => {
    mutation = { isPending: false, isError: true, error: new CareerNotSavedError() };
    screenOf();

    expect(screen.getByRole("alert").textContent).toContain("Start tracking this pathway to save your progress.");
  });

  it("shows another stage when it is picked, and says when it has no tasks", () => {
    screenOf();

    fireEvent.click(stageNav().getByRole("button", { name: /Core Skills/ }));

    expect(screen.getByRole("heading", { level: 2, name: "Core Skills" })).toBeTruthy();
    expect(screen.getByText("0 of 5 steps complete")).toBeTruthy();
    expect(screen.getByText("No practice tasks in this stage yet")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Tasks" })).toBeNull();
  });

  it("words an empty stage in the nav as having no tasks", () => {
    screenOf({ sections: [{ id: "g9", title: "Empty", done: 0, total: 0, steps: [] }] });

    expect(stageNav().getByText("No tasks")).toBeTruthy();
  });

  it("says so, with no stages listed, when there are no practice tasks at all", () => {
    screenOf({ sections: [] });

    expect(screen.getByText("No practice tasks for this roadmap yet")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Stages" })).toBeNull();
  });
});
