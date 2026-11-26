import { useId, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { BackLinkTo } from "../skillCheck/components/BackLink";

const HOW_IT_WORKS = [
  "It is a self-check, not a certificate.",
  "Your score does not change your progress or unlock anything.",
  "You can skip it and keep going.",
  "You can retake it any time. We show your latest score.",
];

function NumberedList({ label, items }: { label: string; items: ReactNode[] }) {
  return (
    <ol aria-label={label} className="flex flex-col gap-4 rounded-2xl border border-line p-5">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-4 text-base text-ink">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-50 text-sm text-brand-700"
          >
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="rounded-3xl border border-line bg-surface p-6">
      <h2 id={headingId} className="font-display text-xl font-medium text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Before a stage quiz: what it covers, how it works, and a choice to start or skip it. */
export function StageQuizIntro({
  careerId,
  stageTitle,
  steps,
  questionCount,
  onStart,
  onSkip,
}: {
  careerId: string;
  stageTitle: string;
  /** The steps the stage covers, in order. */
  steps: { id: string; title: string; order: number }[];
  questionCount: number;
  onStart: () => void;
  onSkip: () => void;
}) {
  const readyId = useId();
  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back" />

      <header className="flex flex-col gap-3">
        <p className="text-brand-700">{stageTitle} · Stage quiz</p>
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          {stageTitle} Quiz
        </h1>
        <div className="flex flex-wrap gap-2">
          <Tag tone="brand" className="px-3 py-2 text-sm">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </Tag>
          <Tag tone="neutral" className="px-3 py-2 text-sm">
            One question at a time
          </Tag>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {steps.length > 0 && (
            <Card title="What it covers">
              <NumberedList
                label="What it covers"
                items={steps.map((step) => `Step ${step.order} · ${step.title}`)}
              />
            </Card>
          )}
          <Card title="How it works">
            <NumberedList label="How it works" items={HOW_IT_WORKS} />
          </Card>
        </div>

        <section
          aria-labelledby={readyId}
          className="flex flex-col gap-3 rounded-3xl border border-brand-200 bg-brand-50 p-6"
        >
          <h2 id={readyId} className="font-display text-xl font-medium text-ink">
            Ready when you are
          </h2>
          <p className="text-sm text-ink-muted">
            Best taken after you finish the steps in this stage, but you can take it now.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button isPrimary={false} className="flex-1" onClick={onSkip}>
              Skip for now
            </Button>
            <Button className="flex-1" onClick={onStart}>
              Start quiz
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
