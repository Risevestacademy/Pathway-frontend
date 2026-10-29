import {
  FEEDBACK_DESCRIPTION_MAX,
  type FeedbackCategory,
  type FeedbackSection,
} from "../../lib/api/feedback.api";

/** A choice in the report dialog and the API category it files under. */
export interface ReportReason {
  label: string;
  category: FeedbackCategory;
}

export const REPORT_REASONS = {
  CAREER_DETAILS: [
    { label: "Information is wrong or outdated", category: "INCORRECT_CONTENT" },
    { label: "Something is hard to understand", category: "USABILITY" },
    { label: "Something else", category: "OTHER" },
  ],
  OUTLOOK: [
    { label: "Pay figures look wrong", category: "INCORRECT_CONTENT" },
    { label: "Job outlook looks wrong", category: "INCORRECT_CONTENT" },
    { label: "Something else", category: "OTHER" },
  ],
  PATHWAY: [
    { label: "Steps are missing or in the wrong order", category: "INCORRECT_CONTENT" },
    { label: "Step content is wrong or outdated", category: "INCORRECT_CONTENT" },
    { label: "Something is hard to use", category: "USABILITY" },
    { label: "Something else", category: "OTHER" },
  ],
  RESOURCES: [
    { label: "Link is broken or doesn’t load", category: "BROKEN_LINK" },
    { label: "Content is outdated", category: "INCORRECT_CONTENT" },
    { label: "Doesn’t match this step", category: "INCORRECT_CONTENT" },
    { label: "Something else", category: "OTHER" },
  ],
  GENERAL: [
    { label: "Something is broken", category: "USABILITY" },
    { label: "Something is confusing", category: "USABILITY" },
    { label: "Some content is wrong", category: "INCORRECT_CONTENT" },
    { label: "Other feedback", category: "OTHER" },
  ],
} satisfies Record<FeedbackSection, ReportReason[]>;

// The API has no field for what was on screen, so it rides along in the description.
const contextSuffix = (contextNote?: string) => (contextNote ? ` (${contextNote})` : "");

/** Room left for the learner's details once the context note is added. */
export const detailsLimit = (contextNote?: string) =>
  FEEDBACK_DESCRIPTION_MAX - contextSuffix(contextNote).length;

/** The learner's details, or the reason when they left none, plus the context note. */
export function buildDescription(reason: string, details: string, contextNote?: string) {
  return `${details.trim() || reason}${contextSuffix(contextNote)}`;
}
