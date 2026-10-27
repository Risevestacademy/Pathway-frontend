import { describe, expect, it } from "vitest";
import { nextFeedbackStatuses } from "./adminFeedback.types";

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
