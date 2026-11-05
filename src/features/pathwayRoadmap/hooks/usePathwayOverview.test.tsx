import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { CareerProgress } from "../../progress/progress.types";
import { usePathwayOverview } from "./usePathwayOverview";

const useCareer = vi.fn();
const useCareerProgress = vi.fn();
const fetchPathwayOrNull = vi.fn();
const retryProgress = vi.fn();

vi.mock("../../careerDetail/hooks/useCareer", () => ({
  useCareer: (careerId: string) => useCareer(careerId),
}));
vi.mock("../../progress/hooks/useCareerProgress", () => ({
  useCareerProgress: (careerId: string) => useCareerProgress(careerId),
}));
vi.mock("../../../lib/api/pathways.api", () => ({
  fetchPathwayOrNull: (careerId: string) => fetchPathwayOrNull(careerId),
}));

afterEach(() => {
  cleanup();
  useCareer.mockReset();
  useCareerProgress.mockReset();
  fetchPathwayOrNull.mockReset();
  retryProgress.mockReset();
});

const pathway = {
  id: "p1",
  careerId: "c1",
  title: "Roadmap",
  description: "",
  steps: [
    {
      id: "s1",
      title: "Foundations",
      description: "Learn Figma",
      learningObjective: "",
      prerequisites: null,
      expectedActivity: "",
      order: 1,
      skills: [],
      resources: [],
    },
  ],
};

const loaded = (progress: CareerProgress = { kind: "untracked", activeCareerTitle: null }) => {
  useCareer.mockReturnValue({ data: { title: "Product Designer" }, isError: false, isPending: false, refetch: vi.fn() });
  useCareerProgress.mockReturnValue({ progress, retry: retryProgress });
  fetchPathwayOrNull.mockResolvedValue(pathway);
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => usePathwayOverview("c1"), { wrapper });
}

describe("usePathwayOverview", () => {
  it("is loading until the career, its roadmap and the progress have all arrived", () => {
    useCareer.mockReturnValue({ data: undefined, isError: false, isPending: true, refetch: vi.fn() });
    useCareerProgress.mockReturnValue({ progress: { kind: "loading" }, retry: retryProgress });
    fetchPathwayOrNull.mockReturnValue(new Promise(() => {}));

    expect(setup().result.current.state.kind).toBe("loading");
  });

  it("is ready with the career's name and the overview of its roadmap", async () => {
    loaded();

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    const state = result.current.state;
    if (state.kind !== "ready") throw new Error("not ready");
    expect(state.careerTitle).toBe("Product Designer");
    expect(state.overview.steps.map((s) => s.title)).toEqual(["Foundations"]);
    expect(state.overview.upNext?.id).toBe("s1");
  });

  describe("making it their active pathway", () => {
    const activation = async (progress: CareerProgress) => {
      loaded(progress);
      const { result } = setup();
      await waitFor(() => expect(result.current.state.kind).toBe("ready"));
      const state = result.current.state;
      return state.kind === "ready" ? state.activation : "not ready";
    };

    it("is needed when they haven't saved the career yet, with no pathway to replace", async () => {
      expect(await activation({ kind: "untracked", activeCareerTitle: null })).toEqual({
        activeCareerTitle: null,
      });
    });

    it("is needed, naming the pathway it would replace, when another one is active", async () => {
      expect(await activation({ kind: "untracked", activeCareerTitle: "Data Analyst" })).toEqual({
        activeCareerTitle: "Data Analyst",
      });
    });

    it("is needed for a career they saved earlier but isn't active now", async () => {
      expect(
        await activation({
          kind: "inactive",
          counts: { completed: 1, total: 3, percentage: 33 },
          activeCareerTitle: "UX Designer",
        }),
      ).toEqual({ activeCareerTitle: "UX Designer" });
    });

    it("isn't needed when it already is their active pathway", async () => {
      expect(
        await activation({
          kind: "active",
          progress: {
            completed: 1,
            total: 3,
            percentage: 33,
            nextStepId: "s2",
            selfReported: true,
            startStepId: null,
          },
          statuses: {},
        }),
      ).toBeNull();
    });
  });

  it("loads the roadmap and the progress for the career it is given", async () => {
    loaded();

    setup();

    await waitFor(() => expect(fetchPathwayOrNull).toHaveBeenCalledWith("c1"));
    expect(useCareer).toHaveBeenCalledWith("c1");
    expect(useCareerProgress).toHaveBeenCalledWith("c1");
  });

  it("uses the person's progress on the roadmap", async () => {
    loaded({
      kind: "active",
      progress: {
        completed: 1,
        total: 1,
        percentage: 100,
        nextStepId: null,
        selfReported: true,
        startStepId: null,
      },
      statuses: { s1: "COMPLETED" },
    });

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    const state = result.current.state;
    expect(state.kind === "ready" && state.overview.completed).toBe(1);
  });

  it("says the roadmap isn't available when the career has none", async () => {
    loaded();
    fetchPathwayOrNull.mockResolvedValue(null);

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("unavailable"));
  });

  it("is an error when the career can't be loaded", async () => {
    loaded();
    useCareer.mockReturnValue({ data: undefined, isError: true, isPending: false, refetch: vi.fn() });

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });

  it("is an error when the roadmap can't be loaded", async () => {
    loaded();
    fetchPathwayOrNull.mockRejectedValue(new Error("boom"));

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });

  it("is an error, rather than a roadmap showing no progress, when progress can't be loaded", async () => {
    loaded({ kind: "error" });

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });

  it("retries the progress when asked to", async () => {
    loaded({ kind: "error" });
    const { result } = setup();
    await waitFor(() => expect(result.current.state.kind).toBe("error"));

    act(() => result.current.retry());

    expect(retryProgress).toHaveBeenCalledOnce();
  });
});
