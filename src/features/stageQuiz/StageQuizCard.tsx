import { useId } from "react";
import { LinkButton } from "../../components/ui/Button";
import { useStageHasQuiz } from "./useStageHasQuiz";

/**
 * A stage's optional quiz. It's always on offer, since the quiz can be taken at
 * any time, but it says so plainly once every step in the stage is complete.
 * A stage with no quiz shows nothing.
 */
export function StageQuizCard({
  careerId,
  stageId,
  stageTitle,
  complete,
}: {
  careerId: string;
  stageId: string;
  stageTitle: string;
  /** Every step in the stage is marked complete. */
  complete: boolean;
}) {
  const headingId = useId();
  const hasQuiz = useStageHasQuiz(careerId, stageId);
  if (!hasQuiz) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-200 bg-brand-50 p-6"
    >
      <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          {complete ? `${stageTitle} stage complete` : `${stageTitle} quiz`}
        </h2>
        <p className="text-sm text-ink-muted">
          {complete
            ? "Take the quiz to check what stuck. It’s optional, so skip it and keep going if you’d rather."
            : "Best taken after you finish the steps in this stage, but you can take it now. It’s optional."}
        </p>
      </div>
      <LinkButton
        to="/my-pathway/$careerId/quiz/$stageId"
        params={{ careerId, stageId }}
        isPrimary={complete}
      >
        Take the {stageTitle} quiz
      </LinkButton>
    </section>
  );
}
