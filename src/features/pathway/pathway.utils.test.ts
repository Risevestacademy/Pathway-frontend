import { describe, expect, it } from "vitest";
import { mockRoadmaps } from "./pathway.mock";
import {
  describeEstimate,
  getRoadmap,
  getStepContext,
} from "./pathway.utils";

describe("getRoadmap", () => {
  it("returns a published career with its roadmap", () => {
    const result = getRoadmap("frontend-developer");
    expect(result?.career.title).toBe("Frontend Developer");
    expect(result?.roadmap?.steps.length).toBeGreaterThan(0);
  });

  it("returns null for a retired career even if it has a roadmap", () => {
    expect(getRoadmap("ux-designer")).toBeNull();
  });

  it("returns null for an unknown career", () => {
    expect(getRoadmap("does-not-exist")).toBeNull();
  });

  it("returns the career with no roadmap when none is linked yet", () => {
    const result = getRoadmap("product-manager");
    expect(result?.career.id).toBe("product-manager");
    expect(result?.roadmap).toBeNull();
  });
});

describe("describeEstimate", () => {
  it("includes every assumption the source provides", () => {
    expect(
      describeEstimate({
        hours: 20,
        assumptions: { priorKnowledge: "No prior coding", weeklyStudyHours: 5 },
      }),
    ).toEqual({
      hours: "≈20 hours",
      assumptions: ["No prior coding", "at 5 hrs/week"],
    });
  });

  it.each([
    ["no estimate", undefined],
    ["null assumptions", { hours: 25, assumptions: null }],
    ["empty assumptions", { hours: 25, assumptions: {} }],
  ])("omits the estimate with %s", (_, estimate) => {
    expect(describeEstimate(estimate)).toBeNull();
  });
});

describe("getStepContext", () => {
  const steps = mockRoadmaps[0].steps;

  it("finds a step by stable id with its neighbours", () => {
    const context = getStepContext(steps, "fe-css");
    expect(context?.number).toBe(2);
    expect(context?.previous?.stepId).toBe("fe-html");
    expect(context?.next?.stepId).toBe("fe-js");
  });

  it("resolves a required prerequisite step and its position", () => {
    const context = getStepContext(steps, "fe-react");
    expect(context?.required?.step.stepId).toBe("fe-js");
    expect(context?.required?.number).toBe(3);
  });

  it("returns null for an unknown step", () => {
    expect(getStepContext(steps, "nope")).toBeNull();
  });
});
