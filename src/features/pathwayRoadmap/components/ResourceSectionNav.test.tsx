import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ResourceSectionNav, type ResourceSectionNavItem } from "./ResourceSectionNav";

afterEach(cleanup);

const items: ResourceSectionNavItem[] = [
  { id: "g1", title: "Foundations", ticked: 1, total: 3 },
  { id: "g2", title: "Core skills", ticked: 0, total: 2 },
  { id: "g3", title: "Portfolio", ticked: 0, total: 0 },
];

const nav = (selectedId = "g1", onSelect = vi.fn(), label = "Stages") => {
  render(<ResourceSectionNav label={label} items={items} selectedId={selectedId} onSelect={onSelect} />);
  return onSelect;
};

describe("ResourceSectionNav", () => {
  it("is a navigation with the label it is given", () => {
    nav("g1", vi.fn(), "Stages");

    expect(screen.getByRole("navigation", { name: "Stages" })).toBeTruthy();
  });

  it("lists only each section's name, in order, with no steps under it", () => {
    nav();

    const list = within(screen.getByRole("navigation"));
    expect(list.getAllByRole("button").map((b) => b.textContent?.replace(/(\d of \d|No resources)$/, ""))).toEqual([
      "Foundations",
      "Core skills",
      "Portfolio",
    ]);
    expect(list.queryAllByRole("heading")).toHaveLength(0);
    expect(list.queryByText(/Step \d/)).toBeNull();
  });

  it("shows how many of each section's resources are ticked", () => {
    nav();

    expect(screen.getByText("1 of 3")).toBeTruthy();
    expect(screen.getByText("0 of 2")).toBeTruthy();
  });

  it("says a section has no resources, instead of 0 of 0", () => {
    nav();

    expect(screen.getByText("No resources")).toBeTruthy();
    expect(screen.queryByText("0 of 0")).toBeNull();
  });

  it("marks the selected section, and only that one", () => {
    nav("g2");

    expect(screen.getByRole("button", { name: /Core skills/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: /Foundations/ }).getAttribute("aria-current")).toBeNull();
  });

  it("selects a section when it is clicked", () => {
    const onSelect = nav();

    fireEvent.click(screen.getByRole("button", { name: /Core skills/ }));

    expect(onSelect).toHaveBeenCalledWith("g2");
  });
});
