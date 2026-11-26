import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type {
  PathwayResourceItemDto,
  PathwayResourcesDto,
} from "../../../lib/api/pathwayResources.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import { resetResourceTicksMemory } from "../resourceTicks.store";
import { CareerNotSavedError } from "../../../lib/api/pathways.api";
import { useResourceTicks } from "./useResourceTicks";

const fetchPathwayOrNull = vi.fn();
const fetchPathwayResources = vi.fn();
const setResourceCompletion = vi.fn();

vi.mock("../../../lib/api/pathways.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/pathways.api")>()),
  fetchPathwayOrNull: (careerId: string) => fetchPathwayOrNull(careerId),
  setResourceCompletion: (...args: unknown[]) => setResourceCompletion(...args),
}));
vi.mock("../../../lib/api/pathwayResources.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/pathwayResources.api")>()),
  fetchPathwayResources: (pathwayId: string) => fetchPathwayResources(pathwayId),
}));

let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  resetResourceTicksMemory();
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "u1@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
  fetchPathwayOrNull.mockResolvedValue({ id: "p1", careerId: "c1", title: "Path", description: "", steps: [] });
});

afterEach(() => {
  cleanup();
  fetchPathwayOrNull.mockReset();
  fetchPathwayResources.mockReset();
  setResourceCompletion.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const resource = (id: string, isCompleted: boolean): PathwayResourceItemDto => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  type: "COURSE",
  costStatus: "FREE",
  estimatedWeeks: 1,
  lastCheckedDate: "2026-11-23T14:36:49.328Z",
  isCompleted,
  completedAt: isCompleted ? "2026-11-20T10:00:00.000Z" : null,
});

const resources: PathwayResourcesDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        { id: "s1", title: "One", order: 1, status: "NOT_STARTED", completedAt: null, resources: [resource("r1", true), resource("r2", false)] },
      ],
    },
  ],
  optionalPaidCourses: [],
};

const confirmed = (resourceId: string, completed: boolean) => ({
  resourceId,
  completed,
  completedAt: completed ? "2026-11-23T15:00:00.000Z" : null,
  xpAwarded: 0,
});

async function loaded() {
  fetchPathwayResources.mockResolvedValue(resources);
  const hook = renderHook(() => useResourceTicks("c1"), { wrapper });
  await waitFor(() => expect(hook.result.current.isTicked("r1")).toBe(true));
  return hook;
}

