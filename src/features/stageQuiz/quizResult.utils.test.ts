import { describe, expect, it } from "vitest";
import type { QuizBreakdownItemDto } from "../../lib/api/pathwayQuiz.api";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import { findNextStage, findStep, firstMissedPrompt } from "./quizResult.utils";

const step = (id: string, order: number, title: string) => ({
  id,
  title,
  order,
  status: "NOT_STARTED" as const,
  description: "",
  skills: [],
  expectedActivity: "",
  careerReadiness: "",
  resources: [],
  tasks: [],
});

const stage = (id: string, order: number, title: string, steps: ReturnType<typeof step>[]) => ({
  id,
  title,
  order,
  description: "",
  progress: { completed: 0, total: steps.length, percentage: 0 },
  quiz: { status: "NOT_TAKEN" },
  steps,
});

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Designer", description: "", retired: false, stageCount: 3, stepCount: 3, resourceCount: 0 },
  progress: { completed: 0, total: 3, percentage: 0, nextStepId: null, selfReported: true },
  // Out of order on purpose: the next stage is by `order`, not by position.
  stages: [
    stage("g3", 3, "Portfolio", [step("s3", 3, "Build a case study")]),
    stage("g1", 1, "Foundations", [step("s1", 1, "What design is for")]),
    stage("g2", 2, "Core skills", [step("s2", 2, "How people think")]),
  ],
};

describe("findNextStage", () => {
  it("is the stage that comes right after this one", () => {
    expect(findNextStage(detail, "g1")?.id).toBe("g2");
    expect(findNextStage(detail, "g2")?.id).toBe("g3");
  });

  it("is null after the last stage", () => {
    expect(findNextStage(detail, "g3")).toBeNull();
  });

  it("is null for a stage that isn't in the pathway", () => {
    expect(findNextStage(detail, "nope")).toBeNull();
  });
});

describe("findStep", () => {
  it("finds a step in any stage", () => {
    expect(findStep(detail, "s2")).toMatchObject({ id: "s2", title: "How people think", order: 2 });
  });

  it("is null when there is no such step, or no step id", () => {
    expect(findStep(detail, "nope")).toBeNull();
    expect(findStep(detail, null)).toBeNull();
  });
});

describe("firstMissedPrompt", () => {
  const item = (prompt: string, isCorrect: boolean): QuizBreakdownItemDto => ({
    questionId: prompt,
    prompt,
    selectedOptionId: "o1",
    selectedOptionText: "A",
    correctOptionId: "o2",
    correctOptionText: "B",
    isCorrect,
  });

  it("is the prompt of the first question they got wrong", () => {
    expect(firstMissedPrompt([item("Q1", true), item("Q2", false), item("Q3", false)])).toBe("Q2");
  });

  it("is null when every question was right", () => {
    expect(firstMissedPrompt([item("Q1", true), item("Q2", true)])).toBeNull();
  });

  it("is null for an empty breakdown", () => {
    expect(firstMissedPrompt([])).toBeNull();
  });
});
