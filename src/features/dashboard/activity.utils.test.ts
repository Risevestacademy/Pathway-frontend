import { describe, expect, it } from "vitest";
import { ACTIVITY_WEEKS, buildMonthLabels } from "./activity.utils";

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
