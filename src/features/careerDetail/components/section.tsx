import { type ReactNode } from "react";

export default function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10" aria-labelledby={`sec-${n}`}>
      <h2 id={`sec-${n}`} className="mb-4 font-display text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
