import { api } from "./axios";

export type FeedbackCategory = "INCORRECT_CONTENT" | "BROKEN_LINK" | "USABILITY" | "OTHER";

export interface SubmitFeedbackInput {
  category: FeedbackCategory;
  description: string;
  section: "RESOURCES";
  careerId?: string;
  /** Missing when nobody is logged in; the backend decides whether that's allowed. */
  userEmail?: string;
  platform: "WEB";
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  await api.post("/feedback", input);
}
