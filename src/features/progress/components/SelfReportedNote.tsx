import clsx from "clsx";
import { Info } from "lucide-react";

export default function SelfReportedNote({ className }: { className?: string }) {
  return (
    <p className={clsx("flex items-start gap-1.5 text-xs text-ink-muted", className)}>
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        Self-reported: this counts the steps you’ve marked done. It isn’t a
        test result or a certificate.
      </span>
    </p>
  );
}
