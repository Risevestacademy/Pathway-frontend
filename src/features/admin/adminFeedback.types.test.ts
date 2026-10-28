import { describe, expect, it } from "vitest";
import { feedbackSender, nextFeedbackStatuses } from "./adminFeedback.types";

describe("feedbackSender", () => {
  it("shows the email and platform", () => {
    expect(feedbackSender({ userEmail: "a@b.co", platform: "WEB" })).toBe("a@b.co · Web");
  });

  it("calls a report without an email anonymous", () => {
    expect(feedbackSender({ userEmail: null, platform: "WEB" })).toBe("Anonymous · Web");
    expect(feedbackSender({ userEmail: null, platform: null })).toBe("Anonymous");
  });
});

describe("nextFeedbackStatuses", () => {
  it("never offers an earlier status", () => {
    expect(nextFeedbackStatuses("NEW")).toEqual(["NEW", "UNDER_REVIEW", "RESOLVED"]);
    expect(nextFeedbackStatuses("UNDER_REVIEW")).toEqual(["UNDER_REVIEW", "RESOLVED"]);
    expect(nextFeedbackStatuses("RESOLVED")).toEqual(["RESOLVED"]);
  });

  it("allows any status when the current one is unknown", () => {
    expect(nextFeedbackStatuses("ARCHIVED")).toEqual(["NEW", "UNDER_REVIEW", "RESOLVED"]);
  });
});
