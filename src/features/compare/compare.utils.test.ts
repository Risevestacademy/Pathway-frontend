import { describe, expect, it } from "vitest";
import type { Career } from "@/types/career.types";
import {
  commonSkills,
  demandStat,
  projectionStat,
  salaryMedians,
  selectedIds,
  splitSkills,
  stepCountLabel,
  toSlots,
  toggleSelection,
} from "./compare.utils";

describe("selectedIds", () => {
  it("drops blanks and repeats", () => {
    expect(selectedIds(undefined, undefined)).toEqual([]);
    expect(selectedIds("a", undefined)).toEqual(["a"]);
    expect(selectedIds(undefined, "b")).toEqual(["b"]);
    expect(selectedIds("a", "a")).toEqual(["a"]);
    expect(selectedIds("a", "b")).toEqual(["a", "b"]);
  });
});

describe("toggleSelection", () => {
  it("adds a career up to two", () => {
    expect(toggleSelection([], "a")).toEqual({ ids: ["a"], blocked: false });
    expect(toggleSelection(["a"], "b")).toEqual({ ids: ["a", "b"], blocked: false });
  });

  it("removes a career that is already selected, even when two are selected", () => {
    expect(toggleSelection(["a", "b"], "a")).toEqual({ ids: ["b"], blocked: false });
  });

  it("refuses a third career and keeps the selection as it was", () => {
    expect(toggleSelection(["a", "b"], "c")).toEqual({ ids: ["a", "b"], blocked: true });
  });
});

describe("toSlots", () => {
  it("fills the two URL slots in order and leaves unused ones empty", () => {
    expect(toSlots([])).toEqual({ a: undefined, b: undefined });
    expect(toSlots(["x"])).toEqual({ a: "x", b: undefined });
    expect(toSlots(["x", "y"])).toEqual({ a: "x", b: "y" });
  });
});

describe("commonSkills", () => {
  it("ignores case and keeps the first career's spelling and order", () => {
    expect(commonSkills(["HTML", "JavaScript", "Git"], ["git", "javascript", "SQL"])).toEqual([
      "JavaScript",
      "Git",
    ]);
  });

  it("is empty when nothing overlaps", () => {
    expect(commonSkills(["HTML"], ["SQL"])).toEqual([]);
    expect(commonSkills([], ["SQL"])).toEqual([]);
  });

  it("does not repeat a skill listed twice", () => {
    expect(commonSkills(["Git", "git"], ["GIT"])).toEqual(["Git"]);
  });
});

describe("splitSkills", () => {
  it("shows every skill when there are few", () => {
    expect(splitSkills(["a", "b"], 3)).toEqual({ shown: ["a", "b"], hidden: 0 });
  });

  it("counts the skills it hides", () => {
    expect(splitSkills(["a", "b", "c", "d", "e"], 3)).toEqual({ shown: ["a", "b", "c"], hidden: 2 });
  });
});

describe("stepCountLabel", () => {
  it("uses the singular for one step", () => {
    expect(stepCountLabel(1)).toBe("1 step");
    expect(stepCountLabel(10)).toBe("10 steps");
  });
});

describe("stat pickers", () => {
  const meta = { source: "BLS", period: "2024", geography: "United States", meaning: "" };
  const career = {
    stats: [
      { ...meta, id: "1", kind: "salary-median", value: 1, currency: "USD", payPeriod: "year", basis: "gross" },
      { ...meta, id: "2", kind: "salary-median", value: 2, currency: "NGN", payPeriod: "month", basis: "gross" },
      { ...meta, id: "3", kind: "employment-projection", value: 8 },
      { ...meta, id: "4", kind: "demand", value: "High" },
    ],
  } as Career;

  it("returns every median, so each region keeps its own figure", () => {
    expect(salaryMedians(career).map((stat) => stat.currency)).toEqual(["USD", "NGN"]);
  });

  it("returns the projection and the demand when present", () => {
    expect(projectionStat(career)?.value).toBe(8);
    expect(demandStat(career)?.value).toBe("High");
  });

  it("returns nothing when a career has no stats", () => {
    const empty = { stats: [] } as unknown as Career;
    expect(salaryMedians(empty)).toEqual([]);
    expect(projectionStat(empty)).toBeUndefined();
    expect(demandStat(empty)).toBeUndefined();
  });
});