describe("useResourceTicks", () => {
  it("reads which resources are done from the server, for the career's pathway", async () => {
    const { result } = await loaded();

    expect(fetchPathwayOrNull).toHaveBeenCalledWith("c1");
    expect(fetchPathwayResources).toHaveBeenCalledWith("p1");
    expect(result.current.isTicked("r1")).toBe(true);
    expect(result.current.isTicked("r2")).toBe(false);
    expect(result.current.countTicked(["r1", "r2", "elsewhere"])).toBe(1);
  });

  it("has nothing ticked until the pathway's resources arrive", () => {
    fetchPathwayResources.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useResourceTicks("c1"), { wrapper });

    expect(result.current.isTicked("r1")).toBe(false);
    expect(result.current.countTicked(["r1"])).toBe(0);
    expect(result.current.unsaved).toEqual([]);
  });

  it("has nothing ticked when the resources can't be read", async () => {
    fetchPathwayResources.mockResolvedValue(null);

    const { result } = renderHook(() => useResourceTicks("c1"), { wrapper });

    await waitFor(() => expect(fetchPathwayResources).toHaveBeenCalled());
    expect(result.current.isTicked("r1")).toBe(false);
  });

  it("ticks a resource at once, and saves it", async () => {
    setResourceCompletion.mockResolvedValue(confirmed("r2", true));
    const { result } = await loaded();

    act(() => result.current.toggle("r2"));

    expect(result.current.isTicked("r2")).toBe(true);
    expect(setResourceCompletion).toHaveBeenCalledWith("p1", "r2", true);
    await waitFor(() => expect(result.current.unsaved).toEqual([]));
    expect(result.current.isTicked("r2")).toBe(true);
  });

  it("unticks a resource that was done, and saves that", async () => {
    setResourceCompletion.mockResolvedValue(confirmed("r1", false));
    const { result } = await loaded();

    act(() => result.current.toggle("r1"));

    expect(result.current.isTicked("r1")).toBe(false);
    expect(setResourceCompletion).toHaveBeenCalledWith("p1", "r1", false);
    await waitFor(() => expect(result.current.isTicked("r1")).toBe(false));
  });

  it("folds a confirmed save into the server's data, so the tick stays once the in-flight overlay is gone", async () => {
    setResourceCompletion.mockResolvedValue(confirmed("r2", true));
    const { result } = await loaded();

    act(() => result.current.toggle("r2"));

    await waitFor(() => {
      const cached = queryClient.getQueryData<PathwayResourcesDto>(
        queryKeys.pathwayResources("u1", "p1"),
      );
      expect(cached?.stages[0].steps[0].resources[1].isCompleted).toBe(true);
    });
    expect(result.current.isTicked("r2")).toBe(true);
  });

  it("shares ticks between everything that shows them", async () => {
    setResourceCompletion.mockResolvedValue(confirmed("r2", true));
    const first = await loaded();
    const second = renderHook(() => useResourceTicks("c1"), { wrapper });
    await waitFor(() => expect(second.result.current.isTicked("r1")).toBe(true));

    act(() => first.result.current.toggle("r2"));

    expect(second.result.current.isTicked("r2")).toBe(true);
  });

  describe("when a save fails", () => {
    it("keeps the tick for now, and says which resource isn't saved", async () => {
      setResourceCompletion.mockRejectedValue(new Error("offline"));
      const { result } = await loaded();

      act(() => result.current.toggle("r2"));

      await waitFor(() => expect(result.current.unsaved).toEqual(["r2"]));
      expect(result.current.isUnsaved("r2")).toBe(true);
      expect(result.current.isUnsaved("r1")).toBe(false);
      expect(result.current.isTicked("r2")).toBe(true);
    });

    it("saves it again when asked to, and clears it once it is saved", async () => {
      setResourceCompletion.mockRejectedValueOnce(new Error("offline"));
      setResourceCompletion.mockResolvedValueOnce(confirmed("r2", true));
      const { result } = await loaded();
      act(() => result.current.toggle("r2"));
      await waitFor(() => expect(result.current.unsaved).toEqual(["r2"]));

      act(() => result.current.retry());

      await waitFor(() => expect(result.current.unsaved).toEqual([]));
      expect(setResourceCompletion).toHaveBeenLastCalledWith("p1", "r2", true);
      expect(result.current.isTicked("r2")).toBe(true);
    });

    it("keeps it unsaved when trying again fails too", async () => {
      setResourceCompletion.mockRejectedValue(new Error("offline"));
      const { result } = await loaded();
      act(() => result.current.toggle("r2"));
      await waitFor(() => expect(result.current.unsaved).toEqual(["r2"]));

      act(() => result.current.retry());

      await waitFor(() => expect(setResourceCompletion).toHaveBeenCalledTimes(2));
      expect(result.current.unsaved).toEqual(["r2"]);
    });

    it("tries again with what was last wanted, so an unticked resource stays unticked", async () => {
      setResourceCompletion.mockRejectedValueOnce(new Error("offline"));
      setResourceCompletion.mockResolvedValueOnce(confirmed("r1", false));
      const { result } = await loaded();
      act(() => result.current.toggle("r1"));
      await waitFor(() => expect(result.current.unsaved).toEqual(["r1"]));

      act(() => result.current.retry());

      await waitFor(() => expect(setResourceCompletion).toHaveBeenLastCalledWith("p1", "r1", false));
    });
  });

  describe("a career the person isn't tracking", () => {
    it("puts the tick back and says the pathway isn't tracked, rather than that it wasn't saved", async () => {
      setResourceCompletion.mockRejectedValue(new CareerNotSavedError());
      const { result } = await loaded();
      expect(result.current.notTracking).toBe(false);

      act(() => result.current.toggle("r2"));

      await waitFor(() => expect(result.current.notTracking).toBe(true));
      expect(result.current.isTicked("r2")).toBe(false);
      expect(result.current.unsaved).toEqual([]);
      expect(result.current.isUnsaved("r2")).toBe(false);
    });

    it("clears the message when the next tick is saved", async () => {
      setResourceCompletion.mockRejectedValueOnce(new CareerNotSavedError());
      setResourceCompletion.mockResolvedValueOnce(confirmed("r2", true));
      const { result } = await loaded();
      act(() => result.current.toggle("r2"));
      await waitFor(() => expect(result.current.notTracking).toBe(true));

      act(() => result.current.toggle("r2"));

      await waitFor(() => expect(result.current.notTracking).toBe(false));
      expect(result.current.isTicked("r2")).toBe(true);
    });
  });

  describe("a tick and an untick in quick succession", () => {
    const deferred = <T,>() => {
      let resolve!: (value: T) => void;
      let reject!: (reason: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    it("ignores an older save that comes back after a newer one was sent", async () => {
      const first = deferred<ReturnType<typeof confirmed>>();
      const second = deferred<ReturnType<typeof confirmed>>();
      setResourceCompletion.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const { result } = await loaded();

      act(() => result.current.toggle("r2"));
      act(() => result.current.toggle("r2"));
      await act(async () => first.resolve(confirmed("r2", true)));

      expect(result.current.isTicked("r2")).toBe(false);

      await act(async () => second.resolve(confirmed("r2", false)));
      expect(result.current.isTicked("r2")).toBe(false);
    });

    it("keeps the newer save's failure retryable when an older save succeeded first", async () => {
      const first = deferred<ReturnType<typeof confirmed>>();
      const second = deferred<ReturnType<typeof confirmed>>();
      setResourceCompletion.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      setResourceCompletion.mockResolvedValueOnce(confirmed("r2", false));
      const { result } = await loaded();

      act(() => result.current.toggle("r2"));
      act(() => result.current.toggle("r2"));
      await act(async () => first.resolve(confirmed("r2", true)));
      await act(async () => second.reject(new Error("offline")));

      expect(result.current.unsaved).toEqual(["r2"]);
      expect(result.current.isTicked("r2")).toBe(false);

      act(() => result.current.retry());

      await waitFor(() => expect(setResourceCompletion).toHaveBeenLastCalledWith("p1", "r2", false));
      await waitFor(() => expect(result.current.unsaved).toEqual([]));
    });

    it("ignores an older save's failure once a newer save is on its way", async () => {
      const first = deferred<ReturnType<typeof confirmed>>();
      const second = deferred<ReturnType<typeof confirmed>>();
      setResourceCompletion.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const { result } = await loaded();

      act(() => result.current.toggle("r2"));
      act(() => result.current.toggle("r2"));
      await act(async () => first.reject(new Error("offline")));

      expect(result.current.unsaved).toEqual([]);
    });
  });

  it("does nothing until it knows the pathway to save to", async () => {
    fetchPathwayOrNull.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useResourceTicks("c1"), { wrapper });

    act(() => result.current.toggle("r2"));

    expect(setResourceCompletion).not.toHaveBeenCalled();
    expect(result.current.isTicked("r2")).toBe(false);
  });
});
