import { describe, expect, it } from "vitest";
import { countUnread, formatRelativeTime } from "./notifications.utils";

// Wednesday 18 November 2026, midday.
const NOW = new Date(2026, 10, 18, 12, 0, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

describe("formatRelativeTime", () => {
  it.each([
    [0, "Just now"],
    [30 * 1000, "Just now"],
    [MINUTE, "1 minute ago"],
    [40 * MINUTE, "40 minutes ago"],
    [HOUR, "1 hour ago"],
    [2 * HOUR, "2 hours ago"],
    [11 * HOUR, "11 hours ago"],
  ])("says how long ago for %i ms", (elapsed, label) => {
    expect(formatRelativeTime(ago(elapsed), NOW)).toBe(label);
  });

  it("says Yesterday for the previous calendar day, once it is a day or more back", () => {
    expect(formatRelativeTime(new Date(2026, 10, 17, 9, 0).toISOString(), NOW)).toBe("Yesterday");
  });

  it("gives the day and month for anything older this year", () => {
    expect(formatRelativeTime(new Date(2026, 9, 28, 9, 0).toISOString(), NOW)).toBe("28 Oct");
  });

  it("adds the year for an earlier year", () => {
    expect(formatRelativeTime(new Date(2025, 9, 28, 9, 0).toISOString(), NOW)).toBe("28 Oct 2025");
  });

  it("treats a time slightly in the future as just now", () => {
    expect(formatRelativeTime(ago(-5 * MINUTE), NOW)).toBe("Just now");
  });

  it("is empty for something that isn't a date", () => {
    expect(formatRelativeTime("string", NOW)).toBe("");
  });
});

describe("countUnread", () => {
  it("counts the notifications not yet read", () => {
    const item = (read: boolean) => ({
      id: String(Math.random()),
      kind: "STREAK" as const,
      title: "t",
      body: "b",
      createdAt: NOW.toISOString(),
      read,
    });

    expect(countUnread([item(false), item(true), item(false)])).toBe(2);
    expect(countUnread([])).toBe(0);
  });
});
