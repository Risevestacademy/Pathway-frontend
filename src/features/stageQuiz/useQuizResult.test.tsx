import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { QuizResultDto } from "../../lib/api/pathwayQuiz.api";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import type { QuizStageState } from "./useQuizStage";
import { useQuizResult } from "./useQuizResult";

const useQuizStage = vi.fn();
const fetchQuizResult = vi.fn();

vi.mock("./useQuizStage", () => ({
  useQuizStage: (careerId: string, stageId: string) => useQuizStage(careerId, stageId),
}));
vi.mock("../../lib/api/pathwayQuiz.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayQuiz.api")>()),
  fetchQuizResult: (pathwayId: string, stageId: string) => fetchQuizResult(pathwayId, stageId),
}));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  useQuizStage.mockReset();
  fetchQuizResult.mockReset();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const stage = (state: QuizStageState) => {
  const retry = vi.fn();
  useQuizStage.mockReturnValue({ state, retry });
  return retry;
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

const stageDto = (id: string, order: number, title: string, steps: ReturnType<typeof step>[]) => ({
  id,
  title,
  order,
  description: "",
  progress: { completed: 0, total: steps.length, percentage: 0 },
  quiz: { status: "TAKEN" },
  steps,
});

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Designer", description: "", retired: false, stageCount: 2, stepCount: 2, resourceCount: 0 },
  progress: { completed: 0, total: 2, percentage: 0, nextStepId: null, selfReported: true },
  stages: [
    stageDto("g1", 1, "Foundations", [step("s1", 1, "What design is for"), step("s2", 2, "How people think")]),
    stageDto("g2", 2, "Core skills", [step("s3", 3, "Prototype")]),
  ],
};

const readyStage: QuizStageState = {
  kind: "ready",
  pathwayId: "p1",
  careerTitle: "Designer",
  detail,
  stage: detail.stages[0],
};

const result: QuizResultDto = {
  quizId: "q1",
  score: { correct: 4, total: 5 },
  passed: true,
  revisitStepId: "s2",
  breakdown: [
    { questionId: "a1", prompt: "What is design for?", selectedOptionId: "o1", selectedOptionText: "People", correctOptionId: "o1", correctOptionText: "People", isCorrect: true },
    { questionId: "a2", prompt: "Which idea explains familiar patterns?", selectedOptionId: "o2", selectedOptionText: "Reading", correctOptionId: "o3", correctOptionText: "Familiarity", isCorrect: false },
  ],
  submittedAt: "2026-11-23T14:45:47.582Z",
};

describe("useQuizResult", () => {
  it("brings together the result, the next stage, and the step worth revisiting", async () => {
    stage(readyStage);
    fetchQuizResult.mockResolvedValue(result);

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("ready"));
    expect(hook.current.state).toEqual({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Designer",
      stage: { id: "g1", title: "Foundations" },
      nextStage: { id: "g2", title: "Core skills" },
      revisit: {
        step: { id: "s2", title: "How people think", order: 2 },
        missedPrompt: "Which idea explains familiar patterns?",
      },
      result,
    });
    expect(fetchQuizResult).toHaveBeenCalledWith("p1", "g1");
  });

  it("has nothing to revisit, and no next stage, when the backend names no step and this is the last stage", async () => {
    stage({ ...readyStage, stage: detail.stages[1] });
    fetchQuizResult.mockResolvedValue({ ...result, revisitStepId: null });

    const { result: hook } = renderHook(() => useQuizResult("c1", "g2"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("ready"));
    expect(hook.current.state).toMatchObject({ nextStage: null, revisit: null });
  });

  it("has nothing to revisit when the step it names isn't in the pathway", async () => {
    stage(readyStage);
    fetchQuizResult.mockResolvedValue({ ...result, revisitStepId: "gone" });

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("ready"));
    expect(hook.current.state).toMatchObject({ revisit: null });
  });

  it("still names the step when no question can be singled out", async () => {
    stage(readyStage);
    fetchQuizResult.mockResolvedValue({
      ...result,
      breakdown: result.breakdown.map((item) => ({ ...item, isCorrect: true })),
    });

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("ready"));
    expect(hook.current.state).toMatchObject({
      revisit: { step: { id: "s2" }, missedPrompt: null },
    });
  });

  it("says the quiz hasn't been taken when there is no result", async () => {
    stage(readyStage);
    fetchQuizResult.mockResolvedValue(null);

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("not-taken"));
  });

  it("follows the stage lookup while it loads, without asking for a result yet", () => {
    stage({ kind: "loading" });

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    expect(hook.current.state).toEqual({ kind: "loading" });
    expect(fetchQuizResult).not.toHaveBeenCalled();
  });

  it.each(["unavailable", "error"] as const)("is %s when the stage lookup is", (kind) => {
    stage({ kind });

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    expect(hook.current.state).toEqual({ kind });
  });

  it("is an error when the result fails to load, and retrying asks again", async () => {
    const retryStage = stage(readyStage);
    fetchQuizResult.mockRejectedValue(new Error("boom"));

    const { result: hook } = renderHook(() => useQuizResult("c1", "g1"), { wrapper });

    await waitFor(() => expect(hook.current.state.kind).toBe("error"));
    hook.current.retry();
    expect(retryStage).toHaveBeenCalled();
  });
});
