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
  userEmail: string;
  platform: string;
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

export const isOpenFeedback = (f: FeedbackItem) =>
  f.status === "NEW" || f.status === "UNDER_REVIEW";
