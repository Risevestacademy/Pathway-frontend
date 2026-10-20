import clsx from "clsx";
import type { ReactNode } from "react";

export type TagTone = "brand" | "success" | "warning" | "neutral";

const TONES: Record<TagTone, string> = {
  brand: "bg-brand-100 text-brand-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  neutral: "bg-grey-100 text-grey-600",
};

export function Tag({
  tone,
  children,
  className,
}: {
  tone: TagTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs leading-4 font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ReviewTag({ reviewed }: { reviewed: boolean }) {
  return reviewed ? (
    <Tag tone="success">Reviewed</Tag>
  ) : (
    <Tag tone="neutral">Not available yet</Tag>
  );
}
