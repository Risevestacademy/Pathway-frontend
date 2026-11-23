import clsx from "clsx";
import { Check, X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import type { QuizResultDto } from "../../lib/api/pathwayQuiz.api";
import { BackLinkTo } from "../skillCheck/components/BackLink";

function Card({
  title,
  tone = "plain",
  children,
}: {
  title: string;
  tone?: "plain" | "brand";
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        "flex flex-col gap-3 rounded-3xl border p-6",
        tone === "brand" ? "border-brand-200 bg-brand-50" : "border-line bg-surface",
      )}
    >
      <h2 id={headingId} className="font-display text-xl font-medium text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A stage quiz's latest result: the score, each answer, and where to go next. */
export function QuizResultScreen({
  careerId,
  stageTitle,
  result,
  xpAwarded,
  nextStage,
  revisit,
  onRetake,
  onContinue,
  onOpenStep,
}: {
  careerId: string;
  stageTitle: string;
  result: QuizResultDto;
  /** XP this attempt earned. Only known right after submitting, so absent on a later visit. */
  xpAwarded?: number;
  /** The stage after this one, or null after the last. */
  nextStage: { id: string; title: string } | null;
  revisit: {
    step: { id: string; title: string; order: number };
    missedPrompt: string | null;
  } | null;
  onRetake: () => void;
  onContinue: () => void;
  onOpenStep: (stepId: string) => void;
}) {
  const { score, breakdown } = result;
  const lead = nextStage
    ? `Move on to ${nextStage.title}, or retake the quiz`
    : "You can retake the quiz";
  const nextText = `${lead}${revisit ? " after revisiting the step above" : " any time"}. We show your latest score.`;

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back to resources" />

      <header className="flex flex-col gap-3">
        <p className="text-brand-700">{stageTitle} · Stage quiz</p>
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          Your Result
        </h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-3xl border border-line bg-surface p-6">
            <p className="font-display text-5xl font-medium text-ink">
              {score.correct} of {score.total}
            </p>
            <div className="flex gap-2">
              <Tag tone="neutral" className="px-3 py-2 text-sm">
                Self-check
              </Tag>
              {xpAwarded !== undefined && xpAwarded > 0 && (
                <Tag tone="warning" className="px-3 py-2 text-sm">
                  +{xpAwarded} XP
                </Tag>
              )}
            </div>
            <p className="min-w-56 flex-1 border-line text-base text-ink-muted sm:border-l sm:pl-6">
              This is a self-check. It does not change your progress, and nothing is locked or
              unlocked.
            </p>
          </div>

          <Card title="Your answers">
            <ul aria-label="Your answers" className="flex flex-col gap-3">
              {breakdown.map((item, index) => (
                <li
                  key={item.questionId}
                  className={clsx(
                    "flex items-start gap-4 rounded-2xl border p-4",
                    item.isCorrect ? "border-success-600/20 bg-success-50" : "border-danger-600/20 bg-danger-50",
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      item.isCorrect ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700",
                    )}
                  >
                    {item.isCorrect ? <Check className="size-5" /> : <X className="size-5" />}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="sr-only">{item.isCorrect ? "Right" : "Wrong"}</span>
                    <p className="text-xs text-ink-muted">Question {index + 1}</p>
                    <p className="text-base font-medium text-ink">{item.prompt}</p>
                    {!item.isCorrect && (
                      <>
                        <p className="text-sm text-ink-muted">Your answer: {item.selectedOptionText}</p>
                        <p className="text-sm text-success-700">Correct answer: {item.correctOptionText}</p>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="What next" tone="brand">
            <p className="text-sm text-ink-muted">{nextText}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button isPrimary={false} className="flex-1" onClick={onRetake}>
                Retake quiz
              </Button>
              {nextStage && (
                <Button className="flex-1" onClick={onContinue}>
                  Continue to {nextStage.title}
                </Button>
              )}
            </div>
          </Card>

          {revisit && (
            <Card title="Worth revisiting">
              <div className="flex flex-col gap-1 rounded-2xl bg-surface-muted p-4">
                <p className="text-base font-medium text-ink">
                  Step {revisit.step.order} · {revisit.step.title}
                </p>
                {revisit.missedPrompt && (
                  <p className="text-sm text-ink-muted">You missed: {revisit.missedPrompt}</p>
                )}
              </div>
              <Button isPrimary={false} onClick={() => onOpenStep(revisit.step.id)}>
                Open Step
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
