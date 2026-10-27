import { describe, expect, it } from "vitest";
import {
  audienceLabel,
  careerIconKey,
  experienceLabel,
  matchesQuery,
  payBasisLabel,
  projectionGeometry,
  projectionPoints,
} from "./explore.utils";

describe("matchesQuery", () => {
  const fields = ["Frontend Engineer", "Builds the parts of web applications people use.", "React", null];

  it("matches everything when the query is empty", () => {
    expect(matchesQuery(fields, "")).toBe(true);
    expect(matchesQuery(fields, "   ")).toBe(true);
  });

  it("is case-insensitive and needs every term", () => {
    expect(matchesQuery(fields, "frontend react")).toBe(true);
    expect(matchesQuery(fields, "FRONTEND")).toBe(true);
    expect(matchesQuery(fields, "frontend python")).toBe(false);
  });
});

describe("careerIconKey", () => {
  it("resolves API titles to the track icon set", () => {
    expect(careerIconKey("Data Analyst", "data-analyst")).not.toBeNull();
    expect(careerIconKey("Frontend Engineer", "frontend-engineer")).not.toBeNull();
    expect(careerIconKey("Backend Engineer", "backend-engineer")).not.toBeNull();
    expect(careerIconKey("UI/UX Designer", "ui-ux-designer")).not.toBeNull();
  });

  it("returns null when no icon exists", () => {
    expect(careerIconKey("Lighthouse Keeper")).toBeNull();
  });
});

describe("audienceLabel", () => {
  it("uses the earliest career stage", () => {
    expect(audienceLabel(["early-career", "university-student"])).toBe("Great for university students");
    expect(audienceLabel(["early-career", "recent-graduate"])).toBe("Great for recent graduates");
    expect(audienceLabel([])).toBeNull();
  });
});

describe("labels", () => {
  it("formats pay basis and experience", () => {
    expect(payBasisLabel("gross")).toBe("Gross (before tax)");
    expect(payBasisLabel("unspecified")).toBeNull();
    expect(experienceLabel("entry-level")).toBe("Entry-level");
    expect(experienceLabel("all experience levels")).toBe("All experience levels");
    expect(experienceLabel(undefined)).toBeNull();
  });
});

describe("projection chart", () => {
  const series = [
    { label: "2023", value: 118 },
    { label: "2033 (projected)", value: 145 },
  ];

  it("reads years from the series labels", () => {
    expect(projectionPoints(series)).toEqual([
      { year: 2023, value: 118 },
      { year: 2033, value: 145 },
    ]);
    expect(projectionPoints(undefined)).toBeNull();
    expect(projectionPoints([{ label: "n/a", value: 1 }, { label: "2033", value: 2 }])).toBeNull();
  });

  it("draws a rising line across the full width with a tick per year", () => {
    const geometry = projectionGeometry(projectionPoints(series)!, 600, 200);
    expect(geometry.first.x).toBe(0);
    expect(geometry.last.x).toBe(600);
    expect(geometry.last.y).toBeLessThan(geometry.first.y);
    expect(geometry.first.y).toBeLessThan(200);
    expect(geometry.ticks).toHaveLength(11);
    expect(geometry.ticks[0]).toEqual({ year: 2023, x: 0 });
    expect(geometry.grid).toHaveLength(4);
    expect(geometry.area.endsWith("Z")).toBe(true);
  });
});
