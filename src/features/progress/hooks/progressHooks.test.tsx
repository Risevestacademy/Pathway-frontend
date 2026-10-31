import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ActivePathwayError, MyPathwaysError } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useActivePathway } from "./useActivePathway";
import { useMyPathways } from "./useMyPathways";
import { useSetActivePathway } from "./useSetActivePathway";
import { useSetStartingPoint } from "./useSetStartingPoint";
import { useSetStepStatus } from "./useSetStepStatus";

const fetchMyPathways = vi.fn();
const setPathwayStepStatus = vi.fn();
const setActivePathway = vi.fn();
const fetchActivePathway = vi.fn();
const setStartingPoint = vi.fn();

vi.mock("../../../lib/api/progress.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/progress.api")>()),
  fetchMyPathways: () => fetchMyPathways(),
  setPathwayStepStatus: (...args: unknown[]) => setPathwayStepStatus(...args),
  setActivePathway: (...args: unknown[]) => setActivePathway(...args),
  fetchActivePathway: () => fetchActivePathway(),
  setStartingPoint: (...args: unknown[]) => setStartingPoint(...args),
}));

afterEach(() => {
  cleanup();
  fetchMyPathways.mockReset();
  setPathwayStepStatus.mockReset();
  setActivePathway.mockReset();
  fetchActivePathway.mockReset();
  setStartingPoint.mockReset();
});

function setup<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), invalidate };
}

describe("useMyPathways", () => {
  it("loads the saved pathways", async () => {
    fetchMyPathways.mockResolvedValue([{ career: { id: "a" } }]);
    const { result } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("doesn't load when it is switched off", () => {
    setup(() => useMyPathways(false));

    expect(fetchMyPathways).not.toHaveBeenCalled();
  });

  it("doesn't retry an error the server answered, such as an expired session", async () => {
    fetchMyPathways.mockRejectedValue(new MyPathwaysError("Your session has expired.", 401));
    const { result } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMyPathways).toHaveBeenCalledTimes(1);
  });

  it("tries a dropped connection again, twice", async () => {
    fetchMyPathways.mockRejectedValue(new MyPathwaysError("We couldn’t reach the server."));
    const { result } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 4000 });
    expect(fetchMyPathways).toHaveBeenCalledTimes(3);
  });
});

describe("useSetStepStatus", () => {
  it("sends the status and refreshes the saved pathways list", async () => {
    setPathwayStepStatus.mockResolvedValue({ stepId: "s1", status: "COMPLETED", progress: {} });
    const { result, invalidate } = setup(() => useSetStepStatus());

    result.current.mutate({ stepId: "s1", status: "COMPLETED" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setPathwayStepStatus).toHaveBeenCalledWith("s1", "COMPLETED");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.pathways });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.activePathway });
  });

  it("leaves the list alone when marking the step fails", async () => {
    setPathwayStepStatus.mockRejectedValue(new Error("Save this career first."));
    const { result, invalidate } = setup(() => useSetStepStatus());

    result.current.mutate({ stepId: "s1", status: "COMPLETED" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("useSetActivePathway", () => {
  it("sends the career id and refreshes the saved pathways list", async () => {
    setActivePathway.mockResolvedValue({ career: null, pathway: null, progress: null, steps: [] });
    const { result, invalidate } = setup(() => useSetActivePathway());

    result.current.mutate("career-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setActivePathway).toHaveBeenCalledWith("career-1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.pathways });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.activePathway });
  });

  it("leaves the list alone when setting it fails", async () => {
    setActivePathway.mockRejectedValue(new Error("This career doesn’t have a pathway yet."));
    const { result, invalidate } = setup(() => useSetActivePathway());

    result.current.mutate("career-1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("useActivePathway", () => {
  it("loads the pathway being followed", async () => {
    fetchActivePathway.mockResolvedValue({ career: null, pathway: null, progress: null, steps: [] });
    const { result } = setup(() => useActivePathway());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.steps).toEqual([]);
  });

  it("doesn't load when it is switched off", () => {
    setup(() => useActivePathway(false));

    expect(fetchActivePathway).not.toHaveBeenCalled();
  });

  it("doesn't retry an error the server answered", async () => {
    fetchActivePathway.mockRejectedValue(new ActivePathwayError("Your session has expired.", 401));
    const { result } = setup(() => useActivePathway());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchActivePathway).toHaveBeenCalledTimes(1);
  });

  it("tries a dropped connection again, twice", async () => {
    fetchActivePathway.mockRejectedValue(new ActivePathwayError("We couldn’t reach the server."));
    const { result } = setup(() => useActivePathway());

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 4000 });
    expect(fetchActivePathway).toHaveBeenCalledTimes(3);
  });
});

describe("useSetStartingPoint", () => {
  it("sends the step and refreshes the saved pathways and the active pathway", async () => {
    setStartingPoint.mockResolvedValue({ careerId: "c1", startStepId: "s2", progress: {} });
    const { result, invalidate } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: "s2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStartingPoint).toHaveBeenCalledWith("c1", "s2");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.pathways });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.activePathway });
  });

  it("clears the starting point with a null step", async () => {
    setStartingPoint.mockResolvedValue({ careerId: "c1", startStepId: null, progress: {} });
    const { result } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: null });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStartingPoint).toHaveBeenCalledWith("c1", null);
  });

  it("leaves the caches alone when it fails", async () => {
    setStartingPoint.mockRejectedValue(new Error("Save this pathway first."));
    const { result, invalidate } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: "s2" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
