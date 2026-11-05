import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { SavedPathwayDto } from "../../../lib/api/progress.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useEarlierPathways } from "./useEarlierPathways";

const fetchSavedPathways = vi.fn();

vi.mock("../../../lib/api/progress.api", () => ({
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
  fetchSavedPathways.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const saved = (id: string, title: string, isActive: boolean, completed = 1, total = 4, retired = false): SavedPathwayDto => ({
  career: { id, slug: id, title, retired },
  isActive,
  progress: { completed, total, percentage: 0 },
});

function setup(careerId = "c1") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEarlierPathways(careerId), { wrapper });
}

describe("useEarlierPathways", () => {
  it("is empty until the saved pathways have loaded", () => {
    fetchSavedPathways.mockReturnValue(new Promise(() => {}));

    expect(setup().result.current).toEqual([]);
  });

  it("lists the saved pathways that aren't active, with how far they got", async () => {
    fetchSavedPathways.mockResolvedValue([
      saved("c1", "Product Designer", true),
      saved("c2", "Frontend Developer", false, 7, 18),
      saved("c3", "Data Analyst", false, 3, 15),
    ]);

    const { result } = setup("c1");

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current).toEqual([
      { careerId: "c2", title: "Frontend Developer", completed: 7, total: 18 },
      { careerId: "c3", title: "Data Analyst", completed: 3, total: 15 },
    ]);
  });

  it("leaves out the career being looked at, even when it isn't the active one", async () => {
    fetchSavedPathways.mockResolvedValue([
      saved("c1", "Product Designer", false),
      saved("c2", "Frontend Developer", false),
    ]);

    const { result } = setup("c1");

    await waitFor(() => expect(result.current.map((p) => p.careerId)).toEqual(["c2"]));
  });

  it("leaves out a career that has since been retired", async () => {
    fetchSavedPathways.mockResolvedValue([
      saved("c2", "Frontend Developer", false, 1, 4, true),
      saved("c3", "Data Analyst", false),
    ]);

    const { result } = setup("c1");

    await waitFor(() => expect(result.current.map((p) => p.careerId)).toEqual(["c3"]));
  });

  it("is empty when nothing else is saved, or the list can't be loaded", async () => {
    fetchSavedPathways.mockResolvedValue([saved("c1", "Product Designer", true)]);

    const { result } = setup("c1");

    await waitFor(() => expect(fetchSavedPathways).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });
});
