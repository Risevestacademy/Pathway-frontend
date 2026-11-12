import clsx from "clsx";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import feedbackSentIcon from "../../../assets/images/feedback-sent.svg";
import { Modal } from "../../../components/ui/Modal";
import { useAuthStore } from "../../../lib/stores/authStore";
import type { FeedbackSection } from "../../../lib/api/feedback.api";
import { validateEmail } from "../../../lib/validation/auth.schema";
import { OnboardingSelect } from "../../catalog/components/OnboardingSelect";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import {
  DEFAULT_TOPIC,
  FEEDBACK_TOPICS,
  buildDescription,
  detailsLimit,
  topicCategory,
  type FeedbackTopic,
} from "../feedback.utils";
import { useSubmitFeedback } from "../hooks/useSubmitFeedback";

// Show the counter once the learner is close to the limit.
const COUNTER_THRESHOLD = 200;

const TOPIC_OPTIONS = FEEDBACK_TOPICS.map(({ value, label }) => ({ value, label }));

const fieldClass =
  "w-full rounded-lg border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-placeholder focus:outline-none focus:ring-3";

const fieldTone = (invalid: boolean) =>
  invalid
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-600/15"
    : "border-line focus:border-brand-500 focus:ring-brand-500/15";

const hintClass = (invalid: boolean) => (invalid ? "text-sm text-danger-700" : "text-sm text-ink-muted");

/** The API rejects a report without a careerId unless it is GENERAL, so the types do too. */
export type ReportTarget =
  | { section: "GENERAL"; careerId?: undefined }
  | { section: Exclude<FeedbackSection, "GENERAL">; careerId: string };

export type ReportIssueDialogProps = ReportTarget & {
  open: boolean;
  onClose: () => void;
  /** What is being reported, e.g. "Frontend Developer · Step 3, SQL basics". Shown in the form and sent with it. */
  about?: string;
};

type View = "form" | "discard" | "sent";

