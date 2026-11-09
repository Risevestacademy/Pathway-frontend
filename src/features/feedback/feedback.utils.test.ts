import { describe, expect, it } from "vitest";
import { FEEDBACK_DESCRIPTION_MAX } from "../../lib/api/feedback.api";
import { buildDescription, detailsLimit, topicCategory } from "./feedback.utils";

describe("buildDescription", () => {
  it("trims the learner's message and adds the context note", () => {
    expect(buildDescription("  Uses React 16  ", "Step 2: Learn React")).toBe(
      "Uses React 16 (Step 2: Learn React)",
    );
  });

  it("sends the message alone without a context note", () => {
    expect(buildDescription("Pay figures look wrong")).toBe("Pay figures look wrong");
  });
});

describe("detailsLimit", () => {
  it("leaves room for the context note within the API limit", () => {
    const note = "Step 2: Learn React";
    const longest = buildDescription("x".repeat(detailsLimit(note)), note);

    expect(longest).toHaveLength(FEEDBACK_DESCRIPTION_MAX);
  });

  it("allows the full limit without a context note", () => {
    expect(detailsLimit()).toBe(FEEDBACK_DESCRIPTION_MAX);
  });
});

describe("topicCategory", () => {
  it("maps each topic to its API category", () => {
    expect(topicCategory("content")).toBe("INCORRECT_CONTENT");
    expect(topicCategory("resource")).toBe("BROKEN_LINK");
    expect(topicCategory("broken")).toBe("USABILITY");
    expect(topicCategory("other")).toBe("OTHER");
  });

  it("files a report with no topic as OTHER", () => {
    expect(topicCategory(null)).toBe("OTHER");
  });
});
