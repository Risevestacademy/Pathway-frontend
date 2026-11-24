import { describe, expect, it } from "vitest";
import { buildWeek, buildWeekStrip } from "./goals.utils";

describe("buildWeek", () => {
  it("runs Monday to Sunday, with no day active", () => {
    const week = buildWeek(new Date(2026, 10, 13));

    expect(week.map((day) => day.label)).toEqual(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
    expect(week.some((day) => day.active)).toBe(false);
  });

  it.each([
    [new Date(2026, 10, 9), "MON"], // Monday
    [new Date(2026, 10, 12), "THU"],
    [new Date(2026, 10, 15), "SUN"], // Sunday is getDay() 0
  ])("marks only today (%s) as today", (date, label) => {
    const today = buildWeek(date).filter((day) => day.isToday);

    expect(today.map((day) => day.label)).toEqual([label]);
  });
});

describe("buildWeekStrip", () => {
  const THURSDAY = "2026-11-12";

  it("falls back to an empty Monday-to-Sunday week when the backend sends no days", () => {
    expect(buildWeekStrip([], THURSDAY)).toEqual(buildWeek(new Date(2026, 10, 12)));
  });

  it("labels each day by its weekday, in the order the backend sends them", () => {
    const strip = buildWeekStrip(
      [
        { date: "2026-11-11", active: true },
        { date: "2026-11-12", active: false },
        { date: "2026-11-13", active: false },
      ],
      THURSDAY,
    );

    expect(strip.map((day) => day.label)).toEqual(["WED", "THU", "FRI"]);
    expect(strip.map((day) => day.active)).toEqual([true, false, false]);
  });

  it("marks only the day that is today", () => {
    const strip = buildWeekStrip(
      [
        { date: "2026-11-11", active: true },
        { date: "2026-11-12", active: true },
      ],
      THURSDAY,
    );

    expect(strip.map((day) => day.isToday)).toEqual([false, true]);
  });

  it("takes today from the backend's date, not the browser's", () => {
    // Just after midnight in Lagos the backend is still on Sunday.
    const strip = buildWeekStrip(
      [
        { date: "2026-11-15", active: true },
        { date: "2026-11-16", active: false },
      ],
      "2026-11-15",
    );

    expect(strip.map((day) => day.isToday)).toEqual([true, false]);
  });

  it("marks no day when the backend's today isn't in the strip", () => {
    const strip = buildWeekStrip([{ date: "2026-11-11", active: true }], "2026-11-20");

    expect(strip.some((day) => day.isToday)).toBe(false);
  });

  it("drops days whose date can't be read", () => {
    const strip = buildWeekStrip(
      [
        { date: "string", active: true },
        { date: "2026-11-12", active: false },
      ],
      THURSDAY,
    );

    expect(strip.map((day) => day.label)).toEqual(["THU"]);
  });
});
