import { useId } from "react";
import { LinkButton } from "../../components/ui/Button";

/** Shown once every step in a stage is complete: an optional quiz to check what stuck. */
export function StageQuizCard({
  careerId,
  stageId,
  stageTitle,
}: {
  careerId: string;
  stageId: string;
  stageTitle: string;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-200 bg-brand-50 p-6"
    >
      <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          {stageTitle} stage complete
        </h2>
        <p className="text-sm text-ink-muted">
          Take the quiz to check what stuck. It’s optional, so skip it and keep going if you’d
          rather.
        </p>
      </div>
      <LinkButton to="/my-pathway/$careerId/quiz/$stageId" params={{ careerId, stageId }}>
        Take the {stageTitle} quiz
      </LinkButton>
    </section>
  );
}
