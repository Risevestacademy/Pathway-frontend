import {
  FEEDBACK_DESCRIPTION_MAX,
  type FeedbackCategory,
  type FeedbackSection,
} from "../../lib/api/feedback.api";

/** The "What is this about?" choices and the API category each files under. */
export const FEEDBACK_TOPICS = [
  { value: "content", label: "A career or roadmap", category: "INCORRECT_CONTENT" },
  { value: "resource", label: "A link or resource", category: "BROKEN_LINK" },
  { value: "broken", label: "Something is not working", category: "USABILITY" },
  { value: "other", label: "Something else", category: "OTHER" },
] as const satisfies ReadonlyArray<{ value: string; label: string; category: FeedbackCategory }>;

export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number]["value"];

/** The topic a report starts on, from where it was opened. General feedback starts unchosen. */
export const DEFAULT_TOPIC: Record<FeedbackSection, FeedbackTopic | null> = {
  CAREER_DETAILS: "content",
  OUTLOOK: "content",
  PATHWAY: "content",
  RESOURCES: "resource",
  GENERAL: null,
};

/** A report with no topic chosen files as OTHER. */
export function topicCategory(topic: FeedbackTopic | null): FeedbackCategory {
  return FEEDBACK_TOPICS.find((t) => t.value === topic)?.category ?? "OTHER";
}

// The API has no field for what was on screen, so it rides along in the description.
const contextSuffix = (contextNote?: string) => (contextNote ? ` (${contextNote})` : "");

/** Room left for the learner's message once the context note is added. */
export const detailsLimit = (contextNote?: string) =>
  FEEDBACK_DESCRIPTION_MAX - contextSuffix(contextNote).length;

/** The learner's message plus the context note. */
export function buildDescription(message: string, contextNote?: string) {
  return `${message.trim()}${contextSuffix(contextNote)}`;
}
