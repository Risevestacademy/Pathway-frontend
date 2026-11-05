import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { PathwayOverview } from "../overview.utils";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ProgressScreen } from "./ProgressScreen";

let tickedIds: string[] = [];

vi.mock("../hooks/useResourceTicks", () => ({
  useResourceTicks: () => ({ isTicked: (id: string) => tickedIds.includes(id) }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("../../progress/components/StepCompletionButton", () => ({
  default: ({ stepId }: { stepId: string }) => <button type="button">{`undo ${stepId}`}</button>,
}));
vi.mock("../../progress/components/StartTrackingButton", () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

afterEach(() => {
  cleanup();
  tickedIds = [];
});

const overview: PathwayOverview = {
  steps: [
    { id: "s1", number: 1, title: "What design is for", description: "", status: "COMPLETED" },
    { id: "s2", number: 2, title: "How people think", description: "", status: "NOT_STARTED" },
  ],
  nextStepId: "s2",
  completed: 1,
  total: 2,
  started: true,
  upNext: { id: "s2", number: 2, title: "How people think", resourceCount: 1 },
};

const groups: ResourceGroup[] = [
  {
    stepId: "s1",
    number: 1,
    title: "What design is for",
    resources: [
      { id: "a", title: "Laws of UX", provider: "Jon", kind: "article", url: "https://a", description: null, lastChecked: "2026-09-12" },
    ],
    paid: [],
  },
];

const screenOf = (over: Partial<Parameters<typeof ProgressScreen>[0]> = {}) =>
  render(
    <ProgressScreen
      careerId="c1"
      careerTitle="Product Designer"
      overview={overview}
      groups={groups}
      activation={null}
      {...over}
    />,
  );

describe("ProgressScreen", () => {
  it("goes back to My Pathway", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway");
  });

  it("is headed with the career, and says how many steps it has", () => {
    screenOf();

    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
    expect(screen.getByText("2 steps. You mark each step complete yourself.")).toBeTruthy();
  });

  it("shows the pathway's sections under the hero, with Progress current", () => {
    screenOf();

    expect(screen.getByText("Progress").getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Overview" })).toBeTruthy();
  });

  it("says progress is what they tell us, and isn't checked", () => {
    screenOf();

    expect(
      screen.getByText("Progress is what you tell us. We do not check that you finished a step."),
    ).toBeTruthy();
  });

  it("shows how many steps are complete overall", () => {
    screenOf();

    expect(screen.getByText("1 of 2 steps complete")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("1");
  });

  it("lists the steps they marked complete, with an Undo", () => {
    screenOf();

    const completed = within(screen.getByRole("region", { name: "Completed" }));
    expect(completed.getByText("Step 1 · What design is for")).toBeTruthy();
    expect(completed.getByRole("button", { name: "undo s1" })).toBeTruthy();
  });

  it("lists the resources they ticked on the Resources tab", () => {
    tickedIds = ["a"];
    screenOf();

    fireEvent.click(screen.getByRole("tab", { name: "Resources" }));

    expect(screen.getByRole("link", { name: "Laws of UX" })).toBeTruthy();
  });

  it("shows the step up next, with a way to continue", () => {
    screenOf();

    expect(screen.getByRole("region", { name: "Step 2 · How people think" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Continue step 2" })).toBeTruthy();
  });

  it("makes the career active first when starting the step needs it", () => {
    screenOf({ activation: { activeCareerTitle: "Data Analyst" } });

    expect(screen.getByRole("button", { name: "Continue step 2" })).toBeTruthy();
  });

  it("says they finished, in place of up next, once every step is complete", () => {
    screenOf({
      overview: {
        ...overview,
        steps: overview.steps.map((step) => ({ ...step, status: "COMPLETED" as const })),
        completed: 2,
        nextStepId: null,
        upNext: null,
      },
    });

    expect(screen.getByRole("region", { name: "You finished your pathway" })).toBeTruthy();
    expect(screen.queryByText("Up next")).toBeNull();
  });

  it("calls the next card Next up, without a resource count, as in the design", () => {
    screenOf();

    expect(screen.getByText("Next up")).toBeTruthy();
    expect(screen.queryByText("Up next")).toBeNull();
    expect(screen.queryByText(/1 resource/)).toBeNull();
  });

  describe("when nothing is completed yet", () => {
    const fresh: PathwayOverview = {
      ...overview,
      steps: overview.steps.map((step) => ({ ...step, status: "NOT_STARTED" as const })),
      nextStepId: "s1",
      completed: 0,
      started: false,
      upNext: { id: "s1", number: 1, title: "What design is for", resourceCount: 1 },
    };

    it("says so, pointing to the first step and offering to start it", () => {
      screenOf({ overview: fresh });

      const completed = within(screen.getByRole("region", { name: "Completed" }));
      expect(completed.getByText("Nothing completed yet")).toBeTruthy();
      expect(
        completed.getByText("When you mark a step complete, it shows up here. Start with step 1."),
      ).toBeTruthy();
      expect(completed.getByRole("link", { name: "Start step 1" })).toBeTruthy();
    });

    it("also offers to start it in the next card", () => {
      screenOf({ overview: fresh });

      expect(screen.getAllByRole("link", { name: "Start step 1" })).toHaveLength(2);
    });

    it("makes the career active first, from either button, when that is needed", () => {
      screenOf({ overview: fresh, activation: { activeCareerTitle: null } });

      expect(screen.getAllByRole("button", { name: "Start step 1" })).toHaveLength(2);
    });
  });
});
