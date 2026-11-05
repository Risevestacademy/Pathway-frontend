import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { GroupedResource } from "../resourceGroups.utils";
import { ResourceRow } from "./ResourceRow";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(cleanup);

const resource: GroupedResource = {
  id: "r1",
  title: "Laws of UX",
  provider: "Jon Yablonski",
  kind: "article",
  url: "https://lawsofux.com",
  costLabel: "Course: free",
  lastChecked: "2026-09-12",
};

const row = (over: Partial<GroupedResource> = {}, ticked = false, onToggle = vi.fn()) => {
  render(<ResourceRow careerId="c1" resource={{ ...resource, ...over }} ticked={ticked} onToggle={onToggle} />);
  return onToggle;
};

describe("ResourceRow", () => {
  it("names the resource and who it is by", () => {
    row();

    expect(screen.getByText("Laws of UX")).toBeTruthy();
    expect(screen.getByText("by Jon Yablonski")).toBeTruthy();
  });

  it("shows its type, its cost and when it was last checked", () => {
    row();

    expect(screen.getByText("Article")).toBeTruthy();
    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("Checked 12 Sep 2026")).toBeTruthy();
  });

  it("shows no cost chip when the cost isn't known to the row", () => {
    row({ costLabel: undefined });

    expect(screen.queryByText("Free")).toBeNull();
  });

  it("opens the resource's detail from View details", () => {
    row();

    expect(screen.getByRole("link", { name: /View details/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources/r1",
    );
  });

  it("names the link for its resource, for screen readers", () => {
    row();

    expect(screen.getByRole("link", { name: "View details: Laws of UX" })).toBeTruthy();
  });

  it("has a tick box, unticked to begin with", () => {
    row();

    const box = screen.getByRole("checkbox", { name: "I have done Laws of UX" }) as HTMLInputElement;
    expect(box.checked).toBe(false);
  });

  it("shows the tick box ticked when the resource is ticked", () => {
    row({}, true);

    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });

  it("asks to tick or untick when the box is clicked", () => {
    const onToggle = row();

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledOnce();
  });
});
