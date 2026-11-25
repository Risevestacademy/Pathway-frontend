import clsx from "clsx";
import { ChevronsLeft, Info } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import type { QuizAnswerDto, QuizQuestionDto } from "../../lib/api/pathwayQuiz.api";
import {
  answersInOrder,
  goBack,
  goNext,
  initialQuizFlow,
  selectOption,
  skipQuestion,
} from "./quizFlow";

/** One question at a time, with a choice to skip it, go back, and send the answers at the end. */
export function QuizQuestionScreen({
  stageTitle,
  questions,
  onSubmit,
  onExit,
  isSubmitting,
  errorMessage,
}: {
  stageTitle: string;
  questions: QuizQuestionDto[];
  /** Called with the answered questions only; skipped ones are left out. */
  onSubmit: (answers: QuizAnswerDto[]) => void;
  onExit: () => void;
  isSubmitting: boolean;
  /** Why the last attempt to send the answers failed. */
  errorMessage?: ReactNode;
}) {
  const [flow, setFlow] = useState(initialQuizFlow);
  const promptId = useId();

  const total = questions.length;
  const question = questions[flow.index];
  if (!question) return null;

  const isLast = flow.index === total - 1;
  const chosen = flow.answers[question.id];
  const answers = answersInOrder(questions, flow);
  // Skipping the last question sends the others, so its own answer doesn't count.
  const othersAnswered = answers.filter((answer) => answer.questionId !== question.id);
  // A quiz with no other answers has nothing to send.
  const canSkip = !isLast || othersAnswered.length > 0;

  const finish = (sent: QuizAnswerDto[]) => onSubmit(sent);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onExit}
        className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-grey-50 py-2 pr-3 pl-2 text-base leading-5 font-medium text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-100 motion-reduce:transition-none"
      >
        <ChevronsLeft aria-hidden className="size-6" />
        Exit quiz
      </button>

      <header className="flex flex-col gap-3">
        <p className="text-brand-700">{stageTitle} · Stage quiz</p>
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          Question {flow.index + 1} of {total}
        </h1>
        <div aria-hidden className="flex gap-3">
          {questions.map((item, index) => (
            <span
              key={item.id}
              className={clsx(
                "h-1.5 flex-1 rounded-full",
                index <= flow.index ? "bg-brand-500" : "bg-grey-100",
              )}
            />
          ))}
        </div>
      </header>

      <div
        role="group"
        aria-labelledby={promptId}
        className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6"
      >
        <p id={promptId} className="font-display text-xl leading-8 font-medium text-ink sm:text-2xl">
          {question.prompt}
        </p>

        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="has-checked:border-brand-500 has-checked:bg-brand-50 has-focus-visible:ring-2 has-focus-visible:ring-brand-500 flex cursor-pointer items-center gap-4 rounded-2xl border border-line px-5 py-4 text-base text-ink transition-colors duration-150 has-disabled:cursor-not-allowed motion-reduce:transition-none"
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={chosen === option.id}
                disabled={isSubmitting}
                onChange={() => setFlow((current) => selectOption(current, question.id, option.id))}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-grey-200 peer-checked:border-brand-500 peer-checked:after:size-3 peer-checked:after:rounded-full peer-checked:after:bg-brand-500"
              />
              {option.text}
            </label>
          ))}
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-danger-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {canSkip ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                isLast
                  ? finish(othersAnswered)
                  : setFlow((current) => skipQuestion(current, question.id, total))
              }
              className="focus-ring cursor-pointer rounded text-sm font-medium text-brand-700 underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Skip this question
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button
              isPrimary={false}
              disabled={flow.index === 0 || isSubmitting}
              onClick={() => setFlow((current) => goBack(current))}
            >
              Back
            </Button>
            <Button
              disabled={!chosen || isSubmitting}
              onClick={() => (isLast ? finish(answers) : setFlow((current) => goNext(current, total)))}
            >
              {isSubmitting && <LoadingSpinner className="size-4" />}
              {isSubmitting ? "Submitting" : isLast ? "Finish quiz" : "Next question"}
            </Button>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 text-sm text-ink-muted">
        <Info aria-hidden className="size-4 shrink-0" />
        Self-check only. Your answers are not marked by a person and do not affect your progress.
      </p>
    </div>
  );
}
