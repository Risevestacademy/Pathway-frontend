import { describe, expect, it } from "vitest";
import { isInternalPath } from "./route.util";

describe("isInternalPath", () => {
  it.each(["/progress", "/progress?tab=active#summary"])(
    "accepts %s",
    (value) => {
      expect(isInternalPath(value)).toBe(true);
    },
  );

  it("accepts an absolute URL on the current origin", () => {
    expect(isInternalPath(`${window.location.origin}/progress`)).toBe(true);
  });

  it.each([
    "//example.com/progress",
    "https://example.com/progress",
    "http://[invalid",
    "https://[invalid",
    undefined,
  ])("rejects %s", (value) => {
    expect(isInternalPath(value)).toBe(false);
  });

  it.each(["//", "///", "http://evil.com"])("rejects %s", (value) => {
    expect(isInternalPath(value)).toBe(false);
  });
});
