import clsx from "clsx";
import type { ComponentProps } from "react";

export function HelperText({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={clsx("text-body-sm text-ink-muted", className)} {...props} />
  );
}