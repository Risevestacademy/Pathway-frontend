import { describe, expect, it } from "vitest";
import { mockResources } from "./resources.mock";
import { getResources } from "./resources.utils";

describe("getResources", () => {
  it("returns the requested resources in the same order as their ids", () => {
    const result = getResources(["r-fcc-web", "r-mdn-html"]);

    expect(result.map((resource) => resource.id)).toEqual([
      "r-fcc-web",
      "r-mdn-html",
    ]);
  });

  it("returns an empty list when no resource ids are provided", () => {
    expect(getResources([])).toEqual([]);
  });

  it("ignores resource ids that do not exist", () => {
    const result = getResources(["r-mdn-html", "missing-resource", "r-fcc-web"]);

    expect(result.map((resource) => resource.id)).toEqual([
      "r-mdn-html",
      "r-fcc-web",
    ]);
  });

  it("uses the supplied resource collection", () => {
    const customResources = [
      {
        id: "custom-resource",
        title: "Custom resource",
        provider: "Pathway",
        kind: "article" as const,
        url: "https://example.com/custom-resource",
      },
    ];

    expect(getResources(["custom-resource"], customResources)).toEqual(
      customResources,
    );
    expect(getResources(["r-mdn-html"], customResources)).toEqual([]);
  });

  it("includes all default resources referenced by the frontend HTML step", () => {
    const result = getResources(["r-mdn-html", "r-fcc-web", "r-a11y-video"]);

    expect(result).toHaveLength(3);
    expect(result.every((resource) => mockResources.includes(resource))).toBe(
      true,
    );
  });
});
