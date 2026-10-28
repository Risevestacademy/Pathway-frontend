/**
 * Learner feedback from GET /admin/feedback. Categories are INCORRECT_CONTENT,
 * BROKEN_LINK, USABILITY and OTHER. Unknown values from the API fall back to a
 * readable label.
 */
export type FeedbackStatus = "NEW" | "UNDER_REVIEW" | "RESOLVED";

export interface FeedbackItem {
  id: string;
  category: string;
  section: string;
  careerId: string | null;
  description: string;
  /** Missing when the learner sent the report anonymously. */
  userEmail: string | null;
  platform: string | null;
  status: FeedbackStatus | (string & {});
  createdAt: string;
  updatedAt: string;
}

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under review",
  RESOLVED: "Resolved",
};

export const FEEDBACK_STATUS_TONE: Record<string, "info" | "warning" | "success" | "neutral"> = {
  NEW: "info",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
};

export const FEEDBACK_STATUSES = Object.keys(FEEDBACK_STATUS_LABEL) as FeedbackStatus[];

/** "BROKEN_LINK" -> "Broken link". */
export function humanize(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const feedbackStatusLabel = (status: string) =>
  FEEDBACK_STATUS_LABEL[status as FeedbackStatus] ?? humanize(status);

/** "a@b.co · Web", or "Anonymous" when no email was given. */
export const feedbackSender = (f: Pick<FeedbackItem, "userEmail" | "platform">) =>
  [f.userEmail ?? "Anonymous", f.platform && humanize(f.platform)].filter(Boolean).join(" · ");

export const isOpenFeedback = (f: FeedbackItem) =>
  f.status === "NEW" || f.status === "UNDER_REVIEW";

/**
 * Statuses a report can move to from `current`: the same one or a later one,
 * never back. An unknown status can go anywhere.
 */
export function nextFeedbackStatuses(current: string): FeedbackStatus[] {
  const index = FEEDBACK_STATUSES.indexOf(current as FeedbackStatus);
  return index === -1 ? FEEDBACK_STATUSES : FEEDBACK_STATUSES.slice(index);
}
