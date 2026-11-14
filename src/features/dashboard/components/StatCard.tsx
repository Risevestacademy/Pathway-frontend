import clsx from "clsx";
import { useId } from "react";

const tones = {
  yellow: "border-warning-600/20 bg-warning-50",
  pink: "border-landing-pink/20 bg-landing-sticker-pink",
} as const;

/** A small number tile with line art tucked into its corner. */
export function StatCard({
  title,
  value,
  art,
  tone,
}: {
  title: string;
  value: number;
  art: string;
  tone: keyof typeof tones;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2"
    >
      <h2 id={headingId} className="px-4 pt-3 text-base font-medium text-ink-muted">
        {title}
      </h2>
      <div
        className={clsx(
          "relative flex min-h-48 items-end overflow-hidden rounded-2xl border p-4",
          tones[tone],
        )}
      >
        <img
          src={art}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute right-0 bottom-0 h-full w-auto max-w-none select-none"
        />
        <p className="relative font-display text-4xl font-medium text-ink">{value}</p>
      </div>
    </section>
  );
}
