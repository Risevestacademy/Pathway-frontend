import { describe, expect, it } from "vitest";
import { FEEDBACK_DESCRIPTION_MAX } from "../../lib/api/feedback.api";
import { buildDescription, detailsLimit } from "./feedback.utils";

describe("buildDescription", () => {
  it("uses the learner's details and adds the context note", () => {
    expect(buildDescription("Content is outdated", "  Uses React 16  ", "Step 2: Learn React")).toBe(
      "Uses React 16 (Step 2: Learn React)",
    );
  });

  it("falls back to the reason when no details were given", () => {
    expect(buildDescription("Pay figures look wrong", "   ")).toBe("Pay figures look wrong");
  });
});

describe("detailsLimit", () => {
  it("leaves room for the context note within the API limit", () => {
    const note = "Step 2: Learn React";
    const longest = buildDescription("", "x".repeat(detailsLimit(note)), note);

    expect(longest).toHaveLength(FEEDBACK_DESCRIPTION_MAX);
  });

  it("allows the full limit without a context note", () => {
    expect(detailsLimit()).toBe(FEEDBACK_DESCRIPTION_MAX);
  });
});
