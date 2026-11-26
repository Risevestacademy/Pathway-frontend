import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { OverviewTabs } from "./OverviewTabs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: { careerId: string } }) => (
    <a href={to.replace("$careerId", params?.careerId ?? "")}>{children}</a>
  ),
}));

afterEach(cleanup);

const tabs = (current: "overview" | "resources" | "tasks" | "progress" = "overview") =>
  render(<OverviewTabs careerId="c1" current={current} />);

describe("OverviewTabs", () => {
  it("is a labelled navigation", () => {
    tabs();

    expect(screen.getByRole("navigation", { name: "Pathway sections" })).toBeTruthy();
  });

  it("lists the sections in order", () => {
    tabs();

    const items = within(screen.getByRole("navigation")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Overview",
      "Resources",
      "Practice tasks",
      "Progress",
    ]);
  });

  it("shows Overview as current, and links to Resources", () => {
    tabs("overview");

    expect(screen.getByText("Overview").getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("link", { name: "Overview" })).toBeNull();
    expect(screen.getByRole("link", { name: "Resources" }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources",
    );
  });

  it("shows Resources as current, and links back to Overview", () => {
    tabs("resources");

    expect(screen.getByText("Resources").getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("link", { name: "Resources" })).toBeNull();
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe(
      "/my-pathway/c1/overview",
    );
  });

  it("links to Progress from the other screens", () => {
    tabs("overview");

    expect(screen.getByRole("link", { name: "Progress" }).getAttribute("href")).toBe("/my-pathway/c1/progress");
  });

  it("links to Progress from Resources too", () => {
    tabs("resources");

    expect(screen.getByRole("link", { name: "Progress" }).getAttribute("href")).toBe("/my-pathway/c1/progress");
  });

  it("shows Progress as current on the Progress screen, with the others as links", () => {
    tabs("progress");

    expect(screen.getByText("Progress").getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Progress").getAttribute("aria-disabled")).toBeNull();
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/my-pathway/c1/overview");
    expect(screen.getByRole("link", { name: "Resources" }).getAttribute("href")).toBe("/my-pathway/c1/resources");
  });

  it("links to Practice tasks from the other screens", () => {
    tabs("overview");

    expect(screen.getByRole("link", { name: "Practice tasks" }).getAttribute("href")).toBe("/my-pathway/c1/tasks");
  });

  it("shows Practice tasks as current on its own screen, with the others as links", () => {
    tabs("tasks");

    expect(screen.getByText("Practice tasks").getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Practice tasks").getAttribute("aria-disabled")).toBeNull();
    expect(screen.queryByRole("link", { name: "Practice tasks" })).toBeNull();
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/my-pathway/c1/overview");
    expect(screen.getByRole("link", { name: "Resources" }).getAttribute("href")).toBe("/my-pathway/c1/resources");
    expect(screen.getByRole("link", { name: "Progress" }).getAttribute("href")).toBe("/my-pathway/c1/progress");
  });

  it("has no tab that is still marked as coming soon", () => {
    tabs();

    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });
});
