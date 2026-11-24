import { describe, expect, it } from "vitest";
import { earlierNote } from "./resultCopy";
import { buildAssessment } from "./skillCheck.fixtures";

const assessment = buildAssessment();

describe("earlierNote", () => {
  it("has nothing to say when starting at step 1", () => {
    expect(earlierNote(assessment, 1)).toBeNull();
  });

  it("says one earlier step stays open", () => {
    expect(earlierNote(assessment, 2)).toBe(
      "Step 1 stays open and marked incomplete. Nothing is marked done for you.",
    );
  });

  it("says several earlier steps stay open", () => {
    expect(earlierNote(assessment, 4)).toBe(
      "Steps 1 to 3 stay open and marked incomplete. Nothing is marked done for you.",
    );
  });
});
