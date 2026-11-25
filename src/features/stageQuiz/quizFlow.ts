import type { QuizAnswerDto, QuizQuestionDto } from "../../lib/api/pathwayQuiz.api";

/** Where someone is in a quiz and what they have chosen so far. */
export interface QuizFlow {
  /** The question being shown, from 0. */
  index: number;
  /** The chosen option for each answered question, by question id. */
  answers: Record<string, string>;
}

export const initialQuizFlow: QuizFlow = { index: 0, answers: {} };

export function selectOption(flow: QuizFlow, questionId: string, optionId: string): QuizFlow {
  return { ...flow, answers: { ...flow.answers, [questionId]: optionId } };
}

export function goNext(flow: QuizFlow, total: number): QuizFlow {
  return { ...flow, index: Math.min(flow.index + 1, Math.max(total - 1, 0)) };
}

export function goBack(flow: QuizFlow): QuizFlow {
  return { ...flow, index: Math.max(flow.index - 1, 0) };
}

/** Moves on and leaves the question unanswered, even if it had been answered before. */
export function skipQuestion(flow: QuizFlow, questionId: string, total: number): QuizFlow {
  const answers = { ...flow.answers };
  delete answers[questionId];
  return goNext({ ...flow, answers }, total);
}

/** The answered questions only, in the order they were asked. Skipped ones aren't sent. */
export function answersInOrder(questions: QuizQuestionDto[], flow: QuizFlow): QuizAnswerDto[] {
  return questions.flatMap((question) => {
    const optionId = flow.answers[question.id];
    return optionId ? [{ questionId: question.id, optionId }] : [];
  });
}
