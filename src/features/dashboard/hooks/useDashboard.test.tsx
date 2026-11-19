import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import type { DashboardDto } from "../../../lib/api/dashboard.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useDashboard } from "./useDashboard";

const fetchDashboard = vi.fn();

vi.mock("../../../lib/api/dashboard.api", () => ({ fetchDashboard: () => fetchDashboard() }));
vi.mock("../../../lib/api/auth.api", () => ({ ensureAuthHydrated: vi.fn() }));

beforeEach(() => {
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
});

afterEach(() => {
  cleanup();
  fetchDashboard.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

// A client error isn't retried, so the failure shows up straight away.
const clientError = () =>
  new AxiosError("nope", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 403,
    statusText: "Forbidden",
    data: {},
    headers: {},
    config: {} as never,
  });

const dashboard = (xp: number): DashboardDto => ({
  totals: { savedPathways: 0, completedSteps: 0, xp, badgesEarned: 0, badgesTotal: 0 },
  streak: { current: 0, longest: 0 },
  weekStrip: { days: [], currentStreak: 0 },
  heatmap: { from: "2025-11-18", to: "2026-11-18", days: [] },
  badges: [],
  activePathway: null,
  currentProject: null,
  goals: [],
});

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(() => useDashboard(), { wrapper }) };
}

describe("useDashboard", () => {
  it("is loading until the request arrives", () => {
    fetchDashboard.mockReturnValue(new Promise(() => {}));
    expect(setup().result.current.state.kind).toBe("loading");
  });

  it("is signed-out when nobody is signed in", () => {
    act(() => {
      useAuthStore.setState({ user: null, accessToken: null, isHydrating: false });
    });
    expect(setup().result.current.state.kind).toBe("signed-out");
    expect(fetchDashboard).not.toHaveBeenCalled();
  });

  it("is ready with the dashboard", async () => {
    fetchDashboard.mockResolvedValue(dashboard(10));
    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toEqual({ kind: "ready", dashboard: dashboard(10) });
  });

  it("is an error when the first request fails", async () => {
    fetchDashboard.mockRejectedValue(clientError());
    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));
  });

  it("keeps showing the last snapshot while a refresh runs in the background", async () => {
    fetchDashboard.mockResolvedValueOnce(dashboard(10));
    const { result, queryClient } = setup();
    await waitFor(() => expect(result.current.state.kind).toBe("ready"));

    let resolveRefresh: (value: DashboardDto) => void = () => {};
    fetchDashboard.mockReturnValueOnce(new Promise<DashboardDto>((r) => (resolveRefresh = r)));
    act(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
    });

    await waitFor(() => expect(fetchDashboard).toHaveBeenCalledTimes(2));
    expect(result.current.state).toEqual({ kind: "ready", dashboard: dashboard(10) });

    await act(async () => resolveRefresh(dashboard(25)));
    await waitFor(() =>
      expect(result.current.state).toEqual({ kind: "ready", dashboard: dashboard(25) }),
    );
  });

  it("keeps the snapshot when a background refresh fails", async () => {
    fetchDashboard.mockResolvedValueOnce(dashboard(10));
    const { result, queryClient } = setup();
    await waitFor(() => expect(result.current.state.kind).toBe("ready"));

    fetchDashboard.mockRejectedValueOnce(clientError());
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
    });

    expect(result.current.state).toEqual({ kind: "ready", dashboard: dashboard(10) });
  });
});
