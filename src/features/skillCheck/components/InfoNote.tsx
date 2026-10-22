import { InformationRegular } from "@mingcute/react/core-regular";
import clsx from "clsx";
import type { ReactNode } from "react";

export function InfoNote({
  children,
  boxed = false,
}: {
  children: ReactNode;
  boxed?: boolean;
}) {
  return (
    <p
      className={clsx(
        "flex items-start gap-1 text-sm leading-5",
        boxed
          ? "rounded-lg border border-grey-100 bg-grey-50 px-4 py-3 text-grey-600"
          : "text-grey-500",
      )}
    >
      <InformationRegular aria-hidden className="size-5 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
    </p>
  );
}
