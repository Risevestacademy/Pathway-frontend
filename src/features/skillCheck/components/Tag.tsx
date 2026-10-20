import clsx from "clsx";
import type { ReactNode } from "react";

export type TagTone = "brand" | "success" | "warning" | "neutral";

const TONES: Record<TagTone, string> = {
  brand: "bg-brand-100 text-brand-700",
  success: "bg-[#ccf4df] text-[#007739]",
  warning: "bg-[#fff1d7] text-[#8a6500]",
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
        "inline-flex w-fit items-center rounded-md px-2 py-1 text-xs leading-4 font-normal whitespace-nowrap",
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
    <Tag tone="success" className="py-0.5">
      Reviewed
    </Tag>
  ) : (
    <Tag tone="neutral" className="py-0.5">
      Not available yet
    </Tag>
  );
}
