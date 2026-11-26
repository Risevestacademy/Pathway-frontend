import { describe, expect, it } from "vitest";
import type { QuizQuestionDto } from "../../lib/api/pathwayQuiz.api";
import {
  answersInOrder,
  goBack,
  goNext,
  initialQuizFlow,
  selectOption,
  skipQuestion,
} from "./quizFlow";

const question = (id: string): QuizQuestionDto => ({
  id,
  prompt: `Question ${id}`,
  options: [
    { id: `${id}-a`, text: "A" },
    { id: `${id}-b`, text: "B" },
  ],
});
const questions = [question("q1"), question("q2"), question("q3")];

describe("quiz flow", () => {
  it("starts on the first question with nothing answered", () => {
    expect(initialQuizFlow).toEqual({ index: 0, answers: {} });
  });

  it("records the chosen option for a question, replacing an earlier choice", () => {
    const first = selectOption(initialQuizFlow, "q1", "q1-a");
    const changed = selectOption(first, "q1", "q1-b");

    expect(first.answers).toEqual({ q1: "q1-a" });
    expect(changed.answers).toEqual({ q1: "q1-b" });
  });

  it("moves forward and back, never past either end", () => {
    const last = goNext(goNext(goNext(initialQuizFlow, 3), 3), 3);
    expect(last.index).toBe(2);
    expect(goBack(goBack(goBack(last))).index).toBe(0);
  });

  it("keeps an answer when going back to its question", () => {
    const flow = goBack(goNext(selectOption(initialQuizFlow, "q1", "q1-a"), 3));

    expect(flow.index).toBe(0);
    expect(flow.answers).toEqual({ q1: "q1-a" });
  });

  it("skipping moves on and leaves the question unanswered, even if it had an answer", () => {
    const answered = selectOption(initialQuizFlow, "q1", "q1-a");

    const skipped = skipQuestion(answered, "q1", 3);

    expect(skipped.index).toBe(1);
    expect(skipped.answers).toEqual({});
  });

  it("lists only the answered questions, in the order they were asked", () => {
    let flow = selectOption(initialQuizFlow, "q3", "q3-b");
    flow = selectOption(flow, "q1", "q1-a");

    expect(answersInOrder(questions, flow)).toEqual([
      { questionId: "q1", optionId: "q1-a" },
      { questionId: "q3", optionId: "q3-b" },
    ]);
  });

  it("lists nothing when nothing was answered", () => {
    expect(answersInOrder(questions, initialQuizFlow)).toEqual([]);
  });
});
