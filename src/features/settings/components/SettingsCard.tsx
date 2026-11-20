import { cn } from "cn";
import { type HTMLAttributes } from "react";

export default function SettingsCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("border bg-surface border-line rounded-xl p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
