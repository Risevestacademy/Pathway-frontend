import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ResourcesScreen } from "./ResourcesScreen";

let tickedIds: string[] = [];
let unsavedIds: string[] = [];
const retrySaving = vi.fn();
const playSound = vi.fn();

vi.mock("../hooks/useResourceTicks", () => ({
  useResourceTicks: () => ({
    isTicked: (id: string) => tickedIds.includes(id),
    unsaved: unsavedIds,
    retry: () => retrySaving(),
    countTicked: (ids: string[]) => ids.filter((id) => tickedIds.includes(id)).length,
    toggle: vi.fn(),
  }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./ResourceStepCard", () => ({
  ResourceStepCard: ({
    group,
    status,
    onStepCompleted,
  }: {
    group: ResourceGroup;
    status: string | null;
    onStepCompleted?: () => void;
  }) => (
    <>
      <section aria-label={`step ${group.number}`}>{`${group.title} [${status ?? "untracked"}]`}</section>
      <button type="button" onClick={onStepCompleted}>
        mark complete
      </button>
    </>
  ),
}));
vi.mock("../stepCompleteSound", () => ({ playStepCompleteSound: () => playSound() }));
vi.mock("./Confetti", () => ({
  Confetti: ({ onDone }: { onDone?: () => void }) => (
    <div data-testid="confetti">
      <button type="button" onClick={onDone}>
        confetti done
      </button>
    </div>
  ),
}));
vi.mock("./SaveFailedBanner", () => ({
  SaveFailedBanner: ({ resourceTitle, onRetry }: { resourceTitle: string; onRetry: () => void }) => (
    <div role="alert">
      {`not saved: ${resourceTitle}`}
      <button type="button" onClick={onRetry}>
        retry saving
      </button>
    </div>
  ),
}));
vi.mock("./StepCompleteDialog", () => ({
  StepCompleteDialog: ({
    open,
    onOpenChange,
    step,
    resources,
    progress,
    nextStep,
    onNextStep,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    step: { number: number; title: string };
    resources: { id: string; ticked: boolean }[];
    progress: { completed: number; total: number } | null;
    nextStep: { title: string } | null;
    onNextStep: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="step complete">
        <p>{`${step.number}|${step.title}`}</p>
        <p>{resources.map((r) => `${r.id}:${r.ticked}`).join(",")}</p>
        <p>{progress ? `${progress.completed}/${progress.total}` : "no progress"}</p>
        <p>{nextStep ? `next:${nextStep.title}` : "no next step"}</p>
        <button type="button" onClick={onNextStep}>
          go next
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          stay
        </button>
      </div>
    ) : null,
}));
vi.mock("./PaidCoursesCard", () => ({
  PaidCoursesCard: ({ resources, hasFreeResources }: { resources: { id: string }[]; hasFreeResources: boolean }) =>
    resources.length === 0 ? null : (
      <aside aria-label="paid courses">{`paid: ${resources.map((r) => r.id).join(",")} | free: ${hasFreeResources}`}</aside>
    ),
}));

afterEach(() => {
  cleanup();
  playSound.mockReset();
  retrySaving.mockReset();
  unsavedIds = [];
  tickedIds = [];
});

const resource = (id: string) => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  kind: "article" as const,
  url: `https://example.com/${id}`,
  description: null,
  lastChecked: "2026-09-12",
});

const groups: ResourceGroup[] = [
  { stepId: "s1", number: 1, title: "What design is for", resources: [resource("a")], paid: [] },
  { stepId: "s3", number: 3, title: "Get comfortable in Figma", resources: [resource("b"), resource("c")], paid: [resource("p1")] },
  { stepId: "s5", number: 5, title: "Only paid", resources: [], paid: [resource("p2")] },
];

const screenOf = (over: Partial<Parameters<typeof ResourcesScreen>[0]> = {}) =>
  render(
    <ResourcesScreen
      careerId="c1"
      careerTitle="Product Designer"
      stepCount={16}
      groups={groups}
      statuses={null}
      progress={{ completed: 2, total: 16 }}
      {...over}
    />,
  );

