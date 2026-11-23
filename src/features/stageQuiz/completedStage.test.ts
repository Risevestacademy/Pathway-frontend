import { describe, expect, it } from "vitest";
import { completedStageOf, type QuizStageRef } from "./completedStage";

const stages: QuizStageRef[] = [
  { id: "g1", title: "Foundations", stepIds: ["s1", "s2"] },
  { id: "g2", title: "Core skills", stepIds: ["s3"] },
  { id: "g3", title: "Empty stage", stepIds: [] },
];

describe("completedStageOf", () => {
  it("is the stage of the step, once every step in that stage is complete", () => {
    const statuses = { s1: "COMPLETED", s2: "COMPLETED", s3: "NOT_STARTED" } as const;

    expect(completedStageOf(stages, statuses, "s1")?.id).toBe("g1");
    expect(completedStageOf(stages, statuses, "s2")?.id).toBe("g1");
  });

  it("is null while any step in the stage is not complete", () => {
    expect(completedStageOf(stages, { s1: "COMPLETED", s2: "IN_PROGRESS" }, "s1")).toBeNull();
    expect(completedStageOf(stages, { s1: "COMPLETED" }, "s1")).toBeNull();
  });

  it("looks only at the stage the step belongs to", () => {
    const statuses = { s1: "NOT_STARTED", s2: "NOT_STARTED", s3: "COMPLETED" } as const;

    expect(completedStageOf(stages, statuses, "s3")?.id).toBe("g2");
    expect(completedStageOf(stages, statuses, "s1")).toBeNull();
  });

  it("is null when they aren't tracking this pathway, so there are no statuses", () => {
    expect(completedStageOf(stages, null, "s1")).toBeNull();
  });

  it("is null for a step that isn't in any stage", () => {
    expect(completedStageOf(stages, { s1: "COMPLETED", s2: "COMPLETED" }, "nope")).toBeNull();
  });

  it("is null when there are no stages", () => {
    expect(completedStageOf([], { s1: "COMPLETED" }, "s1")).toBeNull();
  });
});
