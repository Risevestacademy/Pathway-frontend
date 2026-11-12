import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { MyPathwayTabs } from "./MyPathwayTabs";

afterEach(cleanup);

async function renderTabs(path: string) {
  const router = createRouter({
    routeTree: createRootRoute({ component: MyPathwayTabs }),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
  return within(await screen.findByRole("navigation", { name: "My Pathway sections" }));
}

describe("MyPathwayTabs", () => {
  it("has a Roadmap tab and a Skill Check tab, and nothing else", async () => {
    const tabs = await renderTabs("/my-pathway");

    expect(tabs.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Roadmap",
      "Skill Check",
    ]);
  });

  it("has Roadmap current on the My Pathway page itself", async () => {
    const tabs = await renderTabs("/my-pathway");

    expect(tabs.getByText("Roadmap").getAttribute("aria-current")).toBe("page");
    expect(tabs.getByRole("link", { name: "Skill Check" }).getAttribute("href")).toBe(
      "/my-pathway/skill-check",
    );
  });

  it.each([
    "/my-pathway/skill-check",
    "/my-pathway/skill-check/frontend-developer",
    "/my-pathway/skill-check/frontend-developer/result",
  ])("has Skill Check current on %s", async (path) => {
    const tabs = await renderTabs(path);

    expect(tabs.getByText("Skill Check").getAttribute("aria-current")).toBe("page");
    expect(tabs.getByRole("link", { name: "Roadmap" }).getAttribute("href")).toBe("/my-pathway");
  });

  it("marks only one tab as current at a time", async () => {
    const tabs = await renderTabs("/my-pathway");

    expect(tabs.queryByRole("link", { name: "Roadmap" })).toBeNull();
    expect(tabs.queryByText("Skill Check")?.getAttribute("aria-current")).toBeNull();
  });
});
