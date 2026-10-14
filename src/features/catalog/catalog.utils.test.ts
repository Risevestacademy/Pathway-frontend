import { describe, expect, it } from "vitest";
import {
  getCatalogueFilters,
  getCatalogueTabs,
  resolveView,
} from "./catalog.utils";

describe("getCatalogueTabs", () => {
  it("shows Recommended, the level and All when both filters are set", () => {
    expect(getCatalogueTabs("Recent graduate", true)).toEqual([
      { id: "recommended", label: "Recommended" },
      { id: "level", label: "Recent graduate" },
      { id: "all", label: "All" },
    ]);
  });

  it("drops Recommended when there is no interest", () => {
    expect(getCatalogueTabs("Recent graduate", false).map((t) => t.id)).toEqual(
      ["level", "all"],
    );
  });

  it("drops the level tab when there is no level", () => {
    expect(getCatalogueTabs(undefined, true).map((t) => t.id)).toEqual([
      "recommended",
      "all",
    ]);
  });

  it("always keeps All", () => {
    expect(getCatalogueTabs(undefined, false).map((t) => t.id)).toEqual(["all"]);
  });
});

describe("resolveView", () => {
  const tabs = getCatalogueTabs("Recent graduate", false);

  it("keeps a view that is still available", () => {
    expect(resolveView("all", tabs)).toBe("all");
  });

  it("falls back to the first tab when the view disappeared", () => {
    expect(resolveView("recommended", tabs)).toBe("level");
  });
});

describe("getCatalogueFilters", () => {
  it("sends level and interest for Recommended", () => {
    expect(
      getCatalogueFilters("recommended", "recent-graduate", "design"),
    ).toEqual({ level: "RECENT_GRAD", interest: "design" });
  });

  it("sends only the level for the level view", () => {
    expect(getCatalogueFilters("level", "recent-graduate", "design")).toEqual({
      level: "RECENT_GRAD",
      interest: undefined,
    });
  });

  it("sends no filters for All", () => {
    expect(getCatalogueFilters("all", "recent-graduate", "design")).toEqual({});
  });
});
