import clsx from "clsx";
import { Chat3Regular } from "@mingcute/react/core-regular";
import { useState } from "react";
import { ReportIssueDialog } from "./ReportIssueDialog";

/** Top nav button for general feedback when signed out. Signed-in learners use the account menu. */
export function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "focus-ring flex h-10 items-center gap-1.5 rounded-lg border border-b-4 border-grey-100 bg-surface px-3 text-base leading-5 font-medium whitespace-nowrap text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none",
          className,
        )}
      >
        <Chat3Regular aria-hidden size={18} className="shrink-0 text-grey-500" />
        <span className="sr-only sm:not-sr-only">Feedback</span>
      </button>
      <ReportIssueDialog open={open} onClose={() => setOpen(false)} section="GENERAL" />
    </>
  );
}
