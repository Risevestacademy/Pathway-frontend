import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { OverviewTabs } from "./OverviewTabs";

afterEach(cleanup);

describe("OverviewTabs", () => {
  it("is a labelled navigation", () => {
    render(<OverviewTabs />);

    expect(screen.getByRole("navigation", { name: "Pathway sections" })).toBeTruthy();
  });

  it("lists the sections in order", () => {
    render(<OverviewTabs />);

    const items = within(screen.getByRole("navigation")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent?.replace(/\(coming soon\)/, "").trim())).toEqual([
      "Overview",
      "Resources",
      "Practice tasks",
      "Progress",
    ]);
  });

  it("shows Overview as the current section", () => {
    render(<OverviewTabs />);

    expect(screen.getByText("Overview").getAttribute("aria-current")).toBe("page");
  });

  it.each(["Resources", "Practice tasks", "Progress"])(
    "shows %s as not available yet",
    (name) => {
      render(<OverviewTabs />);

      const tab = screen.getByText(name);
      expect(tab.getAttribute("aria-disabled")).toBe("true");
      expect(tab.getAttribute("aria-current")).toBeNull();
      expect(within(tab).getByText("(coming soon)")).toBeTruthy();
    },
  );
});
