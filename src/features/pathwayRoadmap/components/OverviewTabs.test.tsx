import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { OverviewTabs } from "./OverviewTabs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: { careerId: string } }) => (
    <a href={to.replace("$careerId", params?.careerId ?? "")}>{children}</a>
  ),
}));

afterEach(cleanup);

const tabs = (current: "overview" | "resources" | "progress" = "overview") =>
  render(<OverviewTabs careerId="c1" current={current} />);

describe("OverviewTabs", () => {
  it("is a labelled navigation", () => {
    tabs();

    expect(screen.getByRole("navigation", { name: "Pathway sections" })).toBeTruthy();
  });

  it("lists the sections in order", () => {
    tabs();

    const items = within(screen.getByRole("navigation")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent?.replace(/\(coming soon\)/, "").trim())).toEqual([
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

  it("shows Progress as current on the Progress screen, with the others as links", () => {
    tabs("progress");

    expect(screen.getByText("Progress").getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Progress").getAttribute("aria-disabled")).toBeNull();
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/my-pathway/c1/overview");
    expect(screen.getByRole("link", { name: "Resources" }).getAttribute("href")).toBe("/my-pathway/c1/resources");
  });

  it.each(["Practice tasks"])("shows %s as not available yet", (name) => {
    tabs();

    const tab = screen.getByText(name);
    expect(tab.getAttribute("aria-disabled")).toBe("true");
    expect(tab.getAttribute("aria-current")).toBeNull();
    expect(within(tab).getByText("(coming soon)")).toBeTruthy();
  });
});
