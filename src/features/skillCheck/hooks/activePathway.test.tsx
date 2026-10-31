import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryKeys } from "../../../lib/queryKeys";
import { activateOnServer } from "./activePathwaySync";
import { useSwitchActiveCareer } from "./useSkillCheckActions";
import { useSyncLocalActivePathway } from "./useSyncLocalActivePathway";

const fetchCareers = vi.fn();
const setActivePathway = vi.fn();
const switchActiveCareer = vi.fn();
const fetchActiveCareerId = vi.fn();

vi.mock("../../../lib/api/careers.api", () => ({
  fetchCareers: (...args: unknown[]) => fetchCareers(...args),
}));
vi.mock("../../../lib/api/progress.api", () => ({
  setActivePathway: (...args: unknown[]) => setActivePathway(...args),
}));
vi.mock("../../../lib/api/skillCheck.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/api/skillCheck.api")>()),
  switchActiveCareer: (...args: unknown[]) => switchActiveCareer(...args),
  fetchActiveCareerId: (...args: unknown[]) => fetchActiveCareerId(...args),
}));

const catalogue = [
  { id: "uuid-frontend", slug: "frontend-engineer", title: "Frontend Engineer", shortDescription: "" },
  { id: "uuid-qa", slug: "qa-engineer", title: "QA Engineer", shortDescription: "" },
];

beforeEach(() => {
  fetchCareers.mockResolvedValue(catalogue);
  setActivePathway.mockResolvedValue({ career: null, pathway: null, progress: null, steps: [] });
  switchActiveCareer.mockImplementation(async (_user: string, id: string) => id);
  fetchActiveCareerId.mockResolvedValue(null);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function setup<T>(hook: () => T, queryClient = client()) {
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), invalidate, queryClient };
}

describe("activateOnServer", () => {
  it("tells the server the real career’s id and refreshes the saved pathways", async () => {
    const queryClient = client();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await expect(activateOnServer(queryClient, "frontend-developer")).resolves.toBe(true);

    expect(setActivePathway).toHaveBeenCalledWith("uuid-frontend");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me.pathways });
  });

  it("does nothing, and says so, for a career the catalogue doesn’t have", async () => {
    await expect(activateOnServer(client(), "data-analyst")).resolves.toBe(false);

    expect(setActivePathway).not.toHaveBeenCalled();
  });

  it("lets the server’s refusal through", async () => {
    setActivePathway.mockRejectedValue(new Error("This career doesn’t have a pathway yet."));

    await expect(activateOnServer(client(), "frontend-developer")).rejects.toThrow(
      "doesn’t have a pathway yet",
    );
  });
});

describe("useSwitchActiveCareer", () => {
  it("switches on the server first, then in My Pathway", async () => {
    const order: string[] = [];
    setActivePathway.mockImplementation(async () => {
      order.push("server");
    });
    switchActiveCareer.mockImplementation(async (_u: string, id: string) => {
      order.push("local");
      return id;
    });
    const { result } = setup(() => useSwitchActiveCareer());

    result.current.mutate("frontend-developer");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(order).toEqual(["server", "local"]);
    expect(setActivePathway).toHaveBeenCalledWith("uuid-frontend");
  });

  it("only switches in My Pathway for a career with no match in the catalogue", async () => {
    const { result } = setup(() => useSwitchActiveCareer());

    result.current.mutate("data-analyst");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setActivePathway).not.toHaveBeenCalled();
    expect(switchActiveCareer).toHaveBeenCalledWith(expect.anything(), "data-analyst");
  });

  it("changes nothing in My Pathway when the server refuses", async () => {
    setActivePathway.mockRejectedValue(new Error("This career isn’t available to follow right now."));
    const { result } = setup(() => useSwitchActiveCareer());

    result.current.mutate("frontend-developer");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(switchActiveCareer).not.toHaveBeenCalled();
  });
});

describe("useSyncLocalActivePathway", () => {
  it("saves a pathway begun in My Pathway when the server has none, once", async () => {
    fetchActiveCareerId.mockResolvedValue("frontend-developer");
    const { result, rerender } = setup(() => useSyncLocalActivePathway(true));

    await waitFor(() => expect(setActivePathway).toHaveBeenCalledWith("uuid-frontend"));
    await waitFor(() => expect(result.current.syncing).toBe(false));
    rerender();

    expect(setActivePathway).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the server already has a pathway", async () => {
    fetchActiveCareerId.mockResolvedValue("frontend-developer");
    setup(() => useSyncLocalActivePathway(false));

    await waitFor(() => expect(fetchActiveCareerId).toHaveBeenCalled());
    expect(setActivePathway).not.toHaveBeenCalled();
  });

  it("does nothing when nothing has been begun in My Pathway", async () => {
    fetchActiveCareerId.mockResolvedValue(null);
    setup(() => useSyncLocalActivePathway(true));

    await waitFor(() => expect(fetchActiveCareerId).toHaveBeenCalled());
    expect(setActivePathway).not.toHaveBeenCalled();
  });

  it("gives up quietly when the server refuses", async () => {
    fetchActiveCareerId.mockResolvedValue("frontend-developer");
    setActivePathway.mockRejectedValue(new Error("This career doesn’t have a pathway yet."));
    const { result } = setup(() => useSyncLocalActivePathway(true));

    await waitFor(() => expect(setActivePathway).toHaveBeenCalled());
    await waitFor(() => expect(result.current.syncing).toBe(false));
    expect(setActivePathway).toHaveBeenCalledTimes(1);
  });
});
