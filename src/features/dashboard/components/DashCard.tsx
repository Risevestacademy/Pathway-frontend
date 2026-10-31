import clsx from "clsx";
import { useId, type ReactNode } from "react";

/** A dashboard card: a quiet title, then the content in an inner panel. */
export function DashCard({
  title,
  children,
  className,
  innerClassName,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={clsx("flex flex-col rounded-2xl border border-line p-2", className)}
    >
      <h2 id={headingId} className="px-3 pt-2 pb-3 text-base font-medium text-ink-muted">
        {title}
      </h2>
      <div className={clsx("flex-1 rounded-xl", innerClassName)}>{children}</div>
    </section>
  );
}
