import { describe, expect, it } from "vitest";
import {
  ACTIVITY_WEEKS,
  activityLevel,
  buildHeatmapCells,
  buildMonthLabels,
  parseIsoDate,
} from "./activity.utils";

describe("buildMonthLabels", () => {
  it("lists the last twelve months, oldest first, ending with this month", () => {
    expect(buildMonthLabels(new Date(2026, 8, 20))).toEqual([
      "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    ]);
  });

  it("rolls over the year", () => {
    const labels = buildMonthLabels(new Date(2026, 10, 13));

    expect(labels[0]).toBe("Dec");
    expect(labels[11]).toBe("Nov");
  });
});

describe("ACTIVITY_WEEKS", () => {
  it("covers a year of weeks", () => {
    expect(ACTIVITY_WEEKS).toBe(53);
  });
});

describe("activityLevel", () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 3],
    [5, 4],
    [40, 4],
  ])("puts %i activities at level %i", (count, level) => {
    expect(activityLevel(count)).toBe(level);
  });
});

describe("parseIsoDate", () => {
  it("reads a date as that calendar day, whatever the time zone", () => {
    const date = parseIsoDate("2026-11-10");

    expect([date?.getFullYear(), date?.getMonth(), date?.getDate()]).toEqual([2026, 10, 10]);
  });

  it("is null for something that isn't a date", () => {
    expect(parseIsoDate("string")).toBeNull();
  });
});

describe("buildHeatmapCells", () => {
  it("fills the whole grid with empty cells when there is no history", () => {
    const cells = buildHeatmapCells([]);

    expect(cells).toHaveLength(ACTIVITY_WEEKS * 7);
    expect(cells.every((cell) => cell.level === 0 && cell.date === null)).toBe(true);
  });

  it("starts the first day in its weekday row, Monday first", () => {
    // 2026-11-11 is a Wednesday, so two empty cells (Mon, Tue) come before it.
    const cells = buildHeatmapCells([
      { date: "2026-11-11", count: 2 },
      { date: "2026-11-12", count: 0 },
    ]);

    expect(cells.map((cell) => cell.date)).toEqual([null, null, "2026-11-11", "2026-11-12"]);
    expect(cells[2]).toEqual({ date: "2026-11-11", count: 2, level: 2 });
  });

  it("puts a Monday start in the first row", () => {
    const cells = buildHeatmapCells([{ date: "2026-11-09", count: 1 }]);

    expect(cells).toHaveLength(1);
    expect(cells[0].date).toBe("2026-11-09");
  });

  it("fits a full year of days in the grid", () => {
    const days = Array.from({ length: 365 }, (_, index) => ({
      date: new Date(2025, 10, 18 + index).toISOString().slice(0, 10),
      count: 0,
    }));

    expect(buildHeatmapCells(days).length).toBeLessThanOrEqual(ACTIVITY_WEEKS * 7);
  });
});
