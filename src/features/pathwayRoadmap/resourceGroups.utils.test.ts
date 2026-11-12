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
      pathway([step("s1", 1, [resource("a", { type: "VIDEO", costStatus: "FREE" })])]),
    );

    expect(group.resources[0]).toMatchObject({
      id: "a",
      title: "Resource a",
      provider: "Acme",
      kind: "video",
      url: "https://example.com/a",
      costLabel: "Course: free",
    });
  });

  it("carries when each resource was last checked, for the rows to show", () => {
    const [group] = buildResourceGroups(
      pathway([step("s1", 1, [resource("a", { lastCheckedDate: "2026-09-12" })])]),
    );

    expect(group.resources[0].lastChecked).toBe("2026-09-12");
  });

  describe("paid resources", () => {
    it("keeps them apart from the step's free ones, which are the ones to tick", () => {
      const [group] = buildResourceGroups(
        pathway([
          step("s1", 1, [
            resource("free", { costStatus: "FREE" }),
            resource("paid", { costStatus: "PAID" }),
            resource("unknown", { costStatus: "UNKNOWN" }),
          ]),
        ]),
      );

      expect(group.resources.map((r) => r.id)).toEqual(["free", "unknown"]);
      expect(group.paid.map((r) => r.id)).toEqual(["paid"]);
    });

    it("has none when every resource is free", () => {
      const [group] = buildResourceGroups(pathway([step("s1", 1, [resource("a")])]));

      expect(group.paid).toEqual([]);
    });

    it("still lists a step whose resources are all paid", () => {
      const [group] = buildResourceGroups(
        pathway([step("s1", 1, [resource("paid", { costStatus: "PAID" })])]),
      );

      expect(group.stepId).toBe("s1");
      expect(group.resources).toEqual([]);
      expect(group.paid.map((r) => r.id)).toEqual(["paid"]);
    });
  });

  it("carries what each resource covers, or null when the backend gave nothing", () => {
    const [group] = buildResourceGroups(
      pathway([
        step("s1", 1, [
          resource("a", { description: " A full beginner programme. " }),
          resource("b", { description: null }),
          resource("c", { description: "  " }),
        ]),
      ]),
    );

    expect(group.resources.map((r) => r.description)).toEqual(["A full beginner programme.", null, null]);
  });

  it("keeps a step that has no resources, with its number, so it can still be completed", () => {
    const groups = buildResourceGroups(
      pathway([step("s1", 1, []), step("s2", 2, [resource("a")])]),
    );

    expect(groups.map((g) => [g.stepId, g.number])).toEqual([
      ["s1", 1],
      ["s2", 2],
    ]);
    expect(groups[0].resources).toEqual([]);
    expect(groups[0].paid).toEqual([]);
  });

  it("lists every step even when none has a resource, and nothing when there are no steps", () => {
    expect(buildResourceGroups(pathway([step("s1", 1, [])])).map((g) => g.stepId)).toEqual(["s1"]);
    expect(buildResourceGroups(pathway([]))).toEqual([]);
  });
});
