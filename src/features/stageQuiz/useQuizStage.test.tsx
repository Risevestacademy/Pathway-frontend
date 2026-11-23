import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { useQuizStage } from "./useQuizStage";

const useCareerPathwayData = vi.fn();
const fetchPathwayById = vi.fn();

vi.mock("../pathwayRoadmap/hooks/useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../lib/api/pathways.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathways.api")>()),
  fetchPathwayById: (id: string) => fetchPathwayById(id),
}));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
  fetchPathwayById.mockReset();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

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

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Product Designer", description: "", retired: false, stageCount: 1, stepCount: 0, resourceCount: 0 },
  progress: { completed: 0, total: 0, percentage: 0, nextStepId: null, selfReported: true },
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      description: "",
      progress: { completed: 0, total: 0, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [],
    },
  ],
};

describe("useQuizStage", () => {
  it("finds the stage in the pathway", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toEqual({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Product Designer",
      detail,
      stage: detail.stages[0],
    });
    expect(fetchPathwayById).toHaveBeenCalledWith("p1");
  });

  it("is loading while the roadmap loads, without asking for the pathway yet", () => {
    roadmap({ kind: "loading" });

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(fetchPathwayById).not.toHaveBeenCalled();
  });

  it("is unavailable when the career has no roadmap", () => {
    roadmap({ kind: "unavailable" });

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "unavailable" });
  });

  it("is an error when the roadmap fails, and retrying asks the roadmap again", () => {
    const retry = roadmap({ kind: "error" });

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });
    result.current.retry();

    expect(result.current.state).toEqual({ kind: "error" });
    expect(retry).toHaveBeenCalled();
  });

  it("is unavailable when the pathway can't be read", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(null);

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
  });

  it("is unavailable when the stage isn't in the pathway", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);

    const { result } = renderHook(() => useQuizStage("c1", "nope"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
  });

  it("is an error when the pathway fails to load", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useQuizStage("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });
});
