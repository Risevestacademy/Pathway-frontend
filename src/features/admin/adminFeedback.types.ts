/**
 * Learner feedback from GET /admin/feedback. Only BROKEN_LINK, RESOURCES, WEB,
 * NEW and UNDER_REVIEW appear in the API docs so far; the other values are
 * assumed. Unknown values from the API fall back to a readable label.
 */
export type FeedbackStatus = "NEW" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

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
  DISMISSED: "Dismissed",
};

export const FEEDBACK_STATUS_TONE: Record<string, "info" | "warning" | "success" | "neutral"> = {
  NEW: "info",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
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
