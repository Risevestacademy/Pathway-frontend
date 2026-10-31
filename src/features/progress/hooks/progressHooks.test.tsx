import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useActivePathway } from "./useActivePathway";
import { useMyPathways } from "./useMyPathways";
import { useSetStartingPoint } from "./useSetStartingPoint";

const fetchSavedPathways = vi.fn();
const fetchActivePathway = vi.fn();
const setStartingPoint = vi.fn();

vi.mock("../../../lib/api/progress.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/progress.api")>()),
  fetchSavedPathways: () => fetchSavedPathways(),
  fetchActivePathway: () => fetchActivePathway(),
  setStartingPoint: (...args: unknown[]) => setStartingPoint(...args),
}));

beforeEach(() => {
  useAuthStore
    .getState()
    .setAuth({ id: "user-1", email: "ada@example.com", role: "USER" }, "token");
});
afterEach(() => {
  cleanup();
  useAuthStore.getState().clearAuth();
  fetchSavedPathways.mockReset();
  fetchActivePathway.mockReset();
  setStartingPoint.mockReset();
});

/** A failed request the server answered with `status`. */
const answered = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    data: {},
    statusText: "",
    headers: {},
    config: {},
  } as AxiosResponse);

function setup<T>(hook: () => T, queryClient?: QueryClient) {
  const client = queryClient ?? new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), invalidate, queryClient: client };
}

describe("useMyPathways", () => {
  it("loads the saved pathways into the cache the roadmap pages use", async () => {
    fetchSavedPathways.mockResolvedValue([{ career: { id: "a" } }]);
    const { result, queryClient } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(queryClient.getQueryData(queryKeys.progress.saved("user-1"))).toHaveLength(1);
  });

  it("doesn't load when it is switched off, or nobody is signed in", () => {
    setup(() => useMyPathways(false));
    expect(fetchSavedPathways).not.toHaveBeenCalled();

    useAuthStore.getState().clearAuth();
    setup(() => useMyPathways());
    expect(fetchSavedPathways).not.toHaveBeenCalled();
  });

  it("doesn't retry an error the server answered, such as an expired session", async () => {
    fetchSavedPathways.mockRejectedValue(answered(401));
    const { result } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchSavedPathways).toHaveBeenCalledTimes(1);
  });

  it("tries a server error again", async () => {
    fetchSavedPathways.mockRejectedValueOnce(answered(500)).mockResolvedValue([]);
    const { result } = setup(() => useMyPathways());

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 4000 });
    expect(fetchSavedPathways).toHaveBeenCalledTimes(2);
  });
});

describe("useActivePathway", () => {
  it("loads the pathway being followed into the cache the roadmap pages use", async () => {
    fetchActivePathway.mockResolvedValue({ career: null, pathway: null, progress: null, steps: [] });
    const { result, queryClient } = setup(() => useActivePathway());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.steps).toEqual([]);
    expect(queryClient.getQueryData(queryKeys.progress.active("user-1"))).toBeTruthy();
  });

  it("doesn't load when it is switched off, or nobody is signed in", () => {
    setup(() => useActivePathway(false));
    expect(fetchActivePathway).not.toHaveBeenCalled();

    useAuthStore.getState().clearAuth();
    setup(() => useActivePathway());
    expect(fetchActivePathway).not.toHaveBeenCalled();
  });

  it("doesn't retry an error the server answered", async () => {
    fetchActivePathway.mockRejectedValue(answered(404));
    const { result } = setup(() => useActivePathway());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchActivePathway).toHaveBeenCalledTimes(1);
  });
});

describe("useSetStartingPoint", () => {
  it("sends the step and refreshes everything about progress", async () => {
    setStartingPoint.mockResolvedValue({ careerId: "c1", startStepId: "s2", progress: {} });
    const { result, invalidate } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: "s2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStartingPoint).toHaveBeenCalledWith("c1", "s2");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.progress.all });
  });

  it("clears the starting point with a null step", async () => {
    setStartingPoint.mockResolvedValue({ careerId: "c1", startStepId: null, progress: {} });
    const { result } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: null });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStartingPoint).toHaveBeenCalledWith("c1", null);
  });

  it("leaves the caches alone when it fails", async () => {
    setStartingPoint.mockRejectedValue(answered(404));
    const { result, invalidate } = setup(() => useSetStartingPoint());

    result.current.mutate({ careerId: "c1", stepId: "s2" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("one cache for the roadmap pages and the dashboard", () => {
  it("is invalidated together, because both read keys under progress.all", () => {
    const all = queryKeys.progress.all;
    expect(queryKeys.progress.saved("user-1").slice(0, all.length)).toEqual([...all]);
    expect(queryKeys.progress.active("user-1").slice(0, all.length)).toEqual([...all]);
  });
});
