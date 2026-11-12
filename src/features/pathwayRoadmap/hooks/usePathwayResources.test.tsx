import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import type { CareerPathwayData } from "./useCareerPathwayData";
import { usePathwayResources } from "./usePathwayResources";

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
  type: "COURSE" as const,
  provider: "Acme",
  costStatus: "FREE" as const,
  certificationCost: null,
  curationRationale: "",
  lastCheckedDate: "2026-10-01",
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

const ready = (progress: Extract<CareerPathwayData, { kind: "ready" }>["progress"]): CareerPathwayData => ({
  kind: "ready",
  careerTitle: "Product Designer",
  pathway: {
    id: "p1",
    careerId: "c1",
    title: "Roadmap",
    description: "",
    steps: [step("s1", 1, [resource("a")]), step("s2", 2, [])],
  },
  progress,
});

const have = (data: CareerPathwayData, retry = vi.fn()) => {
  useCareerPathwayData.mockReturnValue({ data, retry });
  return retry;
};

describe("usePathwayResources", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    renderHook(() => usePathwayResources("c1"));

    expect(useCareerPathwayData).toHaveBeenCalledWith("c1");
  });

  it.each(["loading", "error", "unavailable"] as const)("passes %s straight through", (kind) => {
    have({ kind });

    const { result } = renderHook(() => usePathwayResources("c1"));

    expect(result.current.state).toEqual({ kind });
  });

  it("is ready with the career's name, step count and resources grouped by step", () => {
    have(ready({ kind: "untracked", activeCareerTitle: null }));

    const { result } = renderHook(() => usePathwayResources("c1"));

    const state = result.current.state;
    if (state.kind !== "ready") throw new Error("not ready");
    expect(state.careerTitle).toBe("Product Designer");
    expect(state.stepCount).toBe(2);
    expect(state.groups.map((g) => [g.stepId, g.number, g.resources.map((r) => r.id)])).toEqual([
      ["s1", 1, ["a"]],
      ["s2", 2, []],
    ]);
  });

  it("has no progress counts unless this is their active pathway", () => {
    have(ready({ kind: "untracked", activeCareerTitle: null }));

    const { result } = renderHook(() => usePathwayResources("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.progress).toBeNull();
  });

  it("has how many steps they have marked complete, out of how many, for their active pathway", () => {
    have(
      ready({
        kind: "active",
        progress: {
          completed: 2,
          total: 16,
          percentage: 13,
          nextStepId: "s2",
          selfReported: true,
          startStepId: null,
        },
        statuses: { s1: "COMPLETED" },
      }),
    );

    const { result } = renderHook(() => usePathwayResources("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.progress).toEqual({
      completed: 2,
      total: 16,
    });
  });

  it("has no step statuses unless this is their active pathway", () => {
    have(ready({ kind: "untracked", activeCareerTitle: null }));

    const { result } = renderHook(() => usePathwayResources("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.statuses).toBeNull();
  });

  it("has the saved step statuses for their active pathway", () => {
    have(
      ready({
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
      }),
    );

    const { result } = renderHook(() => usePathwayResources("c1"));

    expect(result.current.state.kind === "ready" && result.current.state.statuses).toEqual({
      s1: "COMPLETED",
    });
  });

  it("passes retry through", () => {
    const retry = have({ kind: "error" });

    const { result } = renderHook(() => usePathwayResources("c1"));
    result.current.retry();

    expect(retry).toHaveBeenCalledOnce();
  });
});
