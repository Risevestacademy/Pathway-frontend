import { describe, expect, it } from "vitest";
import type { PathwayResourceDto, PathwayStepDto } from "../../lib/api/pathways.api";
import { buildResourceGroups } from "./resourceGroups.utils";

const resource = (id: string, over: Partial<PathwayResourceDto> = {}): PathwayResourceDto => ({
  id,
  title: `Resource ${id}`,
  description: null,
  url: `https://example.com/${id}`,
  type: "COURSE",
  provider: "Acme",
  costStatus: "FREE",
  certificationCost: null,
  curationRationale: "",
  lastCheckedDate: "2026-10-01",
  skills: [],
  ...over,
});

const step = (id: string, order: number, resources: PathwayResourceDto[]): PathwayStepDto => ({
  id,
  title: `Step ${order}`,
  description: "",
  learningObjective: "",
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

describe("buildResourceGroups", () => {
  it("groups the resources by step, in the steps' order, numbered from 1", () => {
    const groups = buildResourceGroups(
      pathway([step("s2", 2, [resource("b")]), step("s1", 1, [resource("a")])]),
    );

    expect(groups.map((g) => [g.stepId, g.number, g.title])).toEqual([
      ["s1", 1, "Step 1"],
      ["s2", 2, "Step 2"],
    ]);
  });

  it("keeps a step's resources in the order the backend gave", () => {
    const [group] = buildResourceGroups(
      pathway([step("s1", 1, [resource("b"), resource("a")])]),
    );

    expect(group.resources.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("shapes each resource the way the step pages show it", () => {
    const [group] = buildResourceGroups(
      pathway([step("s1", 1, [resource("a", { type: "VIDEO", costStatus: "PAID" })])]),
    );

    expect(group.resources[0]).toMatchObject({
      id: "a",
      title: "Resource a",
      provider: "Acme",
      kind: "video",
      url: "https://example.com/a",
      costLabel: "Course: paid",
    });
  });

  it("carries when each resource was last checked, for the rows to show", () => {
    const [group] = buildResourceGroups(
      pathway([step("s1", 1, [resource("a", { lastCheckedDate: "2026-09-12" })])]),
    );

    expect(group.resources[0].lastChecked).toBe("2026-09-12");
  });

  it("leaves out a step that has no resources, but keeps its number", () => {
    const groups = buildResourceGroups(
      pathway([step("s1", 1, []), step("s2", 2, [resource("a")])]),
    );

    expect(groups.map((g) => [g.stepId, g.number])).toEqual([["s2", 2]]);
  });

  it("is empty when no step has a resource", () => {
    expect(buildResourceGroups(pathway([step("s1", 1, [])]))).toEqual([]);
    expect(buildResourceGroups(pathway([]))).toEqual([]);
  });
});
