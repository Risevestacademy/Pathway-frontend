import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ResourceGroup } from "../resourceGroups.utils";
import { ResourcesScreen } from "./ResourcesScreen";

vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLink: ({ label = "Back" }: { label?: string }) => <button type="button">{label}</button>,
}));
vi.mock("./ResourceStepCard", () => ({
  ResourceStepCard: ({ group, status }: { group: ResourceGroup; status: string | null }) => (
    <section aria-label={`step ${group.number}`}>{`${group.title} [${status ?? "untracked"}]`}</section>
  ),
}));

afterEach(cleanup);

const groups: ResourceGroup[] = [
  { stepId: "s1", number: 1, title: "What design is for", resources: [] },
  { stepId: "s3", number: 3, title: "Get comfortable in Figma", resources: [] },
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

  it("shows a card for each step that has resources, in order", () => {
    screenOf();

    expect(screen.getAllByRole("region").map((el) => el.textContent)).toEqual([
      "What design is for [untracked]",
      "Get comfortable in Figma [untracked]",
    ]);
  });

  it("gives each step its saved status when they are tracking this pathway", () => {
    screenOf({ statuses: { s1: "COMPLETED" } });

    expect(screen.getAllByRole("region").map((el) => el.textContent)).toEqual([
      "What design is for [COMPLETED]",
      "Get comfortable in Figma [NOT_STARTED]",
    ]);
  });

  it("says so when no step has any resources yet", () => {
    screenOf({ groups: [] });

    expect(screen.getByText("No resources for this roadmap yet")).toBeTruthy();
    expect(screen.queryByRole("region")).toBeNull();
  });
});
