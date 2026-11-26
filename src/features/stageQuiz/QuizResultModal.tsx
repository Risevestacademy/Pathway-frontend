import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import fullMarksArt from "../../assets/images/quiz/full-marks.png";
import goodStartArt from "../../assets/images/quiz/good-start.png";
import niceWorkArt from "../../assets/images/quiz/nice-work.png";
import { Button } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { getQuizTier, type QuizTier } from "./quizTier";

const ART: Record<QuizTier, string> = {
  "full-marks": fullMarksArt,
  "nice-work": niceWorkArt,
  "good-start": goodStartArt,
};

const HEADLINE: Record<QuizTier, string> = {
  "full-marks": "Full marks!",
  "nice-work": "Nice work!",
  "good-start": "Good start!",
};

function describe(
  tier: QuizTier,
  score: { correct: number; total: number },
  hasRevisit: boolean,
): string {
  if (tier === "full-marks") return "You got every question right.";
  if (tier === "nice-work") {
    return `You got ${score.correct} of ${score.total} right.${
      hasRevisit ? " One step is worth another look before you move on." : ""
    }`;
  }
  return "You finished the quiz. A few steps are worth another look, and you can retake it any time.";
}

/** Shown right after a stage quiz is sent: how it went, what it earned, and where to go next. */
export function QuizResultModal({
  open,
  onOpenChange,
  stageTitle,
  score,
  xpAwarded,
  streak,
  hasRevisit,
  canContinue,
  onSeeAnswers,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageTitle: string;
  score: { correct: number; total: number };
  /** XP this attempt earned. 0 on a retake. */
  xpAwarded: number;
  streak: { current: number; longest: number };
  /** There's a step worth another look. */
  hasRevisit: boolean;
  /** There's a next step to continue to. */
  canContinue: boolean;
  onSeeAnswers: () => void;
  onContinue: () => void;
}) {
  const tier = getQuizTier(score);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in motion-reduce:animate-none" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-surface text-center shadow-overlay focus:outline-none">
          <div className="relative">
            <img src={ART[tier]} alt="" aria-hidden draggable={false} className="block w-full" />
            <DialogPrimitive.Close
              aria-label="Close"
              className="focus-ring absolute top-4 right-4 grid size-10 cursor-pointer place-items-center rounded-full bg-surface text-ink shadow-card"
            >
              <X aria-hidden className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 sm:p-8">
            <p className="text-sm text-brand-700">{stageTitle} quiz done</p>
            <DialogPrimitive.Title className="font-display text-4xl font-semibold text-ink">
              {HEADLINE[tier]}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="max-w-sm text-ink-muted">
              {describe(tier, score, hasRevisit)}
            </DialogPrimitive.Description>

            <div className="flex flex-wrap justify-center gap-2">
              <Tag tone="brand" className="px-3 py-2 text-sm">
                {score.correct} of {score.total}
              </Tag>
              {xpAwarded > 0 && (
                <Tag tone="warning" className="px-3 py-2 text-sm">
                  +{xpAwarded} XP
                </Tag>
              )}
              <Tag tone="neutral" className="px-3 py-2 text-sm">
                Self-check
              </Tag>
            </div>

            {streak.current > 0 && (
              <div className="flex w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#ffe3b8] bg-[#fff8ec] px-4 py-3 text-sm text-ink">
                <Tag tone="warning" className="bg-[#ffe9c7] px-3 py-2 text-sm font-medium text-[#b45309]">
                  {streak.current}-day streak
                </Tag>
                Come back tomorrow to keep it going.
              </div>
            )}

            <div className="mt-2 flex w-full flex-wrap justify-center gap-3">
              <Button isPrimary={false} size="lg" onClick={onSeeAnswers}>
                See my answers
              </Button>
              {canContinue && (
                <Button size="lg" onClick={onContinue}>
                  Continue to next step
                </Button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