export function ReportIssueDialog({ open, onClose, section, careerId, about }: ReportIssueDialogProps) {
  const id = useId();
  const accountEmail = useAuthStore((s) => s.user?.email ?? "");
  const feedback = useSubmitFeedback();
  const [view, setView] = useState<View>("form");
  const [topic, setTopic] = useState<FeedbackTopic | null>(DEFAULT_TOPIC[section]);
  const [message, setMessage] = useState("");
  // null until edited, so a signed-in learner's email fills in once the session loads.
  const [email, setEmail] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<HTMLElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const refocusMessage = useRef(false);

  // General feedback has no subject, so the page it was sent from stands in.
  const contextNote = about ?? `Page: ${window.location.pathname}`;
  const limit = detailsLimit(contextNote);
  const emailValue = email ?? accountEmail;

  // The topic list portals into the dialog; anywhere else sits under its top layer.
  const formRef = useCallback((form: HTMLFormElement | null) => {
    setDialog(form?.closest("dialog") ?? null);
  }, []);

  useEffect(() => {
    if (view === "form" && refocusMessage.current) {
      refocusMessage.current = false;
      messageRef.current?.focus();
    }
  }, [view]);

  const { reset: resetFeedback } = feedback;
  const reset = () => {
    setView("form");
    setTopic(DEFAULT_TOPIC[section]);
    setMessage("");
    setEmail(null);
    setMessageError(null);
    setEmailError(null);
    resetFeedback();
  };

  const keepWriting = () => {
    refocusMessage.current = true;
    setView("form");
  };

  const discard = () => {
    reset();
    onClose();
  };

  const sendMore = () => {
    reset();
    refocusMessage.current = true;
  };

  // Cancel, Escape and the backdrop all land here, so a typed message is never lost silently.
  const requestClose = () => {
    if (feedback.isPending) return;
    if (view === "discard") return keepWriting();
    if (view === "form" && message.trim()) return setView("discard");
    discard();
  };

  const submit = () => {
    const typedEmail = emailValue.trim();
    const nextMessageError = message.trim() ? null : "Tell us what happened so we can look into it.";
    const nextEmailError = typedEmail ? validateEmail(typedEmail) : null;
    setMessageError(nextMessageError);
    setEmailError(nextEmailError);
    if (nextMessageError) return messageRef.current?.focus();
    if (nextEmailError) return emailRef.current?.focus();

    feedback.mutate(
      {
        category: topicCategory(topic),
        description: buildDescription(message, contextNote),
        section,
        careerId,
        userEmail: typedEmail || undefined,
      },
      { onSuccess: () => setView("sent") },
    );
  };

  if (view === "sent") {
    return (
      <Modal
        open={open}
        onClose={requestClose}
        title="Thanks, we got your feedback"
        description="We read every message. If you left an email, we may reply to it."
        eyebrow={<img src={feedbackSentIcon} alt="" className="mx-auto size-20" />}
        tight
        className="max-w-140 text-center"
      >
        <div className="flex justify-center gap-3">
          <SkillButton autoFocus onClick={discard}>
            Done
          </SkillButton>
          <SkillButton isPrimary={false} onClick={sendMore}>
            Send more feedback
          </SkillButton>
        </div>
      </Modal>
    );
  }

  if (view === "discard") {
    return (
      <Modal
        open={open}
        onClose={requestClose}
        title="Discard this message?"
        description="Your feedback has not been sent. If you leave now, it will be lost."
        tight
        className="max-w-140"
      >
        <div className="flex gap-3">
          <SkillButton autoFocus onClick={keepWriting}>
            Keep writing
          </SkillButton>
          <SkillButton isPrimary={false} onClick={discard}>
            Discard
          </SkillButton>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title="Send feedback"
      description="Tell us what is working and what is not. A person on the team reads every message."
      tight
      className="max-w-140"
    >
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        {feedback.isError && (
          <div role="alert" className="flex flex-col gap-1 rounded-lg border border-danger-600/30 bg-danger-50 px-4 py-3">
            <p className="text-base font-medium text-danger-700">We could not send your feedback</p>
            <p className="text-sm text-ink-muted">Your message is still here. {feedback.error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-topic`} className="text-base font-medium text-ink">
            What is this about?
          </label>
          <OnboardingSelect
            id={`${id}-topic`}
            placeholder="Choose a topic"
            value={topic ?? ""}
            onValueChange={(value) => setTopic(value as FeedbackTopic)}
            options={TOPIC_OPTIONS}
            portalContainer={dialog}
            className="w-full"
          />
        </div>

        {about && (
          <p className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-base text-ink">
            <span className="text-brand-600">About:</span> {about}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-message`} className="text-base font-medium text-ink">
            Your feedback
          </label>
          <textarea
            ref={messageRef}
            id={`${id}-message`}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setMessageError(null);
            }}
            placeholder="Describe what happened or what you would like to see"
            maxLength={limit}
            rows={4}
            aria-invalid={messageError ? true : undefined}
            aria-describedby={`${id}-message-hint`}
            className={clsx(fieldClass, fieldTone(Boolean(messageError)), "resize-y")}
          />
          <div className="flex items-start justify-between gap-3">
            <p id={`${id}-message-hint`} className={hintClass(Boolean(messageError))}>
              {messageError ??
                (about
                  ? "Do not include passwords or private details."
                  : "Do not include passwords or private details. We note the page you came from so we can find the problem.")}
            </p>
            {message.length > limit - COUNTER_THRESHOLD && (
              <p className="shrink-0 text-sm text-ink-muted">
                {message.length}/{limit}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-email`} className="text-base font-medium text-ink">
            Email for a reply (optional)
          </label>
          <input
            ref={emailRef}
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={emailValue}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(null);
            }}
            placeholder="you@example.com"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={`${id}-email-hint`}
            className={clsx(fieldClass, fieldTone(Boolean(emailError)))}
          />
          <p id={`${id}-email-hint`} className={hintClass(Boolean(emailError))}>
            {emailError ?? "Only used if you want a reply. We never show it to other users."}
          </p>
        </div>

        <div className="flex gap-3">
          <SkillButton type="submit" disabled={feedback.isPending}>
            {feedback.isPending ? "Sending…" : feedback.isError ? "Try again" : "Send feedback"}
          </SkillButton>
          <SkillButton isPrimary={false} disabled={feedback.isPending} onClick={requestClose}>
            Cancel
          </SkillButton>
        </div>
      </form>
    </Modal>
  );
}
