export type QuizTier = "full-marks" | "nice-work" | "good-start";

/** The share of questions right, from which a score counts as "nice work". */
const NICE_WORK_SHARE = 0.7;

/**
 * Which result modal a score gets: every question right is full marks, at
 * least 70% is nice work, and anything lower is a good start.
 */
export function getQuizTier(score: { correct: number; total: number }): QuizTier {
  if (score.total <= 0) return "good-start";
  if (score.correct >= score.total) return "full-marks";
  return score.correct / score.total >= NICE_WORK_SHARE ? "nice-work" : "good-start";
}
