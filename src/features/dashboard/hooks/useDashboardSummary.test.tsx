import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { DashboardDto } from "../../../lib/api/dashboard.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useDashboardSummary } from "./useDashboardSummary";

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

const dashboard: DashboardDto = {
  totals: { savedPathways: 1, completedSteps: 2, xp: 0, badgesEarned: 0, badgesTotal: 0 },
  streak: { current: 0, longest: 0 },
  weekStrip: { days: [], currentStreak: 0 },
  heatmap: { from: "2025-11-18", to: "2026-11-18", days: [] },
  badges: [],
  activePathway: {
    pathwayId: "p1",
    career: { id: "c1", title: "Frontend", description: "", retired: false },
    progress: { completed: 2, total: 4, percentage: 50, nextStepId: "s3", selfReported: true },
  },
  currentProject: null,
  goals: [],
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useDashboardSummary(), { wrapper });
}

describe("useDashboardSummary", () => {
  it("is loading until the request arrives", () => {
    fetchDashboard.mockReturnValue(new Promise(() => {}));

    expect(setup().result.current.state.kind).toBe("loading");
  });

  it("is signed-out when nobody is signed in", () => {
    act(() => {
      useAuthStore.setState({ user: null, accessToken: null, isHydrating: false });
    });

    expect(setup().result.current.state.kind).toBe("signed-out");
  });

  it("is ready with the summary", async () => {
    fetchDashboard.mockResolvedValue(dashboard);

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({
      kind: "ready",
      summary: {
        hasActivePathway: true,
        progressPercent: 50,
        completedSteps: 2,
        totalCompletedSteps: 2,
        pathwaysCount: 1,
      },
    });
  });

  it("is ready and empty for a new user", async () => {
    fetchDashboard.mockResolvedValue({
      ...dashboard,
      totals: { ...dashboard.totals, savedPathways: 0, completedSteps: 0 },
      activePathway: null,
    });

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toMatchObject({
      summary: { hasActivePathway: false, progressPercent: 0, completedSteps: 0, pathwaysCount: 0 },
    });
  });
});
