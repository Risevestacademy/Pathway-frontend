import { type ReactNode } from "react";

export default function Section({
  n,
  title,
  children,
  className,
}: {
  n: number;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className} aria-labelledby={`sec-${n}`}>
      <h2 id={`sec-${n}`} className="mb-3 font-display text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
