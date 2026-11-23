import { describe, expect, it } from "vitest";
import type { PathwayResourceItemDto, PathwayResourcesDto } from "../../lib/api/pathwayResources.api";
import { applyResourceCompletion, completedResourceIds } from "./resourceCompletion.utils";

const resource = (id: string, isCompleted: boolean): PathwayResourceItemDto => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  type: "COURSE",
  costStatus: "FREE",
  estimatedWeeks: 1,
  lastCheckedDate: "2026-11-23T14:36:49.328Z",
  isCompleted,
  completedAt: isCompleted ? "2026-11-20T10:00:00.000Z" : null,
});

const data: PathwayResourcesDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 2, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        { id: "s1", title: "One", order: 1, status: "NOT_STARTED", completedAt: null, resources: [resource("a", true), resource("b", false)] },
        // The same resource can sit under more than one step.
        { id: "s2", title: "Two", order: 2, status: "NOT_STARTED", completedAt: null, resources: [resource("a", true), resource("c", false)] },
      ],
    },
  ],
  optionalPaidCourses: [resource("p", false)],
};

describe("completedResourceIds", () => {
  it("lists the resources the caller has completed, under any step", () => {
    expect([...completedResourceIds(data)].sort()).toEqual(["a"]);
  });

  it("includes completed optional paid courses", () => {
    const withPaid = { ...data, optionalPaidCourses: [resource("p", true)] };

    expect(completedResourceIds(withPaid).has("p")).toBe(true);
  });

  it("is empty when there is no data yet", () => {
    expect(completedResourceIds(null).size).toBe(0);
    expect(completedResourceIds(undefined).size).toBe(0);
  });
});

describe("applyResourceCompletion", () => {
  const confirmed = (resourceId: string, completed: boolean) => ({
    resourceId,
    completed,
    completedAt: completed ? "2026-11-23T15:00:00.000Z" : null,
    xpAwarded: 0,
  });

  it("marks the resource complete everywhere it appears", () => {
    const next = applyResourceCompletion(data, confirmed("c", true));

    expect(completedResourceIds(next).has("c")).toBe(true);
    expect(next.stages[0].steps[1].resources[1]).toMatchObject({
      isCompleted: true,
      completedAt: "2026-11-23T15:00:00.000Z",
    });
  });

  it("updates every step that lists the resource, and the optional paid courses", () => {
    const shared = { ...data, optionalPaidCourses: [resource("a", true)] };

    const next = applyResourceCompletion(shared, confirmed("a", false));

    expect(completedResourceIds(next).size).toBe(0);
    expect(next.optionalPaidCourses[0]).toMatchObject({ isCompleted: false, completedAt: null });
  });

  it("leaves the other resources alone, and doesn't change the original", () => {
    const next = applyResourceCompletion(data, confirmed("b", true));

    expect(next.stages[0].steps[0].resources[0]).toBe(data.stages[0].steps[0].resources[0]);
    expect(data.stages[0].steps[0].resources[1].isCompleted).toBe(false);
  });

  it("gives back the same data when it has nothing to update", () => {
    expect(applyResourceCompletion(undefined, confirmed("a", true))).toBeUndefined();
  });
});
