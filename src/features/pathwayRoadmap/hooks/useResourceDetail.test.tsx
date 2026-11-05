import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import type { CareerPathwayData } from "./useCareerPathwayData";
import { useResourceDetail } from "./useResourceDetail";

const useCareerPathwayData = vi.fn();

vi.mock("./useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));

afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
});

const ready: CareerPathwayData = {
  kind: "ready",
  careerTitle: "Product Designer",
  progress: { kind: "untracked", activeCareerTitle: null },
  pathway: {
    id: "p1",
    careerId: "c1",
    title: "Roadmap",
    description: "",
    steps: [
      {
        id: "s1",
        title: "How people think",
        description: "",
        learningObjective: "",
        prerequisites: null,
        expectedActivity: "",
        order: 1,
        skills: [],
        resources: [
          {
            id: "r1",
            title: "Laws of UX",
            description: "About the laws",
            url: "https://lawsofux.com",
            type: "ARTICLE",
            provider: "Jon Yablonski",
            costStatus: "FREE",
            certificationCost: null,
            curationRationale: "Read a few at a time",
            lastCheckedDate: "2026-09-12",
            skills: [],
          },
        ],
      },
    ],
  },
};

const have = (data: CareerPathwayData, retry = vi.fn()) => {
  useCareerPathwayData.mockReturnValue({ data, retry });
  return retry;
};

describe("useResourceDetail", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    renderHook(() => useResourceDetail("c1", "r1"));

    expect(useCareerPathwayData).toHaveBeenCalledWith("c1");
  });

  it.each(["loading", "error", "unavailable"] as const)("passes %s straight through", (kind) => {
    have({ kind });

    const { result } = renderHook(() => useResourceDetail("c1", "r1"));

    expect(result.current.state).toEqual({ kind });
  });

  it("is ready with the career's name and the resource's detail", () => {
    have(ready);

    const { result } = renderHook(() => useResourceDetail("c1", "r1"));

    const state = result.current.state;
    if (state.kind !== "ready") throw new Error("not ready");
    expect(state.careerTitle).toBe("Product Designer");
    expect(state.detail.resource.title).toBe("Laws of UX");
    expect(state.detail.step.title).toBe("How people think");
  });

  it("says the resource wasn't found when the roadmap has no such resource", () => {
    have(ready);

    const { result } = renderHook(() => useResourceDetail("c1", "missing"));

    expect(result.current.state).toEqual({ kind: "not-found" });
  });

  it("passes retry through", () => {
    const retry = have({ kind: "error" });

    const { result } = renderHook(() => useResourceDetail("c1", "r1"));
    result.current.retry();

    expect(retry).toHaveBeenCalledOnce();
  });
});
