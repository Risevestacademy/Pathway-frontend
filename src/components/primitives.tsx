import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export function Card({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={clsx(
        "bg-surface border border-line rounded-lg shadow-card",
        className,
      )}
      {...rest}
    />
  );
}

type Tone =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "unavailable";

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        {
          neutral: "bg-surface-muted text-ink-muted",
          brand: "bg-brand-50 text-brand-700",
          accent: "bg-accent-50 text-accent-800",
          success: "bg-success-50 text-success-700",
          warning: "bg-warning-50 text-warning-700",
          danger: "bg-danger-50 text-danger-700",
          info: "bg-info-50 text-info-700",
          unavailable: "bg-unavailable-bg text-unavailable-ink",
        }[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx("animate-pulse rounded-sm bg-surface-muted", className)}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {children && <p className="mt-1 text-sm text-ink-muted">{children}</p>}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
    </div>
  );
}
