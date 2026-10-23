import { describe, expect, it } from "vitest";
import { scrollProgress } from "./useScrollProgress";

describe("scrollProgress", () => {
  const vh = 1000;

  it("is 0 while the element top is below the start line", () => {
    expect(scrollProgress(900, vh, 0.85, 0.35)).toBe(0);
    expect(scrollProgress(850, vh, 0.85, 0.35)).toBe(0);
  });

  it("is 1 once the element top passes the end line", () => {
    expect(scrollProgress(350, vh, 0.85, 0.35)).toBe(1);
    expect(scrollProgress(-200, vh, 0.85, 0.35)).toBe(1);
  });

  it("interpolates linearly in between", () => {
    expect(scrollProgress(600, vh, 0.85, 0.35)).toBeCloseTo(0.5);
    expect(scrollProgress(725, vh, 0.85, 0.35)).toBeCloseTo(0.25);
  });

  it("does not divide by zero when start equals end", () => {
    expect(scrollProgress(500, vh, 0.5, 0.5)).toBe(1);
  });
});
