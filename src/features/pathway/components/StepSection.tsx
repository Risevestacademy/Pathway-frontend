import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StepSectionProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

export default function StepSection({
  icon: Icon,
  title,
  children,
}: StepSectionProps) {
  return (
    <section className="flex gap-3 rounded-lg border border-line bg-surface p-4 md:p-5">
      <span
        className="
          grid size-9 shrink-0 place-items-center
          rounded-md bg-brand-50 text-brand-700
        "
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
        <div className="mt-1 text-sm text-ink-muted">{children}</div>
      </div>
    </section>
  );
}
