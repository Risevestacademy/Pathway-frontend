import heroArt from "../../../assets/images/overview-hero-art.png";

/**
 * The banner at the top of a pathway overview: the career's name and how big the roadmap is.
 * It names the stages only when it is told them, since not every screen has them.
 */
export function OverviewHero({
  title,
  stepCount,
  stageCount,
}: {
  title: string;
  stepCount: number;
  /** How many stages the pathway has, when the screen knows. */
  stageCount?: number;
}) {
  const steps = stepCount === 0 ? "No steps yet" : `${stepCount} ${stepCount === 1 ? "step" : "steps"}`;
  const stages =
    stageCount === undefined ? null : `${stageCount} ${stageCount === 1 ? "stage" : "stages"}`;
  return (
    <header className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-line bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_45%,#fdeae6_100%)] p-8 sm:flex-row sm:items-center sm:px-14 sm:py-10">
      {/* The file is drawn at twice its size, so it is shown at half the width. */}
      <img
        src={heroArt}
        alt=""
        aria-hidden
        draggable={false}
        style={{ width: 421 }}
        className="pointer-events-none absolute right-0 bottom-0 hidden h-auto max-w-none select-none sm:block"
      />

      <div className="relative max-w-xl">
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base text-ink">
          {stages ? `${stages}, ${steps}` : steps}. You mark each step complete yourself.
        </p>
      </div>

      <dl
        role="group"
        aria-label="Roadmap size"
        className="relative flex min-w-40 items-stretch justify-center gap-6 rounded-2xl bg-surface px-8 py-5 shadow-card"
      >
        {stageCount !== undefined && (
          <>
            <div className="flex flex-col items-center gap-1">
              <dt className="text-sm text-ink-muted">Stages</dt>
              <dd className="font-display text-2xl font-medium text-ink">{stageCount}</dd>
            </div>
            <div aria-hidden className="w-px bg-line" />
          </>
        )}
        <div className="flex flex-col items-center gap-1">
          <dt className="text-sm text-ink-muted">Steps</dt>
          <dd className="font-display text-2xl font-medium text-ink">{stepCount}</dd>
        </div>
      </dl>
    </header>
  );
}
