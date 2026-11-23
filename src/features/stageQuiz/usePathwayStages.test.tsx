import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { usePathwayStages } from "./usePathwayStages";

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

const roadmap = (data: CareerPathwayData) =>
  useCareerPathwayData.mockReturnValue({ data, retry: vi.fn() });

const readyRoadmap: CareerPathwayData = {
  kind: "ready",
  careerTitle: "Designer",
  pathway: { id: "p1", careerId: "c1", title: "Roadmap", description: "", steps: [] },
  progress: { kind: "untracked", activeCareerTitle: null },
};

const step = (id: string, order: number) => ({
  id,
  title: `Step ${order}`,
  order,
  status: "NOT_STARTED" as const,
  description: "",
  skills: [],
  expectedActivity: "",
  careerReadiness: "",
  resources: [],
  tasks: [],
});

const stage = (id: string, order: number, title: string, steps: ReturnType<typeof step>[]) => ({
  id,
  title,
  order,
  description: "",
  progress: { completed: 0, total: steps.length, percentage: 0 },
  quiz: { status: "NOT_TAKEN" },
  steps,
});

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Designer", description: "", retired: false, stageCount: 2, stepCount: 3, resourceCount: 0 },
  progress: { completed: 0, total: 3, percentage: 0, nextStepId: null, selfReported: true },
  stages: [
    stage("g1", 1, "Foundations", [step("s1", 1), step("s2", 2)]),
    stage("g2", 2, "Core skills", [step("s3", 3)]),
  ],
};

describe("usePathwayStages", () => {
  it("lists each stage with the ids of its steps", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);

    const { result } = renderHook(() => usePathwayStages("c1"), { wrapper });

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current).toEqual([
      { id: "g1", title: "Foundations", stepIds: ["s1", "s2"] },
      { id: "g2", title: "Core skills", stepIds: ["s3"] },
    ]);
    expect(fetchPathwayById).toHaveBeenCalledWith("p1");
  });

  it("is empty, and asks for nothing, until the roadmap is ready", () => {
    roadmap({ kind: "loading" });

    const { result } = renderHook(() => usePathwayStages("c1"), { wrapper });

    expect(result.current).toEqual([]);
    expect(fetchPathwayById).not.toHaveBeenCalled();
  });

  it("is empty when the pathway can't be read, so the page just goes without the quiz", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(null);

    const { result } = renderHook(() => usePathwayStages("c1"), { wrapper });

    await waitFor(() => expect(fetchPathwayById).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });

  it("is empty when loading the pathway fails, instead of breaking the page", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => usePathwayStages("c1"), { wrapper });

    await waitFor(() => expect(fetchPathwayById).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });
});
