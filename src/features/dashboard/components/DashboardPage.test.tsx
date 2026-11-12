import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ActivePathway, SavedPathway } from "../../progress/progress.types";
import { DashboardPage } from "./DashboardPage";

const refetch = vi.fn();
const useSync = vi.fn();
const useSyncProgress = vi.fn();
let syncing = false;
let state: {
  data?: SavedPathway[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};
let activeState: { data?: ActivePathway; isPending: boolean; isError: boolean };
let user: { fullName?: string; email: string } | null;

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("../../../components/AppTopNav", () => ({
  default: () => <nav aria-label="Main" />,
}));
vi.mock("../../progress/hooks/useMyPathways", () => ({
  useMyPathways: () => ({ refetch, ...state }),
}));
vi.mock("../../progress/hooks/useActivePathway", () => ({
  useActivePathway: () => activeState,
}));
vi.mock("../../skillCheck/hooks/useSyncLocalProgress", () => ({
  useSyncLocalProgress: (active: unknown) => useSyncProgress(active),
}));
vi.mock("../../skillCheck/hooks/useSyncLocalActivePathway", () => ({
  useSyncLocalActivePathway: (serverHasNone: boolean) => {
    useSync(serverHasNone);
    return { syncing };
  },
}));
vi.mock("../../../lib/stores/authStore", () => ({
  useAuthStore: (select: (s: { user: typeof user }) => unknown) => select({ user }),
}));

const pathway = (id: string, over: Partial<SavedPathway> = {}): SavedPathway => ({
  career: { id, slug: id, title: `Career ${id}`, retired: false },
  isActive: false,
  progress: { completed: 3, total: 8, percentage: 38 },
  ...over,
});

const activePathway = (careerId: string): ActivePathway => ({
  career: {
    id: careerId,
    slug: careerId,
    title: `Career ${careerId}`,
    roleSummary: "Builds the parts of the web people see.",
    retired: false,
  },
  pathway: { id: "p1", title: "Frontend & FullStack Pathway" },
  progress: {
    completed: 3,
    total: 8,
    percentage: 38,
    nextStepId: "s4",
    selfReported: true,
    startStepId: null,
  },
  steps: [
    { id: "s1", order: 1, title: "HTML basics", skills: [], status: "COMPLETED" },
    { id: "s2", order: 2, title: "CSS basics", skills: [], status: "COMPLETED" },
    { id: "s3", order: 3, title: "JavaScript basics", skills: [], status: "IN_PROGRESS" },
    {
      id: "s4",
      order: 4,
      title: "Semantic HTML",
      skills: [
        { id: "k1", name: "HTML" },
        { id: "k2", name: "CSS" },
      ],
      status: "NOT_STARTED",
    },
  ],
});

beforeEach(() => {
  refetch.mockReset();
  useSync.mockReset();
  useSyncProgress.mockReset();
  syncing = false;
  state = {
    data: [pathway("a", { isActive: true })],
    isPending: false,
    isError: false,
    error: null,
  };
  activeState = { data: activePathway("a"), isPending: false, isError: false };
  user = { fullName: "Maya Okafor", email: "maya@example.com" };
  // Friday morning.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 30, 9, 0));
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const card = (name: string) => screen.getByRole("region", { name });

describe("DashboardPage states", () => {
  it.each([
    ["loading", { isPending: true, isError: false, error: null }],
    ["failed", { isPending: false, isError: true, error: new Error("No") }],
    ["empty", { data: [], isPending: false, isError: false, error: null }],
    ["populated", { data: [pathway("a")], isPending: false, isError: false, error: null }],
  ])("keeps the app navigation on screen when %s", (_name, next) => {
    state = next as typeof state;
    render(<DashboardPage />);

    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  });

  it("shows a loading state", () => {
    state = { isPending: true, isError: false, error: null };
    const { container } = render(<DashboardPage />);

    expect(container.querySelector("[aria-busy]")).toBeTruthy();
  });

  it("waits instead of showing the empty welcome while a pathway begun in My Pathway is saved", () => {
    state.data = [];
    syncing = true;
    const { container } = render(<DashboardPage />);

    expect(container.querySelector("[aria-busy]")).toBeTruthy();
    expect(screen.queryByText("Your pathway starts here!")).toBeNull();
  });

  it("only offers to catch the server up when it has no saved pathways", () => {
    state.data = [];
    const { unmount } = render(<DashboardPage />);
    expect(useSync).toHaveBeenLastCalledWith(true);
    unmount();

    state.data = [pathway("a")];
    render(<DashboardPage />);
    expect(useSync).toHaveBeenLastCalledWith(false);
  });

  it("hands the server’s active pathway to the catch-up of progress made in My Pathway", () => {
    render(<DashboardPage />);

    expect(useSyncProgress).toHaveBeenLastCalledWith(activeState.data);
  });

  it("explains why it couldn’t load and lets them try again", async () => {
    state = {
      isPending: false,
      isError: true,
      error: new Error("We couldn’t load your pathways. Please try again."),
    };
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Good Morning, Maya");
    expect(screen.getByText("We couldn’t load your pathways. Please try again.")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  describe("with nothing saved", () => {
    beforeEach(() => {
      state.data = [];
    });

    it("welcomes them and points to exploring careers", () => {
      render(<DashboardPage />);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Welcome, Maya");
      expect(screen.getByText("Your pathway starts here!")).toBeTruthy();
      expect(screen.getByRole("link", { name: /Explore careers/ }).getAttribute("href")).toBe(
        "/careers",
      );
    });

    it("shows none of the progress cards", () => {
      render(<DashboardPage />);

      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.queryByRole("tablist")).toBeNull();
    });

    it("still welcomes someone with no name on record", () => {
      user = null;
      render(<DashboardPage />);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Welcome");
    });
  });
});

describe("DashboardPage with a pathway", () => {
  it("greets by time of day and first name, with Overview selected", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Good Morning, Maya");
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Overview",
      "Next steps",
      "Projects",
    ]);
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  describe("Current Progress", () => {
    it("shows the percentage, a bar, and where to continue", () => {
      render(<DashboardPage />);

      const progress = card("Current Progress");
      expect(within(progress).getByText("38%")).toBeTruthy();
      expect(within(progress).getByText("Career a")).toBeTruthy();
      const bar = within(progress).getByRole("progressbar", { name: "Career a progress" });
      expect(bar.getAttribute("aria-valuenow")).toBe("38");
      expect(within(progress).getByRole("link", { name: /Continue with Semantic HTML/ })).toBeTruthy();
    });

    it("falls back to a general label when the next step isn’t known yet", () => {
      activeState = { isPending: true, isError: false };
      render(<DashboardPage />);

      expect(
        within(card("Current Progress")).getByRole("link", { name: /Continue your roadmap/ }),
      ).toBeTruthy();
    });

    it("says Start for a pathway with nothing done and Review for a finished one", () => {
      activeState = { isPending: true, isError: false };
      state.data = [pathway("new", { progress: { completed: 0, total: 8, percentage: 0 } })];
      const { unmount } = render(<DashboardPage />);
      expect(
        within(card("Current Progress")).getByRole("link", { name: /Start your roadmap/ }),
      ).toBeTruthy();
      unmount();

      state.data = [pathway("done", { progress: { completed: 8, total: 8, percentage: 100 } })];
      render(<DashboardPage />);
      expect(
        within(card("Current Progress")).getByRole("link", { name: /Review your roadmap/ }),
      ).toBeTruthy();
    });

    it("marks a retired career and doesn’t link to its roadmap", () => {
      state.data = [
        pathway("old", { career: { id: "old", slug: "old", title: "Old career", retired: true } }),
      ];
      activeState = { isPending: true, isError: false };
      render(<DashboardPage />);

      expect(screen.getAllByText(/retired/i).length).toBeGreaterThan(0);
      expect(screen.queryByRole("link", { name: /roadmap|Continue/ })).toBeNull();
    });
  });

  describe("Pathways and Topics Completed", () => {
    it("count the saved pathways and the steps done across all of them", () => {
      state.data = [
        pathway("a", { isActive: true }),
        pathway("b", { progress: { completed: 5, total: 10, percentage: 50 } }),
      ];
      render(<DashboardPage />);

      expect(within(card("Pathways")).getByText("2")).toBeTruthy();
      expect(within(card("Topics Completed")).getByText("8")).toBeTruthy();
    });
  });

  describe("illustrations", () => {
    it("puts line art on the Pathways and Topics Completed cards, hidden from screen readers", () => {
      render(<DashboardPage />);

      for (const name of ["Pathways", "Topics Completed"]) {
        const art = card(name).querySelector("img");
        expect(art).toBeTruthy();
        expect(art?.getAttribute("alt")).toBe("");
        expect(art?.getAttribute("aria-hidden")).toBe("true");
      }
    });

    it("sits in the bottom-right corner at its own proportions, not stretched to the card", () => {
      render(<DashboardPage />);

      for (const name of ["Pathways", "Topics Completed"]) {
        const art = card(name).querySelector("img") as HTMLImageElement;
        expect(art.className).toContain("right-0");
        expect(art.className).toContain("bottom-0");
        expect(art.className).toContain("h-auto");
        expect(art.className).not.toContain("h-full");
        expect(art.style.width).toMatch(/^\d+px$/);
      }
    });

    it("uses a different picture on each card", () => {
      render(<DashboardPage />);

      const pathways = card("Pathways").querySelector("img")?.getAttribute("src");
      const topics = card("Topics Completed").querySelector("img")?.getAttribute("src");
      expect(pathways).toBeTruthy();
      expect(pathways).not.toBe(topics);
    });
  });

  describe("Todays Goals", () => {
    it("shows the week with today marked, and no day met", () => {
      render(<DashboardPage />);

      const week = screen.getByRole("list", { name: "This week" });
      expect(within(week).getAllByRole("listitem")).toHaveLength(7);
      expect(week.querySelector('[aria-current="date"]')?.textContent).toContain("FRI");
      // A day that was met reads "MON goal met"; the others read "no goal met" or "today".
      expect(week.textContent).not.toMatch(/[A-Z]{3} goal met/);
    });

    it("lists the goals, each worth 0 XP and not done", () => {
      render(<DashboardPage />);

      const goals = card("Todays Goals");
      expect(within(goals).getByText(/Finish Semantic HTML/)).toBeTruthy();
      expect(within(goals).getByText(/Take the Career a skill check/)).toBeTruthy();
      expect(within(goals).getByText(/Save a career to compare/)).toBeTruthy();
      expect(within(goals).getAllByText("+0 XP")).toHaveLength(3);
      expect(within(goals).getAllByText(/\(not done\)/)).toHaveLength(3);
    });

    it("asks to finish the next lesson when the next step isn’t known", () => {
      activeState = { isPending: true, isError: false };
      render(<DashboardPage />);

      expect(within(card("Todays Goals")).getByText(/Finish your next lesson/)).toBeTruthy();
    });
  });

  describe("Current Projects", () => {
    it("shows the next step, its skills and where the pathway stands", () => {
      render(<DashboardPage />);

      const projects = card("Current Projects");
      expect(within(projects).getByRole("heading", { level: 3 }).textContent).toBe("Semantic HTML");
      expect(within(projects).getByText("Builds the parts of the web people see.")).toBeTruthy();
      expect(within(projects).getByText("HTML • CSS")).toBeTruthy();
      expect(within(projects).getByText("Frontend & FullStack Pathway")).toBeTruthy();
      expect(within(projects).getByText("38%")).toBeTruthy();
      expect(within(projects).getByRole("link", { name: /Continue/ })).toBeTruthy();
    });

    it("counts the other saved pathways", () => {
      state.data = [pathway("a", { isActive: true }), pathway("b"), pathway("c")];
      render(<DashboardPage />);

      expect(within(card("Current Projects")).getByText("2 more")).toBeTruthy();
    });

    it("says 0 more with a single pathway", () => {
      render(<DashboardPage />);

      expect(within(card("Current Projects")).getByText("0 more")).toBeTruthy();
    });

    it("falls back to the career when the next step isn’t known", () => {
      activeState = { isPending: true, isError: false };
      render(<DashboardPage />);

      expect(
        within(card("Current Projects")).getByRole("heading", { level: 3 }).textContent,
      ).toBe("Career a");
    });
  });

  describe("Activity and Trophies", () => {
    it("shows a year of empty squares, because there is no activity data", () => {
      const { container } = render(<DashboardPage />);

      const grid = screen.getByRole("img", { name: /no activity yet/ });
      expect(grid.querySelectorAll("[data-level]")).toHaveLength(53 * 7);
      expect(grid.querySelectorAll('[data-level="0"]')).toHaveLength(53 * 7);
      expect(container.querySelectorAll("ol[aria-hidden] li")).toHaveLength(12);
    });

    it("shows 0 trophies, all five locked", () => {
      render(<DashboardPage />);

      const trophies = card("Trophies");
      expect(within(trophies).getByLabelText("0 trophies earned")).toBeTruthy();
      expect(within(trophies).getAllByLabelText("Locked trophy")).toHaveLength(5);
    });
  });

  describe("tabs", () => {
    it("lists the pathway’s steps under Next steps, with where they stand", async () => {
      render(<DashboardPage />);

      await userEvent.click(screen.getByRole("tab", { name: "Next steps" }));

      const steps = screen.getByRole("tabpanel");
      expect(within(steps).getByText(/1\. HTML basics/)).toBeTruthy();
      expect(within(steps).getAllByText("Done")).toHaveLength(2);
      expect(within(steps).getByText("In progress")).toBeTruthy();
      expect(within(steps).getByText("Up next")).toBeTruthy();
      expect(within(steps).getByText("HTML • CSS")).toBeTruthy();
      expect(screen.queryByText("Todays Goals")).toBeNull();
    });

    it("says there are no next steps when the pathway has none", async () => {
      activeState = {
        data: { ...activePathway("a"), steps: [] },
        isPending: false,
        isError: false,
      };
      render(<DashboardPage />);

      await userEvent.click(screen.getByRole("tab", { name: "Next steps" }));

      expect(screen.getByText("No next steps yet")).toBeTruthy();
    });

    it("says there are no projects under Projects, and goes back to Overview", async () => {
      render(<DashboardPage />);

      await userEvent.click(screen.getByRole("tab", { name: "Projects" }));
      expect(screen.getByText("No projects yet")).toBeTruthy();
      expect(screen.queryByText("Todays Goals")).toBeNull();

      await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Good Morning, Maya");
      expect(screen.getByText("Todays Goals")).toBeTruthy();
    });
  });
});
