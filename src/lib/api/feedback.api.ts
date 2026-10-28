import { isAxiosError } from "axios";
import { api } from "./axios";

export type FeedbackCategory = "INCORRECT_CONTENT" | "BROKEN_LINK" | "USABILITY" | "OTHER";

/** Where the report came from. Every section except GENERAL needs a careerId. */
export type FeedbackSection = "CAREER_DETAILS" | "OUTLOOK" | "PATHWAY" | "RESOURCES" | "GENERAL";

/** POST /feedback caps the description at this many characters. */
export const FEEDBACK_DESCRIPTION_MAX = 2000;

export interface SubmitFeedbackInput {
  category: FeedbackCategory;
  description: string;
  section: FeedbackSection;
  careerId?: string;
  /** Optional: a reply address. The backend stores it but never logs it. */
  userEmail?: string;
  platform: "WEB";
}

function getFeedbackError(error: unknown): Error {
  if (!isAxiosError(error)) {
    return new Error("We couldn’t send your report. Please try again.");
  }

  switch (error.response?.status) {
    case 400:
      return new Error("We couldn’t send your report. Check the details and try again.");
    case 429:
      return new Error("You’ve sent a few reports in a short time. Try again in a minute.");
    default:
      return new Error(
        error.response
          ? "We couldn’t send your report. Please try again."
          : "We couldn’t reach the server. Check your connection and try again.",
      );
  }
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  try {
    await api.post("/feedback", input);
  } catch (error) {
    throw getFeedbackError(error);
  }
}
