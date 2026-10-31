import { describe, expect, it } from "vitest";
import type { SavedPathway } from "../progress/progress.types";
import {
  clampPercentage,
  continueLabel,
  featuredPathway,
  firstNameOf,
  greetingFor,
  lastTwelveMonths,
  skillTags,
  stepsLabel,
  weekdayIndex,
} from "./dashboard.utils";

const pathway = (id: string, over: Partial<SavedPathway> = {}): SavedPathway => ({
  career: { id, slug: id, title: id, retired: false },
  isActive: false,
  progress: { completed: 0, total: 10, percentage: 0 },
  ...over,
});

describe("greetingFor", () => {
  it("follows the time of day", () => {
    expect(greetingFor(new Date(2026, 9, 30, 6))).toBe("Good Morning");
    expect(greetingFor(new Date(2026, 9, 30, 11, 59))).toBe("Good Morning");
    expect(greetingFor(new Date(2026, 9, 30, 12))).toBe("Good Afternoon");
    expect(greetingFor(new Date(2026, 9, 30, 17, 59))).toBe("Good Afternoon");
    expect(greetingFor(new Date(2026, 9, 30, 18))).toBe("Good Evening");
    expect(greetingFor(new Date(2026, 9, 30, 2))).toBe("Good Morning");
  });
});

describe("firstNameOf", () => {
  it("uses the first word of their name", () => {
    expect(firstNameOf({ fullName: "Maya Okafor", email: "x@y.z" })).toBe("Maya");
    expect(firstNameOf({ name: "  Ada   Lovelace " })).toBe("Ada");
  });

  it("falls back to the start of their email", () => {
    expect(firstNameOf({ email: "ada.lovelace@example.com" })).toBe("Ada");
    expect(firstNameOf({ email: "maya@example.com" })).toBe("Maya");
  });

  it("is null when there is nothing to go on", () => {
    expect(firstNameOf(null)).toBeNull();
    expect(firstNameOf({})).toBeNull();
    expect(firstNameOf({ fullName: "   ", email: "" })).toBeNull();
  });
});

describe("featuredPathway", () => {
  it("prefers the active pathway", () => {
    const list = [pathway("a"), pathway("b", { isActive: true })];

    expect(featuredPathway(list)?.career.id).toBe("b");
  });

  it("otherwise takes the first one that isn't retired", () => {
    const list = [
      pathway("old", { career: { id: "old", slug: "old", title: "old", retired: true } }),
      pathway("b"),
    ];

    expect(featuredPathway(list)?.career.id).toBe("b");
  });

  it("otherwise takes the first one, and is undefined with none", () => {
    const retired = pathway("old", { career: { id: "old", slug: "old", title: "old", retired: true } });

    expect(featuredPathway([retired])?.career.id).toBe("old");
    expect(featuredPathway([])).toBeUndefined();
  });
});

describe("clampPercentage", () => {
  it("rounds and keeps it between 0 and 100", () => {
    expect(clampPercentage(37.6)).toBe(38);
    expect(clampPercentage(-5)).toBe(0);
    expect(clampPercentage(140)).toBe(100);
    expect(clampPercentage(Number.NaN)).toBe(0);
  });
});

describe("continueLabel and stepsLabel", () => {
  it("says what to do next from how far along they are", () => {
    expect(continueLabel({ completed: 0, total: 8, percentage: 0 })).toBe("Start your roadmap");
    expect(continueLabel({ completed: 3, total: 8, percentage: 38 })).toBe("Continue your roadmap");
    expect(continueLabel({ completed: 8, total: 8, percentage: 100 })).toBe("Review your roadmap");
  });

  it("describes the steps done, or that there are none", () => {
    expect(stepsLabel({ completed: 3, total: 8, percentage: 38 })).toBe("3 of 8 steps done");
    expect(stepsLabel({ completed: 0, total: 0, percentage: 0 })).toBe("No steps yet");
  });
});

describe("weekdayIndex", () => {
  it("counts from Monday", () => {
    expect(weekdayIndex(new Date(2026, 9, 26))).toBe(0); // Monday
    expect(weekdayIndex(new Date(2026, 9, 29))).toBe(3); // Thursday
    expect(weekdayIndex(new Date(2026, 9, 25))).toBe(6); // Sunday
  });
});

describe("lastTwelveMonths", () => {
  it("covers the last twelve months, ending with this one", () => {
    const months = lastTwelveMonths(new Date(2026, 9, 30));

    expect(months).toHaveLength(12);
    expect(months[0]).toBe("Nov");
    expect(months[11]).toBe("Oct");
  });

  it("wraps across the year", () => {
    expect(lastTwelveMonths(new Date(2026, 0, 15))).toEqual([
      "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan",
    ]);
  });
});

describe("skillTags", () => {
  it("joins skills into a tag line", () => {
    expect(skillTags([{ name: "HTML" }, { name: "css" }, { name: "Layouts" }])).toBe(
      "HTML • CSS • LAYOUTS",
    );
    expect(skillTags([])).toBe("");
  });
});
