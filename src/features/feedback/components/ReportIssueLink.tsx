import clsx from "clsx";
import { Flag } from "lucide-react";
import { useState } from "react";
import { ReportIssueDialog, type ReportTarget } from "./ReportIssueDialog";

type ReportIssueLinkProps = ReportTarget & {
  /** Shown in the dialog as "About: …" and sent with the report. */
  about: string;
  /** Finishes the link's accessible name, "Report a problem with …", since a page can have several. */
  subject: string;
  className?: string;
};

/** "Report a problem" text link that opens the feedback dialog about this part of the page. */
export function ReportIssueLink({ about, subject, className, ...target }: ReportIssueLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "focus-ring inline-flex w-fit items-center gap-2 rounded-sm text-base text-grey-600 underline underline-offset-2 hover:text-ink",
          className,
        )}
      >
        <Flag className="size-5 shrink-0" aria-hidden />
        <span>
          Report a problem<span className="sr-only"> with {subject}</span>
        </span>
      </button>
      <ReportIssueDialog {...target} about={about} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
