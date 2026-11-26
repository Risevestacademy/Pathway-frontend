import { describe, expect, it } from "vitest";
import { getQuizTier } from "./quizTier";

describe("getQuizTier", () => {
  it("is full marks only when every question is right", () => {
    expect(getQuizTier({ correct: 5, total: 5 })).toBe("full-marks");
    expect(getQuizTier({ correct: 1, total: 1 })).toBe("full-marks");
  });

  it.each([
    [4, 5], // 80%
    [7, 10], // exactly 70%
    [3, 4], // 75%
    [9, 10],
  ])("is nice work from 70%% up, short of all correct (%i of %i)", (correct, total) => {
    expect(getQuizTier({ correct, total })).toBe("nice-work");
  });

  it.each([
    [3, 5], // 60%
    [2, 5],
    [6, 10], // 60%
    [0, 5],
    [2, 3], // 67%, just under 70%
  ])("is a good start below 70%% (%i of %i)", (correct, total) => {
    expect(getQuizTier({ correct, total })).toBe("good-start");
  });

  it("is a good start when there were no questions to answer", () => {
    expect(getQuizTier({ correct: 0, total: 0 })).toBe("good-start");
  });
});
