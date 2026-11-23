import { api } from "./axios";
import { getOrNull, rethrowCareerNotSaved } from "./pathways.api";

export interface QuizOptionDto {
  id: string;
  text: string;
}

export interface QuizQuestionDto {
  id: string;
  prompt: string;
  /** In display order. The correct option is never included. */
  options: QuizOptionDto[];
}

export interface QuizDto {
  id: string;
  stageId: string;
  /** In display order. */
  questions: QuizQuestionDto[];
}

/**
 * A stage's quiz questions. Resolves to null when there is no quiz to show:
 * the pathway isn't readable or the stage has no quiz (404), or an id isn't a
 * valid UUID (400).
 */
export function fetchQuiz(
  pathwayId: string,
  stageId: string,
): Promise<QuizDto | null> {
  return getOrNull(quizUrl(pathwayId, stageId));
}

export interface QuizAnswerDto {
  questionId: string;
  optionId: string;
}

export interface QuizBreakdownItemDto {
  questionId: string;
  prompt: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface QuizResultDto {
  quizId: string;
  score: { correct: number; total: number };
  passed: boolean;
  /** The step to go back to, when there is one. */
  revisitStepId: string | null;
  breakdown: QuizBreakdownItemDto[];
  submittedAt: string;
}

export interface QuizSubmissionDto extends QuizResultDto {
  /** 20 for the first submit of a quiz, whatever the score; 0 for a retake. */
  xpAwarded: number;
  nextStepId: string | null;
  streak: { current: number; longest: number };
}

/**
 * Grades the answers and stores an attempt every time. A quiz never completes
 * a step. Throws a CareerNotSavedError when the user hasn't saved the
 * pathway's career (409).
 */
export async function submitQuiz(
  pathwayId: string,
  stageId: string,
  answers: QuizAnswerDto[],
): Promise<QuizSubmissionDto> {
  try {
    const { data } = await api.post<QuizSubmissionDto>(
      `${quizUrl(pathwayId, stageId)}/submit`,
      { answers },
    );
    return data;
  } catch (error) {
    return rethrowCareerNotSaved(error);
  }
}

/**
 * The caller's latest attempt, with the score and a breakdown. It has no XP.
 * Resolves to null when there is nothing to show: the quiz isn't readable, or
 * hasn't been submitted (404), or an id isn't a valid UUID (400).
 */
export function fetchQuizResult(
  pathwayId: string,
  stageId: string,
): Promise<QuizResultDto | null> {
  return getOrNull(`${quizUrl(pathwayId, stageId)}/result`);
}

function quizUrl(pathwayId: string, stageId: string): string {
  return `/pathways/${encodeURIComponent(pathwayId)}/stages/${encodeURIComponent(stageId)}/quiz`;
}
