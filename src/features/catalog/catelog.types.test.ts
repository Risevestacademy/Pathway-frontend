import { describe, expect, it } from "vitest";
import { toApiLevel } from "./catelog.types";

describe("toApiLevel", () => {
  it("maps each session level to the API enum", () => {
    expect(toApiLevel("university-student")).toBe("STUDENT");
    expect(toApiLevel("recent-graduate")).toBe("RECENT_GRAD");
    expect(toApiLevel("early-career")).toBe("EARLY_CAREER");
  });

  it("returns undefined when no level is chosen", () => {
    expect(toApiLevel(null)).toBeUndefined();
  });
});
