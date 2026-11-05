import { useId } from "react";

/** Shown in place of "Up next" once every step has been marked complete. */
export function PathwayCompleteCard({ total }: { total: number }) {
  const headingId = useId();
  const steps = total === 1 ? "your only step" : `all ${total} steps`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-2 rounded-3xl border border-brand-100 bg-brand-50 p-6"
    >
      <h2 id={headingId} className="font-display text-2xl font-medium text-ink">
        You finished your pathway
      </h2>
      <p className="text-ink-muted">
        You marked {steps} complete. This is your own record, not a certificate.
      </p>
    </section>
  );
}
