import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RevisionDiff } from "../revisionDiff.types";
import { RevisionDiffPage } from "./RevisionDiffPage";

const refetch = vi.fn();
let state: {
  data?: RevisionDiff;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("../hooks/useRevisionDiff", () => ({
  useRevisionDiff: () => ({ refetch, ...state }),
}));

const empty = { changed: [], added: [], removed: [], moved: [] };

const diff = (over: Partial<RevisionDiff> = {}): RevisionDiff => ({
  revisionId: "rev-1",
  title: "UX Designer: salary range",
  submittedBy: "Chidi E.",
  submittedAt: "5 hours ago",
  baseVersion: 3,
  liveVersion: 3,
  stale: false,
  blockers: [],
  advisories: [],
  sections: {},
  ...over,
});

beforeEach(() => {
  refetch.mockReset();
  state = { data: diff(), isPending: false, isError: false, error: null };
});
afterEach(cleanup);

describe("RevisionDiffPage", () => {
  it("shows a loading state", () => {
    state = { isPending: true, isError: false, error: null };
    const { container } = render(<RevisionDiffPage revisionId="rev-1" />);

    expect(container.querySelector("[aria-busy]")).toBeTruthy();
  });

  it("explains why it couldn’t load and lets them try again", async () => {
    state = {
      isPending: false,
      isError: true,
      error: new Error("You can’t view this change. Editors can only see their own; reviewers can see any."),
    };
    render(<RevisionDiffPage revisionId="rev-1" />);

    expect(screen.getByText(/Editors can only see their own/)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows who submitted it, when, and which version it is based on", () => {
    render(<RevisionDiffPage revisionId="rev-1" />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("UX Designer: salary range");
    expect(screen.getByText("Submitted by Chidi E. · 5 hours ago")).toBeTruthy();
    expect(screen.getByText("Based on version 3")).toBeTruthy();
    expect(screen.queryByText(/Live is version/)).toBeNull();
  });

  it("says there is nothing to review when no section has changes", () => {
    state.data = diff({ sections: { career: empty } });
    render(<RevisionDiffPage revisionId="rev-1" />);

    expect(screen.getByText("No changes in this revision")).toBeTruthy();
  });

  it("shows each change with a readable before and after", () => {
    state.data = diff({
      sections: {
        career: {
          ...empty,
          changed: [
            { field: "title", label: "Title", before: "Frontend Engineer", after: "Senior Frontend Engineer" },
          ],
        },
        outlook: {
          ...empty,
          changed: [
            {
              field: "sourceId",
              label: "Source",
              before: "a3f2-uuid",
              after: "b7e2-uuid",
              beforeLabel: "Jobberman salary guide 2025",
              afterLabel: "Jobberman salary guide 2026",
            },
            { field: "median", label: "Median", before: "230000.00", after: "250000.00" },
            { field: "targetLevels", label: "Levels", before: [], after: ["STUDENT", "RECENT_GRAD"] },
          ],
        },
      },
    });
    render(<RevisionDiffPage revisionId="rev-1" />);

    const career = screen.getByRole("region", { name: "Career details" });
    expect(within(career).getByText("Frontend Engineer")).toBeTruthy();
    expect(within(career).getByText("Senior Frontend Engineer")).toBeTruthy();

    const outlook = screen.getByRole("region", { name: "Outlook and salary" });
    // A foreign key shows its name, not its id.
    expect(within(outlook).getByText("Jobberman salary guide 2025")).toBeTruthy();
    expect(within(outlook).getByText("Jobberman salary guide 2026")).toBeTruthy();
    expect(within(outlook).queryByText("a3f2-uuid")).toBeNull();
    // Money gets separators and lists are joined.
    expect(within(outlook).getByText("230,000.00")).toBeTruthy();
    expect(within(outlook).getByText("250,000.00")).toBeTruthy();
    expect(within(outlook).getByText("STUDENT, RECENT_GRAD")).toBeTruthy();
  });

  it("lists what was added, removed and moved", () => {
    state.data = diff({
      sections: {
        steps: {
          changed: [],
          added: [{ title: "Learn Linux basics" }],
          removed: [{ title: "Old step" }, { title: "Older step" }],
          moved: [{ title: "Git" }],
        },
      },
    });
    render(<RevisionDiffPage revisionId="rev-1" />);

    const steps = screen.getByRole("region", { name: "Roadmap steps" });
    expect(within(steps).getByText("Learn Linux basics")).toBeTruthy();
    expect(within(steps).getByText("Old step")).toBeTruthy();
    expect(within(steps).getByText("Older step")).toBeTruthy();
    expect(within(steps).getByText("Git")).toBeTruthy();
    expect(within(steps).getByText("Added")).toBeTruthy();
    expect(within(steps).getByText("Removed")).toBeTruthy();
    expect(within(steps).getByText("Moved")).toBeTruthy();
  });

  it("warns when the live career has moved on, and asks for a rebase", () => {
    state.data = diff({ stale: true, baseVersion: 3, liveVersion: 4 });
    render(<RevisionDiffPage revisionId="rev-1" />);

    expect(screen.getByText("The live career has changed")).toBeTruthy();
    expect(screen.getByText(/Ask for a rebase before approving/)).toBeTruthy();
    expect(screen.getByText("Live is version 4")).toBeTruthy();
  });

  it("shows blockers as errors and advisories as information", () => {
    state.data = diff({
      blockers: ["Add at least one step", { message: "A required field is missing", code: "MISSING" }],
      advisories: ["The salary source is over a year old"],
    });
    render(<RevisionDiffPage revisionId="rev-1" />);

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0].textContent).toContain("Add at least one step");
    expect(alerts[1].textContent).toContain("A required field is missing");
    expect(alerts[0].textContent).toContain("Publishing would fail");

    const advisory = screen.getByText("The salary source is over a year old").closest("[role=status]");
    expect(advisory?.textContent).toContain("doesn’t stop it being approved");
  });

  it("links back to the inbox", () => {
    render(<RevisionDiffPage revisionId="rev-1" />);

    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });
});
