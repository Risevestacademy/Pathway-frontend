import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { StartingPointError } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import type { ActivePathway } from "../../progress/progress.types";
import { startingPointOnServer, syncLocalProgress } from "./activePathwaySync";
import { useResolveStartingPoint } from "./useSkillCheckActions";
import { useSyncLocalProgress } from "./useSyncLocalProgress";

const fetchCareers = vi.fn();
const fetchPathwayOrNull = vi.fn();
const setActivePathway = vi.fn();
const setStartingPoint = vi.fn();
const setPathwayStepStatus = vi.fn();
const fetchCompletedSteps = vi.fn();
const fetchSkillCheckRecord = vi.fn();
const resolveStartingPoint = vi.fn();
const fetchActiveCareerId = vi.fn();

vi.mock("../../../lib/api/careers.api", () => ({
  fetchCareers: (...args: unknown[]) => fetchCareers(...args),
}));
vi.mock("../../../lib/api/pathways.api", () => ({
  fetchPathwayOrNull: (...args: unknown[]) => fetchPathwayOrNull(...args),
}));
vi.mock("../../../lib/api/progress.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/progress.api")>()),
  setActivePathway: (...args: unknown[]) => setActivePathway(...args),
  setStartingPoint: (...args: unknown[]) => setStartingPoint(...args),
  setPathwayStepStatus: (...args: unknown[]) => setPathwayStepStatus(...args),
}));
vi.mock("../../../lib/api/roadmapPreview.api", () => ({
  fetchCompletedSteps: (...args: unknown[]) => fetchCompletedSteps(...args),
  setStepComplete: vi.fn(),
}));
vi.mock("../../../lib/api/skillCheck.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/skillCheck.api")>()),
  fetchSkillCheckRecord: (...args: unknown[]) => fetchSkillCheckRecord(...args),
  resolveStartingPoint: (...args: unknown[]) => resolveStartingPoint(...args),
  fetchActiveCareerId: (...args: unknown[]) => fetchActiveCareerId(...args),
}));

const catalogue = [
  { id: "uuid-fe", slug: "frontend-engineer", title: "Frontend Engineer", shortDescription: "" },
];

// Deliberately out of order: the steps are put in order by their number.
const pathwayFromServer = {
  id: "p1",
  steps: [
    { id: "s3", order: 3 },
    { id: "s1", order: 1 },
    { id: "s2", order: 2 },
  ],
};

const active = (over: Partial<ActivePathway> = {}, startStepId: string | null = null): ActivePathway => ({
  career: { id: "uuid-fe", slug: "fe", title: "Frontend Engineer", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Frontend" },
  progress: {
    completed: 0,
    total: 3,
    percentage: 0,
    nextStepId: "s1",
    selfReported: true,
    startStepId,
  },
  steps: [
    { id: "s1", order: 1, title: "One", skills: [], status: "NOT_STARTED" },
    { id: "s2", order: 2, title: "Two", skills: [], status: "NOT_STARTED" },
    { id: "s3", order: 3, title: "Three", skills: [], status: "NOT_STARTED" },
  ],
  ...over,
});

beforeEach(() => {
  fetchCareers.mockResolvedValue(catalogue);
  fetchPathwayOrNull.mockResolvedValue(pathwayFromServer);
  setActivePathway.mockResolvedValue({});
  setStartingPoint.mockResolvedValue({});
  setPathwayStepStatus.mockResolvedValue({});
  fetchCompletedSteps.mockResolvedValue([]);
  fetchSkillCheckRecord.mockResolvedValue(null);
  resolveStartingPoint.mockImplementation(async () => ({ careerId: "frontend-developer" }));
  fetchActiveCareerId.mockResolvedValue(null);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const client = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("startingPointOnServer", () => {
  it("sends the real step that My Pathway’s step number stands for, and refreshes", async () => {
    const queryClient = client();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await expect(startingPointOnServer(queryClient, "frontend-developer", 3)).resolves.toBe(true);

    expect(setStartingPoint).toHaveBeenCalledWith("uuid-fe", "s3");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.pathways });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.activePathway });
  });

  it("does nothing, and says so, for a career or step the catalogue doesn’t have", async () => {
    await expect(startingPointOnServer(client(), "data-analyst", 1)).resolves.toBe(false);
    await expect(startingPointOnServer(client(), "frontend-developer", 9)).resolves.toBe(false);

    expect(setStartingPoint).not.toHaveBeenCalled();
  });

  it("saves the pathway and tries again, once, when the server says it isn't saved", async () => {
    setStartingPoint
      .mockRejectedValueOnce(new StartingPointError("Save this pathway first.", 404))
      .mockResolvedValueOnce({});

    await expect(startingPointOnServer(client(), "frontend-developer", 2)).resolves.toBe(true);

    expect(setActivePathway).toHaveBeenCalledWith("uuid-fe");
    expect(setStartingPoint).toHaveBeenCalledTimes(2);
  });

  it("lets any other refusal through without saving anything", async () => {
    setStartingPoint.mockRejectedValue(new StartingPointError("That step isn’t part of this pathway.", 400));

    await expect(startingPointOnServer(client(), "frontend-developer", 2)).rejects.toThrow(
      "isn’t part of this pathway",
    );
    expect(setActivePathway).not.toHaveBeenCalled();
  });
});

