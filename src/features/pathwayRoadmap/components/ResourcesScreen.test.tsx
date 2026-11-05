import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ResourcesScreen } from "./ResourcesScreen";

let tickedIds: string[] = [];

vi.mock("../hooks/useResourceTicks", () => ({
  useResourceTicks: () => ({
    isTicked: (id: string) => tickedIds.includes(id),
    countTicked: (ids: string[]) => ids.filter((id) => tickedIds.includes(id)).length,
    toggle: vi.fn(),
  }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLink: ({ label = "Back" }: { label?: string }) => <button type="button">{label}</button>,
}));
vi.mock("./ResourceStepCard", () => ({
  ResourceStepCard: ({ group, status }: { group: ResourceGroup; status: string | null }) => (
    <section aria-label={`step ${group.number}`}>{`${group.title} [${status ?? "untracked"}]`}</section>
  ),
}));

afterEach(() => {
  cleanup();
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
  { stepId: "s3", number: 3, title: "Get comfortable in Figma", resources: [resource("b"), resource("c")], paid: [] },
];

const screenOf = (over: Partial<Parameters<typeof ResourcesScreen>[0]> = {}) =>
  render(
    <ResourcesScreen
      careerId="c1"
      careerTitle="Product Designer"
      stepCount={16}
      groups={groups}
      statuses={null}
      {...over}
    />,
  );

const steps = () => within(screen.getByRole("navigation", { name: "Steps" }));
const cards = () => screen.getAllByRole("region").map((el) => el.textContent);

describe("ResourcesScreen", () => {
  it("has a way back", () => {
    screenOf();

    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
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
});
