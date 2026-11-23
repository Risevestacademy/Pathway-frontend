import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { QuizDto } from "../../lib/api/pathwayQuiz.api";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { useStageQuiz } from "./useStageQuiz";

const useCareerPathwayData = vi.fn();
const fetchPathwayById = vi.fn();
const fetchQuiz = vi.fn();

vi.mock("../pathwayRoadmap/hooks/useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../lib/api/pathways.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathways.api")>()),
  fetchPathwayById: (id: string) => fetchPathwayById(id),
}));
vi.mock("../../lib/api/pathwayQuiz.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayQuiz.api")>()),
  fetchQuiz: (pathwayId: string, stageId: string) => fetchQuiz(pathwayId, stageId),
}));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
  fetchPathwayById.mockReset();
  fetchQuiz.mockReset();
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

const step = (id: string, order: number, title: string) => ({
  id,
  title,
  order,
  status: "NOT_STARTED" as const,
  description: "",
  skills: [],
  expectedActivity: "",
  careerReadiness: "",
  resources: [],
  tasks: [],
});

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Product Designer", description: "", retired: false, stageCount: 2, stepCount: 3, resourceCount: 0 },
  progress: { completed: 0, total: 3, percentage: 0, nextStepId: "s1", selfReported: true },
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      description: "",
      progress: { completed: 0, total: 2, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [step("s2", 2, "How people think"), step("s1", 1, "What design is for")],
    },
    {
      id: "g2",
      title: "Core skills",
      order: 2,
      description: "",
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [step("s3", 3, "Prototype")],
    },
  ],
};

const quiz: QuizDto = {
  id: "q1",
  stageId: "g1",
  questions: [{ id: "a1", prompt: "What is design for?", options: [{ id: "o1", text: "People" }] }],
};

describe("useStageQuiz", () => {
  it("brings together the stage, its steps in order, and the quiz", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);
    fetchQuiz.mockResolvedValue(quiz);

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toEqual({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Product Designer",
      stage: {
        id: "g1",
        title: "Foundations",
        steps: [
          { id: "s1", title: "What design is for", order: 1 },
          { id: "s2", title: "How people think", order: 2 },
        ],
      },
      quiz,
    });
    expect(fetchPathwayById).toHaveBeenCalledWith("p1");
    expect(fetchQuiz).toHaveBeenCalledWith("p1", "g1");
  });

  it("is loading while the roadmap loads, without asking for anything yet", () => {
    roadmap({ kind: "loading" });

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(fetchPathwayById).not.toHaveBeenCalled();
  });

  it("is unavailable when the career has no roadmap", () => {
    roadmap({ kind: "unavailable" });

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    expect(result.current.state).toEqual({ kind: "unavailable" });
  });

  it("is an error when the roadmap fails, and retrying asks the roadmap again", () => {
    const retry = roadmap({ kind: "error" });

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });
    result.current.retry();

    expect(result.current.state).toEqual({ kind: "error" });
    expect(retry).toHaveBeenCalled();
  });

  it("is unavailable when the pathway can't be read", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(null);

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
  });

  it("is unavailable when the stage isn't in the pathway", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);

    const { result } = renderHook(() => useStageQuiz("c1", "nope"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
    expect(fetchQuiz).not.toHaveBeenCalled();
  });

  it("says there is no quiz when the stage has none", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);
    fetchQuiz.mockResolvedValue(null);

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("no-quiz"));
  });

  it("is an error when the quiz fails to load", async () => {
    roadmap(readyRoadmap);
    fetchPathwayById.mockResolvedValue(detail);
    fetchQuiz.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useStageQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });
});
