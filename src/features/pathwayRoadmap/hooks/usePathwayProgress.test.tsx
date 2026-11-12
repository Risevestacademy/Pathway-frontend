import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import type { CareerProgress } from "../../progress/progress.types";
import type { CareerPathwayData } from "./useCareerPathwayData";
import { usePathwayProgress } from "./usePathwayProgress";

const useCareerPathwayData = vi.fn();

vi.mock("./useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));

afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
});

const resource = (id: string) => ({
  id,
  title: `Resource ${id}`,
  description: null,
  url: `https://example.com/${id}`,
  type: "ARTICLE" as const,
  provider: "Acme",
  costStatus: "FREE" as const,
  certificationCost: null,
  curationRationale: "",
  lastCheckedDate: "2026-09-12",
  skills: [],
});

const step = (id: string, order: number, resources: ReturnType<typeof resource>[]) => ({
  id,
  title: `Step ${order}`,
  description: "",
  learningObjective: "",
  prerequisites: null,
  expectedActivity: "",
  order,
  skills: [],
  resources,
});

const ready = (progress: CareerProgress): CareerPathwayData => ({
  kind: "ready",
  careerTitle: "Product Designer",
  progress,
  pathway: {
    id: "p1",
    careerId: "c1",
    title: "Roadmap",
    description: "",
    steps: [step("s1", 1, [resource("a")]), step("s2", 2, [])],
  },
});

const have = (data: CareerPathwayData, retry = vi.fn()) => {
  useCareerPathwayData.mockReturnValue({ data, retry });
  return retry;
};

const active: CareerProgress = {
  kind: "active",
  progress: {
    completed: 1,
    total: 2,
    percentage: 50,
    nextStepId: "s2",
    selfReported: true,
    startStepId: null,
  },
  statuses: { s1: "COMPLETED" },
};

describe("usePathwayProgress", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    renderHook(() => usePathwayProgress("c1"));

    expect(useCareerPathwayData).toHaveBeenCalledWith("c1");
  });

  it.each(["loading", "error", "unavailable"] as const)("passes %s straight through", (kind) => {
    have({ kind });

    const { result } = renderHook(() => usePathwayProgress("c1"));

    expect(result.current.state).toEqual({ kind });
  });

  it("is ready with the career's name, the overview, and the resources by step", () => {
    have(ready(active));

    const { result } = renderHook(() => usePathwayProgress("c1"));

    const state = result.current.state;
    if (state.kind !== "ready") throw new Error("not ready");
    expect(state.careerTitle).toBe("Product Designer");
    expect(state.overview.completed).toBe(1);
    expect(state.overview.steps.map((s) => s.status)).toEqual(["COMPLETED", "NOT_STARTED"]);
    expect(state.groups.map((g) => g.stepId)).toEqual(["s1", "s2"]);
  });

  it("needs no activation when it already is their active pathway", () => {
    have(ready(active));

    const { result } = renderHook(() => usePathwayProgress("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.activation).toBeNull();
  });

  it("needs activation, naming the pathway it would replace, when it isn't their active one", () => {
    have(ready({ kind: "untracked", activeCareerTitle: "Data Analyst" }));

    const { result } = renderHook(() => usePathwayProgress("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.activation).toEqual({
      activeCareerTitle: "Data Analyst",
    });
  });

  it("passes retry through", () => {
    const retry = have({ kind: "error" });

    const { result } = renderHook(() => usePathwayProgress("c1"));
    result.current.retry();

    expect(retry).toHaveBeenCalledOnce();
  });
});
