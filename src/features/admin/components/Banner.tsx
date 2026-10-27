import clsx from "clsx";
import { Check, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "success" | "danger" | "info" | "warning";

const TONE_STYLES: Record<Tone, { box: string; icon: string }> = {
  success: { box: "bg-success-50", icon: "bg-success-600" },
  danger: { box: "bg-danger-50", icon: "bg-danger-600" },
  info: { box: "bg-info-50", icon: "bg-info-700" },
  warning: { box: "bg-warning-50", icon: "bg-warning-700" },
};

export function Banner({
  tone,
  title,
  children,
  actions,
}: {
  tone: Tone;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const Icon = tone === "success" ? Check : CircleAlert;
  const styles = TONE_STYLES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={clsx("flex gap-3 rounded-3xl p-4", styles.box)}
    >
      <span
        aria-hidden
        className={clsx(
          "grid size-8 shrink-0 place-items-center rounded-lg text-white",
          styles.icon,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-ink">{children}</p>
        {actions && <div className="mt-3 flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}
