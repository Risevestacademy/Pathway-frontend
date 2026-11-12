import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ResourceStepNav, type ResourceStepNavItem } from "./ResourceStepNav";

afterEach(cleanup);

const items: ResourceStepNavItem[] = [
  { stepId: "s1", number: 1, title: "What design is for", ticked: 1, total: 1 },
  { stepId: "s2", number: 2, title: "How people think", ticked: 0, total: 2 },
  { stepId: "s4", number: 4, title: "Practice visual basics", ticked: 0, total: 1 },
];

const nav = (selectedStepId = "s1", onSelect = vi.fn()) => {
  render(<ResourceStepNav items={items} selectedStepId={selectedStepId} onSelect={onSelect} />);
  return onSelect;
};

describe("ResourceStepNav", () => {
  it("is a labelled navigation for the steps", () => {
    nav();

    expect(screen.getByRole("navigation", { name: "Steps" })).toBeTruthy();
  });

  it("lists each step in order, with its number and name", () => {
    nav();

    const list = within(screen.getByRole("navigation"));
    expect(list.getAllByRole("button").map((b) => b.textContent?.replace(/\d of \d$/, ""))).toEqual([
      "Step 1 · What design is for",
      "Step 2 · How people think",
      "Step 4 · Practice visual basics",
    ]);
  });

  it("shows how many of each step's resources are ticked", () => {
    nav();

    expect(screen.getByText("1 of 1")).toBeTruthy();
    expect(screen.getByText("0 of 2")).toBeTruthy();
  });

  it("marks the selected step, and only that one", () => {
    nav("s2");

    expect(screen.getByRole("button", { name: /Step 2/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: /Step 1/ }).getAttribute("aria-current")).toBeNull();
    expect(screen.getByRole("button", { name: /Step 4/ }).getAttribute("aria-current")).toBeNull();
  });

  it("selects a step when it is clicked", () => {
    const onSelect = nav("s1");

    fireEvent.click(screen.getByRole("button", { name: /Step 4/ }));

    expect(onSelect).toHaveBeenCalledWith("s4");
  });

  it("says a step has no resources, instead of 0 of 0", () => {
    render(
      <ResourceStepNav
        items={[{ stepId: "s9", number: 9, title: "Present your work", ticked: 0, total: 0 }]}
        selectedStepId="s9"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("No resources")).toBeTruthy();
    expect(screen.queryByText("0 of 0")).toBeNull();
  });
});
