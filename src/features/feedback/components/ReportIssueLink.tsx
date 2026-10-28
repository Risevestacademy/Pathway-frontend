import clsx from "clsx";
import { CheckCircle2, Flag } from "lucide-react";
import { useState } from "react";
import { ReportIssueDialog, type ReportIssueDialogProps } from "./ReportIssueDialog";

type ReportIssueLinkProps = Omit<ReportIssueDialogProps, "open" | "onClose" | "onSent"> & {
  label: string;
  sentLabel?: string;
  className?: string;
};

/** "Report an issue" text link that opens the report dialog and thanks the learner once sent. */
export function ReportIssueLink({
  label,
  sentLabel = "Thanks, we’ll review this",
  className,
  ...dialogProps
}: ReportIssueLinkProps) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "focus-ring inline-flex w-fit items-center gap-2 rounded-sm text-sm text-ink-muted hover:text-ink",
          className,
        )}
      >
        {sent ? (
          <>
            <CheckCircle2 className="size-4 text-success-600" aria-hidden />
            <span className="text-success-700">{sentLabel}</span>
          </>
        ) : (
          <span className="flex items-center gap-2 hover:underline">
            <Flag className="size-4" aria-hidden />
            {label}
          </span>
        )}
      </button>
      <ReportIssueDialog
        {...dialogProps}
        open={open}
        onClose={() => setOpen(false)}
        onSent={() => setSent(true)}
      />
    </>
  );
}
