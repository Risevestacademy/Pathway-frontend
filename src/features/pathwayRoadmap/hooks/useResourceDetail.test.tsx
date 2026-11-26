import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type {
  PathwayResourceDetailDto,
  PathwayResourceItemDto,
  PathwayResourcesDto,
} from "../../../lib/api/pathwayResources.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import type { CareerPathwayData } from "./useCareerPathwayData";
import { useResourceDetail } from "./useResourceDetail";

const useCareerPathwayData = vi.fn();
const fetchPathwayResources = vi.fn();
const fetchPathwayResource = vi.fn();

vi.mock("./useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../../lib/api/pathwayResources.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/pathwayResources.api")>()),
  fetchPathwayResources: (pathwayId: string) => fetchPathwayResources(pathwayId),
  fetchPathwayResource: (...args: unknown[]) => fetchPathwayResource(...args),
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
  fetchPathwayResources.mockReset();
  fetchPathwayResource.mockReset();
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

const item = (id: string): PathwayResourceItemDto => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  type: "ARTICLE",
  costStatus: "FREE",
  estimatedWeeks: 1,
  lastCheckedDate: "2026-11-23T14:36:49.328Z",
  isCompleted: false,
  completedAt: null,
});

const list: PathwayResourcesDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 2, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        { id: "s1", title: "What design is for", order: 1, status: "NOT_STARTED", completedAt: null, resources: [item("r0")] },
        { id: "s2", title: "How people think", order: 2, status: "NOT_STARTED", completedAt: null, resources: [item("r1")] },
      ],
    },
  ],
  optionalPaidCourses: [],
};

const read: PathwayResourceDetailDto = {
  ...item("r1"),
  title: "Laws of UX",
  description: "A collection of principles.",
  outcomes: ["Spot patterns"],
  url: "https://lawsofux.com",
  usageNote: "Read two or three laws at a time.",
  nextTask: null,
};

describe("useResourceDetail", () => {
  it("is ready with the career's name and the resource, under the step that lists it", async () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(list);
    fetchPathwayResource.mockResolvedValue(read);

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({
      kind: "ready",
      careerTitle: "Product Designer",
      detail: {
        step: { id: "s2", number: 2, title: "How people think" },
        resource: { id: "r1", title: "Laws of UX", kind: "article" },
        description: "A collection of principles.",
        outcomes: ["Spot patterns"],
        usageNote: "Read two or three laws at a time.",
      },
    });
  });

  it("asks the backend for the resource in that step, so it can say how the step uses it", async () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(list);
    fetchPathwayResource.mockResolvedValue(read);

    renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    await waitFor(() => expect(fetchPathwayResource).toHaveBeenCalledWith("p1", "r1", "s2"));
    expect(fetchPathwayResources).toHaveBeenCalledWith("p1");
  });

  it("still shows a resource that no step lists, without a step", async () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue({ ...list, optionalPaidCourses: [item("paid")] });
    fetchPathwayResource.mockResolvedValue({ ...read, id: "paid", usageNote: undefined });

    const { result } = renderHook(() => useResourceDetail("c1", "paid"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(fetchPathwayResource).toHaveBeenCalledWith("p1", "paid", undefined);
    expect(result.current.state).toMatchObject({ detail: { step: null } });
  });

  it("says the resource wasn't found when the backend has no such resource", async () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(list);
    fetchPathwayResource.mockResolvedValue(null);

    const { result } = renderHook(() => useResourceDetail("c1", "nope"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("not-found"));
  });

  it("is loading while the roadmap loads, asking for nothing yet", () => {
    roadmap({ kind: "loading" });

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(fetchPathwayResources).not.toHaveBeenCalled();
  });

  it("is loading while the resource loads", () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(list);
    fetchPathwayResource.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
  });

  it("is unavailable when the career has no roadmap", () => {
    roadmap({ kind: "unavailable" });

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "unavailable" });
  });

  it("is unavailable when the pathway's resources can't be read", async () => {
    roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(null);

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
    expect(fetchPathwayResource).not.toHaveBeenCalled();
  });

  it("is an error when the roadmap fails", () => {
    roadmap({ kind: "error" });

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "error" });
  });

  it("is an error when the resource fails to load, and retrying asks everything again", async () => {
    const retryRoadmap = roadmap(readyRoadmap);
    fetchPathwayResources.mockResolvedValue(list);
    fetchPathwayResource.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useResourceDetail("c1", "r1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
    result.current.retry();
    expect(retryRoadmap).toHaveBeenCalled();
  });
});
