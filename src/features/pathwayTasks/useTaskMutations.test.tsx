import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PathwayTaskDetailDto, PathwayTasksDto } from "../../lib/api/pathwayTasks.api";
import { queryKeys } from "../../lib/queryKeys";
import { useAuthStore } from "../../lib/stores/authStore";
import { useSetChecklistItem, useSetTaskCompletion } from "./useTaskMutations";

const setTaskCompletion = vi.fn();
const setChecklistItem = vi.fn();

vi.mock("../../lib/api/pathways.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathways.api")>()),
  setTaskCompletion: (...args: unknown[]) => setTaskCompletion(...args),
  setChecklistItem: (...args: unknown[]) => setChecklistItem(...args),
}));

let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const listKey = () => queryKeys.pathwayTasks("u1", "p1");
const detailKey = () => queryKeys.pathwayTask("u1", "p1", "a");

const list: PathwayTasksDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        {
          id: "s1",
          title: "One",
          order: 1,
          status: "NOT_STARTED",
          completedAt: null,
          tasks: [
            { id: "a", title: "Task a", goal: "Goal", estimatedWeeks: 1, isCompleted: false, completedAt: null, checklistChecked: 0, checklistTotal: 2 },
          ],
        },
      ],
    },
  ],
};

const detail: PathwayTaskDetailDto = {
  id: "a",
  title: "Task a",
  goal: "Goal",
  estimatedWeeks: 1,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 0,
  checklistTotal: 2,
  stepId: "s1",
  whatToMake: [],
  hints: [],
  checklist: [
    { id: "i1", text: "First", isChecked: false, checkedAt: null },
    { id: "i2", text: "Second", isChecked: false, checkedAt: null },
  ],
  helpfulLinks: [],
};

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "u1@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
  queryClient.setQueryData(listKey(), list);
  queryClient.setQueryData(detailKey(), detail);
});
afterEach(() => {
  cleanup();
  setTaskCompletion.mockReset();
  setChecklistItem.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const listedTask = () =>
  queryClient.getQueryData<PathwayTasksDto>(listKey())?.stages[0].steps[0].tasks[0];
const cachedDetail = () => queryClient.getQueryData<PathwayTaskDetailDto>(detailKey());

describe("useSetTaskCompletion", () => {
  const confirmed = (completed: boolean) => ({
    taskId: "a",
    completed,
    completedAt: completed ? "2026-11-23T15:00:00.000Z" : null,
    xpAwarded: 10,
    checklistChecked: 2,
    checklistTotal: 2,
  });

  it("saves the task for this pathway, and shows it done once the server confirms", async () => {
    setTaskCompletion.mockResolvedValue(confirmed(true));
    const { result } = renderHook(() => useSetTaskCompletion("p1"), { wrapper });

    act(() => result.current.mutate({ taskId: "a", completed: true }));

    await waitFor(() => expect(listedTask()?.isCompleted).toBe(true));
    expect(setTaskCompletion).toHaveBeenCalledWith("p1", "a", true);
    expect(cachedDetail()).toMatchObject({ isCompleted: true, checklistChecked: 2 });
  });

  it("reopens a task", async () => {
    setTaskCompletion.mockResolvedValue(confirmed(false));
    const { result } = renderHook(() => useSetTaskCompletion("p1"), { wrapper });

    act(() => result.current.mutate({ taskId: "a", completed: false }));

    await waitFor(() => expect(setTaskCompletion).toHaveBeenCalledWith("p1", "a", false));
    await waitFor(() => expect(listedTask()?.isCompleted).toBe(false));
  });

  it("leaves the task as it was when the save fails", async () => {
    setTaskCompletion.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSetTaskCompletion("p1"), { wrapper });

    act(() => result.current.mutate({ taskId: "a", completed: true }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(listedTask()?.isCompleted).toBe(false);
    expect(cachedDetail()?.isCompleted).toBe(false);
  });

  it("shows it is saving while it waits", async () => {
    setTaskCompletion.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSetTaskCompletion("p1"), { wrapper });

    act(() => result.current.mutate({ taskId: "a", completed: true }));

    await waitFor(() => expect(result.current.isPending).toBe(true));
  });
});

describe("useSetChecklistItem", () => {
  const confirmed = (checked: boolean) => ({
    itemId: "i1",
    taskId: "a",
    checked,
    checkedAt: checked ? "2026-11-23T15:00:00.000Z" : null,
    checklistChecked: checked ? 1 : 0,
    checklistTotal: 2,
  });

  it("saves the item on its task, and shows it checked once the server confirms", async () => {
    setChecklistItem.mockResolvedValue(confirmed(true));
    const { result } = renderHook(() => useSetChecklistItem("p1", "a"), { wrapper });

    act(() => result.current.mutate({ itemId: "i1", checked: true }));

    await waitFor(() => expect(cachedDetail()?.checklist[0].isChecked).toBe(true));
    expect(setChecklistItem).toHaveBeenCalledWith("p1", "a", "i1", true);
    expect(cachedDetail()?.checklistChecked).toBe(1);
    expect(listedTask()?.checklistChecked).toBe(1);
  });

  it("does not complete the task by itself", async () => {
    setChecklistItem.mockResolvedValue({ ...confirmed(true), checklistChecked: 2 });
    const { result } = renderHook(() => useSetChecklistItem("p1", "a"), { wrapper });

    act(() => result.current.mutate({ itemId: "i1", checked: true }));

    await waitFor(() => expect(listedTask()?.checklistChecked).toBe(2));
    expect(listedTask()?.isCompleted).toBe(false);
    expect(cachedDetail()?.isCompleted).toBe(false);
  });

  it("leaves the item as it was when the save fails", async () => {
    setChecklistItem.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSetChecklistItem("p1", "a"), { wrapper });

    act(() => result.current.mutate({ itemId: "i1", checked: true }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(cachedDetail()?.checklist[0].isChecked).toBe(false);
  });
});
