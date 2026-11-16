import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import type { ActivePathwayDto } from "../../../lib/api/progress.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useDashboardSummary } from "./useDashboardSummary";

const fetchActivePathway = vi.fn();
const fetchSavedPathways = vi.fn();

vi.mock("../../../lib/api/progress.api", () => ({
  fetchActivePathway: () => fetchActivePathway(),
  fetchSavedPathways: () => fetchSavedPathways(),
}));
vi.mock("../../../lib/api/auth.api", () => ({ ensureAuthHydrated: vi.fn() }));

beforeEach(() => {
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
});

afterEach(() => {
  cleanup();
  fetchActivePathway.mockReset();
  fetchSavedPathways.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const active: ActivePathwayDto = {
  career: { id: "c1", slug: "c1", title: "Frontend", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Roadmap" },
  progress: {
    completed: 2,
    total: 4,
    percentage: 50,
    nextStepId: "s3",
    selfReported: true,
    startStepId: null,
  },
  steps: [],
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useDashboardSummary(), { wrapper });
}

const httpError = (status: number) => new AxiosError("nope", "ERR_BAD_REQUEST", undefined, undefined, {
  status,
  statusText: "Error",
  data: {},
  headers: {},
  config: {} as never,
});

describe("useDashboardSummary", () => {
  it("is loading until both requests arrive", () => {
    fetchActivePathway.mockReturnValue(new Promise(() => {}));
    fetchSavedPathways.mockReturnValue(new Promise(() => {}));

    expect(setup().result.current.state.kind).toBe("loading");
  });

  it("is signed-out when nobody is signed in", () => {
    act(() => {
      useAuthStore.setState({ user: null, accessToken: null, isHydrating: false });
    });

    expect(setup().result.current.state.kind).toBe("signed-out");
  });

  it("is ready with the summary", async () => {
    fetchActivePathway.mockResolvedValue(active);
    fetchSavedPathways.mockResolvedValue([
      { career: { id: "c1", slug: "c1", title: "Frontend", retired: false }, isActive: true, progress: active.progress },
    ]);

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({
      kind: "ready",
      summary: { hasActivePathway: true, progressPercent: 50, completedSteps: 2, pathwaysCount: 1 },
    });
  });

  it("is ready and empty when the backend has no active pathway (404)", async () => {
    fetchActivePathway.mockRejectedValue(httpError(404));
    fetchSavedPathways.mockResolvedValue([]);

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({
      summary: { hasActivePathway: false, progressPercent: 0, completedSteps: 0, pathwaysCount: 0 },
    });
  });

  it("is an error when a request fails, and retry loads again", async () => {
    fetchActivePathway.mockResolvedValue(active);
    fetchSavedPathways.mockRejectedValueOnce(httpError(403));

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));

    fetchSavedPathways.mockResolvedValue([]);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
  });
});
