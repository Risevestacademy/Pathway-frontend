import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { ActivePathwayDto, SavedPathwayDto } from "../../../lib/api/progress.api";
import { useAuthStore } from "../../../lib/stores/authStore";
import { usePathwayCards } from "./usePathwayCards";

const fetchActivePathway = vi.fn();
const fetchSavedPathways = vi.fn();
const fetchPathwayOrNull = vi.fn();

vi.mock("../../../lib/api/progress.api", () => ({
  fetchActivePathway: () => fetchActivePathway(),
  fetchSavedPathways: () => fetchSavedPathways(),
}));
vi.mock("../../../lib/api/pathways.api", () => ({
  fetchPathwayOrNull: (careerId: string) => fetchPathwayOrNull(careerId),
}));
vi.mock("../../../lib/api/auth.api", () => ({ ensureAuthHydrated: vi.fn() }));

function signIn() {
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
}

beforeEach(() => signIn());

afterEach(() => {
  cleanup();
  fetchActivePathway.mockReset();
  fetchSavedPathways.mockReset();
  fetchPathwayOrNull.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const savedPathway = (id: string, title: string, isActive: boolean): SavedPathwayDto => ({
  career: { id, slug: id, title, retired: false },
  isActive,
  progress: { completed: 0, total: 1, percentage: 0 },
});

const activePathway: ActivePathwayDto = {
  career: { id: "c1", slug: "c1", title: "Frontend Developer", roleSummary: "", retired: false },
  pathway: { id: "p1", title: "Roadmap" },
  progress: {
    completed: 0,
    total: 1,
    percentage: 0,
    nextStepId: "s1",
    selfReported: true,
    startStepId: null,
  },
  steps: [{ id: "s1", order: 1, title: "HTML", skills: [], status: "NOT_STARTED" }],
};

const roadmap = (careerId: string) => ({
  id: `p-${careerId}`,
  careerId,
  title: "Roadmap",
  description: "",
  steps: [
    {
      id: "s1",
      title: "HTML",
      description: "Structure pages.",
      learningObjective: "",
      prerequisites: null,
      expectedActivity: "",
      order: 1,
      skills: [],
      resources: [],
    },
  ],
});

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => usePathwayCards(), { wrapper });
}

describe("usePathwayCards", () => {
  it("is loading until the saved and active pathways arrive", () => {
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

  it("makes a card for each saved pathway, using the active pathway and the career's roadmap", async () => {
    fetchActivePathway.mockResolvedValue(activePathway);
    fetchSavedPathways.mockResolvedValue([savedPathway("c1", "Frontend Developer", true)]);
    fetchPathwayOrNull.mockImplementation(async (id: string) => roadmap(id));

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    expect(result.current.state).toEqual({
      kind: "ready",
      cards: [
        {
          careerId: "c1",
          title: "Frontend Developer",
          isActive: true,
          currentStep: { title: "HTML", description: "Structure pages." },
          xp: 0,
        },
      ],
    });
  });

  it("is ready with no cards when nothing is saved", async () => {
    fetchActivePathway.mockResolvedValue({ career: null, pathway: null, progress: null, steps: [] });
    fetchSavedPathways.mockResolvedValue([]);

    const { result } = setup();

    await waitFor(() => expect(result.current.state).toEqual({ kind: "ready", cards: [] }));
    expect(fetchPathwayOrNull).not.toHaveBeenCalled();
  });

  it("shows the cards even if a career's roadmap can't be loaded", async () => {
    fetchActivePathway.mockResolvedValue(activePathway);
    fetchSavedPathways.mockResolvedValue([savedPathway("c1", "Frontend Developer", true)]);
    fetchPathwayOrNull.mockRejectedValue(new Error("boom"));

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
    const state = result.current.state;
    expect(state.kind === "ready" && state.cards[0].currentStep).toEqual({
      title: "HTML",
      description: "",
    });
  });

  it("is an error when the saved pathways can't be loaded, and retry loads them again", async () => {
    fetchActivePathway.mockResolvedValue(activePathway);
    fetchSavedPathways.mockRejectedValueOnce(new Error("boom"));

    const { result } = setup();

    await waitFor(() => expect(result.current.state.kind).toBe("error"));

    fetchSavedPathways.mockResolvedValue([]);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.state.kind).toBe("ready"));
  });
});
