import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PathwayTasksDto } from "../../lib/api/pathwayTasks.api";
import { useAuthStore } from "../../lib/stores/authStore";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { usePathwayTasks } from "./usePathwayTasks";

const useCareerPathwayData = vi.fn();
const fetchPathwayTasks = vi.fn();

vi.mock("../pathwayRoadmap/hooks/useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../lib/api/pathwayTasks.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayTasks.api")>()),
  fetchPathwayTasks: (pathwayId: string) => fetchPathwayTasks(pathwayId),
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
  useCareerPathwayData.mockReset();
  fetchPathwayTasks.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const roadmap = (data: CareerPathwayData) => {
  const retry = vi.fn();
  useCareerPathwayData.mockReturnValue({ data, retry });
  return retry;
};

const readyRoadmap: CareerPathwayData = {
  kind: "ready",
  careerTitle: "Product Designer",
  pathway: { id: "p1", careerId: "c1", title: "Roadmap", description: "", steps: [] },
  progress: { kind: "untracked", activeCareerTitle: null },
};

const tasks: PathwayTasksDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 2, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        {
          id: "s1",
          title: "What design is for",
          order: 1,
          status: "NOT_STARTED",
          completedAt: null,
          tasks: [
            { id: "t1", title: "Sketch a flow", goal: "Practise", estimatedWeeks: 1, isCompleted: true, completedAt: "2026-11-23T14:39:33.192Z", checklistChecked: 2, checklistTotal: 2 },
          ],
        },
        { id: "s2", title: "How people think", order: 2, status: "NOT_STARTED", completedAt: null, tasks: [] },
      ],
    },
  ],
};

describe("usePathwayTasks", () => {
  it("is ready with the career's name, the number of steps, and the stages with their tasks", async () => {
    roadmap(readyRoadmap);
    fetchPathwayTasks.mockResolvedValue(tasks);

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(fetchPathwayTasks).toHaveBeenCalledWith("p1");
    expect(result.current.state).toMatchObject({
      kind: "ready",
      careerTitle: "Product Designer",
      stepCount: 2,
      sections: [{ id: "g1", title: "Foundations", done: 1, total: 1 }],
    });
  });

  it("is loading while the roadmap loads, asking for nothing yet", () => {
    roadmap({ kind: "loading" });

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(fetchPathwayTasks).not.toHaveBeenCalled();
  });

  it("is loading while the tasks load", () => {
    roadmap(readyRoadmap);
    fetchPathwayTasks.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
  });

  it("is unavailable when the career has no roadmap", () => {
    roadmap({ kind: "unavailable" });

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "unavailable" });
  });

  it("is unavailable when the pathway's tasks can't be read", async () => {
    roadmap(readyRoadmap);
    fetchPathwayTasks.mockResolvedValue(null);

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
  });

  it("is an error when the roadmap fails", () => {
    roadmap({ kind: "error" });

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "error" });
  });

  it("is an error when the tasks fail to load, and retrying asks everything again", async () => {
    const retryRoadmap = roadmap(readyRoadmap);
    fetchPathwayTasks.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => usePathwayTasks("c1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
    result.current.retry();
    expect(retryRoadmap).toHaveBeenCalled();
  });
});
