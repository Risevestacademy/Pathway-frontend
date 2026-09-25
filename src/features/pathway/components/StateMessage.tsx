import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StateMessageProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
};

export default function StateMessage({
  icon: Icon,
  title,
  body,
  action,
}: StateMessageProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      <div
        className="
          mb-4 grid size-12 place-items-center
          rounded-pill bg-brand-50 text-brand-600
        "
      >
        <Icon className="size-6" aria-hidden />
      </div>
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
