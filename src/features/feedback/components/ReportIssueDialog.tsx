import { useId, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { selectIsAuthenticated, useAuthStore } from "../../../lib/stores/authStore";
import type { FeedbackSection } from "../../../lib/api/feedback.api";
import { validateEmail } from "../../../lib/validation/auth.schema";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import { buildDescription, detailsLimit, type ReportReason } from "../feedback.utils";
import { useSubmitFeedback } from "../hooks/useSubmitFeedback";

// Show the counter once the learner is close to the limit.
const COUNTER_THRESHOLD = 200;

const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-placeholder focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15";

/** The API rejects a report without a careerId unless it is GENERAL, so the types do too. */
export type ReportTarget =
  | { section: "GENERAL"; careerId?: undefined }
  | { section: Exclude<FeedbackSection, "GENERAL">; careerId: string };

export type ReportIssueDialogProps = ReportTarget & {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  reasons: ReportReason[];
  title?: string;
  /** What is being reported, shown under the title. */
  subject?: string;
  /** Added to the description so reviewers know exactly where it came from. */
  contextNote?: string;
  /** Reassurance shown above the buttons. */
  note?: string;
};

export function ReportIssueDialog({
  open,
  onClose,
  onSent,
  section,
  reasons,
  careerId,
  title = "Report an issue",
  subject,
  contextNote,
  note,
}: ReportIssueDialogProps) {
  const id = useId();
  const signedIn = useAuthStore(selectIsAuthenticated);
  const accountEmail = useAuthStore((s) => s.user?.email);
  const feedback = useSubmitFeedback();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const limit = detailsLimit(contextNote);

  const { reset: resetFeedback } = feedback;
  // Clears the last error too, so it doesn't show again when the dialog reopens.
  const close = () => {
    setReason(null);
    setDetails("");
    setEmail("");
    setEmailError(null);
    resetFeedback();
    onClose();
  };

  const submit = () => {
    if (!reason) return;
    const typedEmail = email.trim();
    if (!signedIn && typedEmail) {
      const error = validateEmail(typedEmail);
      setEmailError(error);
      if (error) return;
    }

    feedback.mutate(
      {
        category: reason.category,
        description: buildDescription(reason.label, details, contextNote),
        section,
        careerId,
        userEmail: signedIn ? accountEmail : typedEmail || undefined,
      },
      {
        onSuccess: () => {
          close();
          onSent();
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title={title} description={subject} compact className="max-w-xl">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <fieldset className="grid gap-2">
          <legend className="sr-only">What is the problem?</legend>
          {reasons.map((option) => (
            <label
              key={option.label}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-line px-4 py-4 text-base text-ink hover:border-brand-300 has-checked:border-brand-500"
            >
              <input
                type="radio"
                name={`${id}-reason`}
                value={option.label}
                checked={reason?.label === option.label}
                onChange={() => setReason(option)}
                className="size-4 accent-brand-600"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-details`} className="sr-only">
            Details
          </label>
          <textarea
            id={`${id}-details`}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Add details (optional)"
            maxLength={limit}
            rows={4}
            className={`${fieldClass} resize-y`}
          />
          {details.length > limit - COUNTER_THRESHOLD && (
            <p className="text-right text-sm text-ink-muted">
              {details.length}/{limit}
            </p>
          )}
        </div>

        {!signedIn && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-email`} className="text-sm font-medium text-ink">
              Email (optional)
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
              }}
              placeholder="you@example.com"
              aria-invalid={emailError ? true : undefined}
              aria-describedby={`${id}-email-hint`}
              className={fieldClass}
            />
            <p id={`${id}-email-hint`} className={emailError ? "text-sm text-danger-700" : "text-sm text-ink-muted"}>
              {emailError ?? "Only if you’d like us to get back to you."}
            </p>
          </div>
        )}

        {note && <p className="text-sm text-ink-muted">{note}</p>}

        {feedback.isError && (
          <p role="alert" className="text-sm text-danger-700">
            {feedback.error.message}
          </p>
        )}

        <div className="flex gap-3">
          <SkillButton isPrimary={false} className="flex-1" onClick={close}>
            Cancel
          </SkillButton>
          <SkillButton type="submit" className="flex-1" disabled={!reason || feedback.isPending}>
            {feedback.isPending ? "Sending" : "Send report"}
          </SkillButton>
        </div>
      </form>
    </Modal>
  );
}
