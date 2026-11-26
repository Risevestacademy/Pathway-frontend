import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PathwayTaskDetailDto } from "../../lib/api/pathwayTasks.api";
import { useAuthStore } from "../../lib/stores/authStore";
import type { PathwayTasksState } from "./usePathwayTasks";
import { usePathwayTask } from "./usePathwayTask";

const usePathwayTasks = vi.fn();
const fetchPathwayTask = vi.fn();

vi.mock("./usePathwayTasks", () => ({
  usePathwayTasks: (careerId: string) => usePathwayTasks(careerId),
}));
vi.mock("../../lib/api/pathwayTasks.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayTasks.api")>()),
  fetchPathwayTask: (...args: unknown[]) => fetchPathwayTask(...args),
}));

let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "u1@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
});
afterEach(() => {
  cleanup();
  usePathwayTasks.mockReset();
  fetchPathwayTask.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const tasksState = (state: PathwayTasksState) => {
  const retry = vi.fn();
  usePathwayTasks.mockReturnValue({ state, retry });
  return retry;
};

const readyTasks: PathwayTasksState = {
  kind: "ready",
  pathwayId: "p1",
  careerTitle: "Product Designer",
  stepCount: 3,
  sections: [
    {
      id: "g1",
      title: "Foundations",
      done: 0,
      total: 3,
      steps: [
        { id: "s3", number: 3, title: "Get comfortable in Figma", status: "NOT_STARTED", tasks: [] },
      ],
    },
  ],
};

const read: PathwayTaskDetailDto = {
  id: "t1",
  title: "Pick one of your favourite apps",
  goal: "Recreate one screen",
  estimatedWeeks: 3,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 1,
  checklistTotal: 3,
  stepId: "s3",
  whatToMake: ["Choose a screen"],
  hints: ["Start with the biggest frame"],
  checklist: [{ id: "i1", text: "I recreated one full screen", isChecked: true, checkedAt: null }],
  helpfulLinks: [],
};

describe("usePathwayTask", () => {
  it("is ready with the task, and the stage and step it belongs to", async () => {
    tasksState(readyTasks);
    fetchPathwayTask.mockResolvedValue(read);

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(fetchPathwayTask).toHaveBeenCalledWith("p1", "t1");
    expect(result.current.state).toEqual({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Product Designer",
      stage: { id: "g1", title: "Foundations" },
      step: { id: "s3", number: 3, title: "Get comfortable in Figma" },
      task: read,
    });
  });

  it("has no stage or step to name when the task's step isn't in the list, but still shows the task", async () => {
    tasksState(readyTasks);
    fetchPathwayTask.mockResolvedValue({ ...read, stepId: "elsewhere" });

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({ stage: null, step: null });
  });

  it("says the task wasn't found when the backend has no such task", async () => {
    tasksState(readyTasks);
    fetchPathwayTask.mockResolvedValue(null);

    const { result } = renderHook(() => usePathwayTask("c1", "nope"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("not-found"));
  });

  it("is loading while the tasks load, asking for nothing yet", () => {
    tasksState({ kind: "loading" });

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(fetchPathwayTask).not.toHaveBeenCalled();
  });

  it("is loading while the task loads", () => {
    tasksState(readyTasks);
    fetchPathwayTask.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
  });

  it.each(["unavailable", "error"] as const)("is %s when the tasks are", (kind) => {
    tasksState({ kind });

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    expect(result.current.state).toEqual({ kind });
  });

  it("is an error when the task fails to load, and retrying asks again", async () => {
    const retryTasks = tasksState(readyTasks);
    fetchPathwayTask.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => usePathwayTask("c1", "t1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
    result.current.retry();
    expect(retryTasks).toHaveBeenCalled();
  });
});
