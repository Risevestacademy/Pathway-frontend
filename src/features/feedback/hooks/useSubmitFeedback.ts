import { useMutation } from "@tanstack/react-query";
import { submitFeedback, type SubmitFeedbackInput } from "../../../lib/api/feedback.api";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (input: Omit<SubmitFeedbackInput, "platform">) =>
      submitFeedback({ ...input, platform: "WEB" }),
  });
}
