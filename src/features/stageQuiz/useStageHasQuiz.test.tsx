import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import { queryKeys } from "../../lib/queryKeys";
import { useStageHasQuiz } from "./useStageHasQuiz";

const useCareerPathwayData = vi.fn();
const fetchQuiz = vi.fn();

vi.mock("../pathwayRoadmap/hooks/useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../lib/api/pathwayQuiz.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayQuiz.api")>()),
  fetchQuiz: (...args: unknown[]) => fetchQuiz(...args),
}));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useCareerPathwayData.mockReturnValue({
    data: {
      kind: "ready",
      careerTitle: "Designer",
      pathway: { id: "p1", careerId: "c1", title: "Roadmap", description: "", steps: [] },
      progress: { kind: "untracked", activeCareerTitle: null },
    } satisfies CareerPathwayData,
    retry: vi.fn(),
  });
});
afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
  fetchQuiz.mockReset();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const quiz = { id: "q1", questions: [] };

describe("useStageHasQuiz", () => {
  it("is false until the quiz has been looked up, so no card flashes up", () => {
    fetchQuiz.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });

    expect(result.current).toBe(false);
  });

  it("is true when the stage has a quiz", async () => {
    fetchQuiz.mockResolvedValue(quiz);

    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(result.current).toBe(true));
    expect(fetchQuiz).toHaveBeenCalledWith("p1", "g1");
  });

  it("is false when the stage has no quiz (the server answers 404)", async () => {
    fetchQuiz.mockResolvedValue(null);

    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(fetchQuiz).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });

  it("is false when the lookup fails", async () => {
    fetchQuiz.mockRejectedValue(new Error("offline"));

    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });

    await waitFor(() => expect(fetchQuiz).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });

  it("looks nothing up while the pathway isn't known", () => {
    useCareerPathwayData.mockReturnValue({ data: { kind: "loading" }, retry: vi.fn() });

    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });

    expect(result.current).toBe(false);
    expect(fetchQuiz).not.toHaveBeenCalled();
  });

  it("shares the quiz with the quiz page, so opening it asks the server nothing more", async () => {
    fetchQuiz.mockResolvedValue(quiz);
    const { result } = renderHook(() => useStageHasQuiz("c1", "g1"), { wrapper });
    await waitFor(() => expect(result.current).toBe(true));

    expect(queryClient.getQueryData(queryKeys.stageQuiz.questions("p1", "g1"))).toEqual(quiz);
  });
});