const steps = () => within(screen.getByRole("navigation", { name: "Steps" }));
const cards = () => screen.getAllByRole("region").map((el) => el.textContent);

describe("ResourcesScreen", () => {
  it("has a way back", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("goes back to My Pathway, not to wherever the browser was before, which could be the detail page that sent it here", () => {
    screenOf();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway");
  });

  it("is headed with the career, and says how many steps it has", () => {
    screenOf();

    expect(screen.getByRole("heading", { level: 1, name: "Product Designer" })).toBeTruthy();
    expect(screen.getByText("16 steps. You mark each step complete yourself.")).toBeTruthy();
  });

  it("shows the pathway's sections under the hero, with Resources current", () => {
    screenOf();

    const tabs = screen.getByRole("navigation", { name: "Pathway sections" });
    expect(screen.getByText("Resources").getAttribute("aria-current")).toBe("page");
    const hero = screen.getByRole("heading", { level: 1 });
    expect(hero.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("link", { name: "Overview" })).toBeTruthy();
  });

  it("lists the steps that have resources down the side, each with its tick count", () => {
    tickedIds = ["b"];
    screenOf();

    expect(steps().getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Step 1 · What design is for0 of 1",
      "Step 3 · Get comfortable in Figma1 of 2",
      "Step 5 · Only paidNo resources",
    ]);
  });

  it("starts on the first step, showing only its card", () => {
    screenOf();

    expect(cards()).toEqual(["What design is for [untracked]"]);
    expect(steps().getByRole("button", { name: /Step 1/ }).getAttribute("aria-current")).toBe("true");
  });

  it("shows another step's card when it is picked from the side", () => {
    screenOf();

    fireEvent.click(steps().getByRole("button", { name: /Step 3/ }));

    expect(cards()).toEqual(["Get comfortable in Figma [untracked]"]);
    expect(steps().getByRole("button", { name: /Step 3/ }).getAttribute("aria-current")).toBe("true");
  });

  it("shows only the selected step's paid courses below the card", () => {
    screenOf();

    expect(screen.queryByLabelText("paid courses")).toBeNull();

    fireEvent.click(steps().getByRole("button", { name: /Step 3/ }));
    const paid = () => screen.getByLabelText("paid courses").textContent;
    expect(paid()).toBe("paid: p1 | free: true");

    const card = screen.getByRole("region");
    expect(card.compareDocumentPosition(screen.getByLabelText("paid courses")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows only the selected step's paid courses when it has no free resources", () => {
    screenOf();

    fireEvent.click(steps().getByRole("button", { name: /Step 5/ }));
    expect(screen.getByLabelText("paid courses").textContent).toBe("paid: p2 | free: false");
  });

  it("shows no paid section when no step has a paid course", () => {
    screenOf({ groups: groups.map((group) => ({ ...group, paid: [] })) });

    expect(screen.queryByLabelText("paid courses")).toBeNull();
  });

  it("gives the shown step its saved status when they are tracking this pathway", () => {
    screenOf({ statuses: { s1: "COMPLETED" } });

    expect(cards()).toEqual(["What design is for [COMPLETED]"]);

    fireEvent.click(steps().getByRole("button", { name: /Step 3/ }));
    expect(cards()).toEqual(["Get comfortable in Figma [NOT_STARTED]"]);
  });

  it("says so, with no steps listed, when no step has any resources yet", () => {
    screenOf({ groups: [] });

    expect(screen.getByText("No resources for this roadmap yet")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Steps" })).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });

  describe("when a step is marked complete", () => {
    const complete = () => fireEvent.click(screen.getByRole("button", { name: "mark complete" }));
    const dialog = () => within(screen.getByRole("dialog", { name: "step complete" }));

    it("shows nothing about it until then", () => {
      screenOf();

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByTestId("confetti")).toBeNull();
      expect(playSound).not.toHaveBeenCalled();
    });

    it("celebrates with confetti and a chime, once", () => {
      screenOf();

      complete();

      expect(screen.getByTestId("confetti")).toBeTruthy();
      expect(playSound).toHaveBeenCalledOnce();
    });

    it("takes the confetti away when it has finished, leaving the dialog", () => {
      screenOf();
      complete();

      fireEvent.click(screen.getByRole("button", { name: "confetti done" }));

      expect(screen.queryByTestId("confetti")).toBeNull();
      expect(screen.getByRole("dialog", { name: "step complete" })).toBeTruthy();
      expect(playSound).toHaveBeenCalledOnce();
    });

    it("celebrates again for the next step they complete", () => {
      screenOf();
      complete();
      fireEvent.click(screen.getByRole("button", { name: "confetti done" }));
      fireEvent.click(dialog().getByRole("button", { name: "stay" }));

      complete();

      expect(screen.getByTestId("confetti")).toBeTruthy();
      expect(playSound).toHaveBeenCalledTimes(2);
    });

    it("tells them which step, which resources they ticked, how far they are, and what's next", () => {
      tickedIds = ["a"];
      screenOf();

      complete();

      expect(dialog().getByText("1|What design is for")).toBeTruthy();
      expect(dialog().getByText("a:true")).toBeTruthy();
      expect(dialog().getByText("2/16")).toBeTruthy();
      expect(dialog().getByText("next:Get comfortable in Figma")).toBeTruthy();
    });

    it("is about the step that was picked", () => {
      screenOf();
      fireEvent.click(steps().getByRole("button", { name: /Step 3/ }));

      complete();

      expect(dialog().getByText("3|Get comfortable in Figma")).toBeTruthy();
      expect(dialog().getByText("b:false,c:false")).toBeTruthy();
      expect(dialog().getByText("next:Only paid")).toBeTruthy();
    });

    it("goes to the next step in the sidebar, and closes", () => {
      screenOf();
      complete();

      fireEvent.click(dialog().getByRole("button", { name: "go next" }));

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(cards()).toEqual(["Get comfortable in Figma [untracked]"]);
      expect(steps().getByRole("button", { name: /Step 3/ }).getAttribute("aria-current")).toBe("true");
    });

    it("stays on the same step when they choose to stay", () => {
      screenOf();
      complete();

      fireEvent.click(dialog().getByRole("button", { name: "stay" }));

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(cards()).toEqual(["What design is for [untracked]"]);
    });

    it("has no next step after the last one", () => {
      screenOf();
      fireEvent.click(steps().getByRole("button", { name: /Step 5/ }));

      complete();

      expect(dialog().getByText("no next step")).toBeTruthy();
    });

    it("leaves the overall progress out when it isn't known", () => {
      screenOf({ progress: null });

      complete();

      expect(dialog().getByText("no progress")).toBeTruthy();
    });
  });

  describe("when the browser couldn't save a tick", () => {
    it("shows nothing about it while every tick is saved", () => {
      screenOf();

      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("says which resource's tick isn't saved, above the step", () => {
      unsavedIds = ["a"];
      screenOf();

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("not saved: Resource a");
      const card = screen.getByRole("region");
      expect(alert.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("names the most recent one when several aren't saved", () => {
      unsavedIds = ["a", "c"];
      screenOf();

      expect(screen.getByRole("alert").textContent).toContain("not saved: Resource c");
    });

    it("shows it whichever step is picked, since the tick may be on another", () => {
      unsavedIds = ["a"];
      screenOf();

      fireEvent.click(steps().getByRole("button", { name: /Step 3/ }));

      expect(screen.getByRole("alert").textContent).toContain("not saved: Resource a");
    });

    it("tries saving again when asked to", () => {
      unsavedIds = ["a"];
      screenOf();

      fireEvent.click(screen.getByRole("button", { name: "retry saving" }));

      expect(retrySaving).toHaveBeenCalledOnce();
    });

    it("says nothing for a tick on a resource it can't find", () => {
      unsavedIds = ["gone"];
      screenOf();

      expect(screen.queryByRole("alert")).toBeNull();
    });
  });
});
