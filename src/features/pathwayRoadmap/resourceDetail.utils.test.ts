import { describe, expect, it } from "vitest";
import type { PathwayResourceDto, PathwayStepDto } from "../../lib/api/pathways.api";
import { findResourceDetail } from "./resourceDetail.utils";

const resource = (id: string, over: Partial<PathwayResourceDto> = {}): PathwayResourceDto => ({
  id,
  title: `Resource ${id}`,
  description: "What it is",
  url: `https://example.com/${id}`,
  type: "ARTICLE",
  provider: "Jon Yablonski",
  costStatus: "FREE",
  certificationCost: null,
  curationRationale: "Why it was picked",
  lastCheckedDate: "2026-09-12",
  skills: [{ id: "k1", name: "UX laws" }],
  ...over,
});

const step = (id: string, order: number, resources: PathwayResourceDto[]): PathwayStepDto => ({
  id,
  title: `Step ${order}`,
  description: "",
  learningObjective: `Learn ${order}`,
  prerequisites: null,
  expectedActivity: "",
  order,
  skills: [],
  resources,
});

const pathway = (steps: PathwayStepDto[]) => ({
  id: "p1",
  careerId: "c1",
  title: "Roadmap",
  description: "",
  steps,
});

describe("findResourceDetail", () => {
  it("finds the resource, and the step it belongs to, numbered by its place in the pathway", () => {
    const detail = findResourceDetail(
      pathway([step("s2", 2, [resource("b")]), step("s1", 1, [resource("a")])]),
      "b",
    );

    expect(detail?.step).toEqual({ id: "s2", number: 2, title: "Step 2" });
    expect(detail?.resource.id).toBe("b");
  });

  it("shapes the resource the way the step pages show it", () => {
    const detail = findResourceDetail(pathway([step("s1", 1, [resource("a")])]), "a");

    expect(detail?.resource).toMatchObject({
      title: "Resource a",
      provider: "Jon Yablonski",
      kind: "article",
      url: "https://example.com/a",
      costLabel: "Course: free",
    });
  });

  it("carries what the detail page needs beyond that", () => {
    const detail = findResourceDetail(pathway([step("s1", 1, [resource("a")])]), "a");

    expect(detail).toMatchObject({
      description: "What it is",
      curationRationale: "Why it was picked",
      lastChecked: "2026-09-12",
      skills: ["UX laws"],
    });
  });

  it("has no description when the backend gave none, or only blanks", () => {
    const none = findResourceDetail(pathway([step("s1", 1, [resource("a", { description: null })])]), "a");
    const blank = findResourceDetail(pathway([step("s1", 1, [resource("a", { description: "  " })])]), "a");

    expect(none?.description).toBeNull();
    expect(blank?.description).toBeNull();
  });

  it("is null when no step has that resource", () => {
    expect(findResourceDetail(pathway([step("s1", 1, [resource("a")])]), "zzz")).toBeNull();
    expect(findResourceDetail(pathway([]), "a")).toBeNull();
  });
});