describe("syncLocalProgress", () => {
  it("sends the starting step and the steps done that the server is missing", async () => {
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: { stepOrder: 2, source: "ACCEPTED" } });
    fetchCompletedSteps.mockResolvedValue([3, 2]);
    const queryClient = client();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const changed = await syncLocalProgress(queryClient, "u1", "frontend-developer", active());

    expect(changed).toBe(true);
    expect(setStartingPoint).toHaveBeenCalledWith("uuid-fe", "s2");
    // Done in order, and each only once.
    expect(setPathwayStepStatus.mock.calls).toEqual([
      ["s2", "COMPLETED"],
      ["s3", "COMPLETED"],
    ]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.activePathway });
  });

  it("leaves out what the server already has", async () => {
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: { stepOrder: 2, source: "ACCEPTED" } });
    fetchCompletedSteps.mockResolvedValue([1, 2]);
    const onServer = active(
      {
        steps: [
          { id: "s1", order: 1, title: "One", skills: [], status: "COMPLETED" },
          { id: "s2", order: 2, title: "Two", skills: [], status: "NOT_STARTED" },
          { id: "s3", order: 3, title: "Three", skills: [], status: "NOT_STARTED" },
        ],
      },
      "s2",
    );

    await syncLocalProgress(client(), "u1", "frontend-developer", onServer);

    expect(setStartingPoint).not.toHaveBeenCalled();
    expect(setPathwayStepStatus.mock.calls).toEqual([["s2", "COMPLETED"]]);
  });

  it("sends nothing, and doesn’t refresh, when the server is already up to date", async () => {
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: { stepOrder: 2, source: "ACCEPTED" } });
    fetchCompletedSteps.mockResolvedValue([]);
    const queryClient = client();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const changed = await syncLocalProgress(queryClient, "u1", "frontend-developer", active({}, "s2"));

    expect(changed).toBe(false);
    expect(setStartingPoint).not.toHaveBeenCalled();
    expect(setPathwayStepStatus).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("doesn’t invent a starting step when My Pathway has none", async () => {
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: null });

    await syncLocalProgress(client(), "u1", "frontend-developer", active());

    expect(setStartingPoint).not.toHaveBeenCalled();
  });

  it("does nothing when the server’s active pathway isn’t the one My Pathway has active", async () => {
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: { stepOrder: 2, source: "ACCEPTED" } });
    fetchCompletedSteps.mockResolvedValue([1]);
    const other = active({
      career: { id: "uuid-other", slug: "o", title: "Other", roleSummary: "", retired: false },
    });

    await expect(syncLocalProgress(client(), "u1", "frontend-developer", other)).resolves.toBe(false);

    expect(setStartingPoint).not.toHaveBeenCalled();
    expect(setPathwayStepStatus).not.toHaveBeenCalled();
  });
});

function setupHook<T>(hook: () => T) {
  const queryClient = client();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(hook, { wrapper });
}

describe("useResolveStartingPoint", () => {
  it("tells the server the chosen step first, then records it in My Pathway", async () => {
    const order: string[] = [];
    setStartingPoint.mockImplementation(async () => {
      order.push("server");
    });
    resolveStartingPoint.mockImplementation(async () => {
      order.push("local");
      return {};
    });
    const { result } = setupHook(() => useResolveStartingPoint("frontend-developer"));

    result.current.mutate({ stepOrder: 3, source: "ACCEPTED" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(order).toEqual(["server", "local"]);
    expect(setStartingPoint).toHaveBeenCalledWith("uuid-fe", "s3");
  });

  it("doesn’t tell the server when the current starting point is kept", async () => {
    const { result } = setupHook(() => useResolveStartingPoint("frontend-developer"));

    result.current.mutate(null);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setStartingPoint).not.toHaveBeenCalled();
    expect(resolveStartingPoint).toHaveBeenCalled();
  });

  it("changes nothing in My Pathway when the server refuses", async () => {
    setStartingPoint.mockRejectedValue(new StartingPointError("That step isn’t part of this pathway.", 400));
    const { result } = setupHook(() => useResolveStartingPoint("frontend-developer"));

    result.current.mutate({ stepOrder: 3, source: "ACCEPTED" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(resolveStartingPoint).not.toHaveBeenCalled();
  });
});

describe("useSyncLocalProgress", () => {
  const localState = () => {
    fetchActiveCareerId.mockResolvedValue("frontend-developer");
    fetchSkillCheckRecord.mockResolvedValue({ startingPoint: { stepOrder: 2, source: "ACCEPTED" } });
  };

  it("catches the server up once for a pathway begun in My Pathway", async () => {
    localState();
    const { rerender } = setupHook(() => useSyncLocalProgress(active()));

    await waitFor(() => expect(setStartingPoint).toHaveBeenCalledWith("uuid-fe", "s2"));
    rerender();

    expect(setStartingPoint).toHaveBeenCalledTimes(1);
  });

  it("waits until the server’s active pathway is known", async () => {
    localState();
    setupHook(() => useSyncLocalProgress(undefined));

    await waitFor(() => expect(fetchActiveCareerId).toHaveBeenCalled());
    expect(setStartingPoint).not.toHaveBeenCalled();
  });

  it("does nothing when nothing has been begun in My Pathway", async () => {
    fetchActiveCareerId.mockResolvedValue(null);
    setupHook(() => useSyncLocalProgress(active()));

    await waitFor(() => expect(fetchActiveCareerId).toHaveBeenCalled());
    expect(setStartingPoint).not.toHaveBeenCalled();
  });

  it("gives up quietly when the server refuses", async () => {
    localState();
    setStartingPoint.mockRejectedValue(new StartingPointError("Save this pathway first.", 404));
    setupHook(() => useSyncLocalProgress(active()));

    await waitFor(() => expect(setStartingPoint).toHaveBeenCalledTimes(1));
    expect(setPathwayStepStatus).not.toHaveBeenCalled();
  });
});
