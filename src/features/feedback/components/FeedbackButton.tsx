import clsx from "clsx";
import { Chat3Regular, CheckCircleRegular } from "@mingcute/react/core-regular";
import { useEffect, useState } from "react";
import { REPORT_REASONS } from "../feedback.utils";
import { ReportIssueDialog } from "./ReportIssueDialog";

// The nav stays on screen across pages, so the thanks only shows briefly.
const THANKS_MS = 4000;

/** Top nav button for feedback that isn't about a particular career. */
export function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), THANKS_MS);
    return () => clearTimeout(timer);
  }, [sent]);

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
        {sent ? (
          <CheckCircleRegular aria-hidden size={18} className="shrink-0 text-success-600" />
        ) : (
          <Chat3Regular aria-hidden size={18} className="shrink-0 text-grey-500" />
        )}
        <span className="sr-only sm:not-sr-only">{sent ? "Thanks!" : "Feedback"}</span>
      </button>
      {/* Always mounted: screen readers only announce changes to a live region that already exists. */}
      <span role="status" className="sr-only">
        {sent ? "Thanks, your feedback was sent." : ""}
      </span>
      <ReportIssueDialog
        open={open}
        onClose={() => setOpen(false)}
        onSent={() => setSent(true)}
        section="GENERAL"
        reasons={REPORT_REASONS.GENERAL}
        title="Send feedback"
        subject="Tell us what’s working, what isn’t, or what you’d like to see."
      />
    </>
  );
}
