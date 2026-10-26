import { describe, expect, it } from "vitest";
import {
  createRating,
  getRatingTrend,
  getRatingsForSkill,
} from "./rating.utils";
import type { SkillRating } from "./skillCheck.types";

const rating = (
  value: SkillRating["value"],
  ratedAt: string,
  scaleVersion = 1,
  skillId = "html",
  careerId = "frontend-developer",
): SkillRating => ({ careerId, skillId, value, scaleVersion, ratedAt });

describe("getRatingTrend", () => {
  it("returns none when the skill has never been rated", () => {
    expect(getRatingTrend([])).toEqual({ kind: "none" });
  });

  it("treats the first rating as a baseline, not a change", () => {
    expect(getRatingTrend([rating(3, "2026-10-01")])).toEqual({
      kind: "baseline",
      value: 3,
    });
  });

  it("treats a first rating of 0 as a real baseline", () => {
    expect(getRatingTrend([rating(0, "2026-10-01")])).toEqual({
      kind: "baseline",
      value: 0,
    });
  });

  it("shows a change between two ratings on the same scale", () => {
    expect(
      getRatingTrend([rating(2, "2026-10-01"), rating(4, "2026-10-08")]),
    ).toEqual({ kind: "change", from: 2, to: 4, delta: 2 });
  });

  it("shows a drop as a negative change", () => {
    expect(
      getRatingTrend([rating(4, "2026-10-01"), rating(3, "2026-10-08")]),
    ).toMatchObject({ kind: "change", delta: -1 });
  });

  it("compares the latest rating with the one before it", () => {
    expect(
      getRatingTrend([
        rating(1, "2026-10-01"),
        rating(2, "2026-10-08"),
        rating(5, "2026-10-15"),
      ]),
    ).toEqual({ kind: "change", from: 2, to: 5, delta: 3 });
  });

  it("does not compare ratings from different scales", () => {
    expect(
      getRatingTrend([rating(2, "2026-10-01", 1), rating(4, "2026-10-08", 2)]),
    ).toEqual({ kind: "baseline", value: 4 });
  });

  it("skips not sure answers when working out a change", () => {
    expect(
      getRatingTrend([
        rating(2, "2026-10-01"),
        rating("NOT_SURE", "2026-10-08"),
        rating(4, "2026-10-15"),
      ]),
    ).toEqual({ kind: "change", from: 2, to: 4, delta: 2 });
  });

  it("falls back to not enough ratings when every answer is not sure", () => {
    expect(
      getRatingTrend([
        rating("NOT_SURE", "2026-10-01"),
        rating("NOT_SURE", "2026-10-08"),
      ]),
    ).toEqual({ kind: "not-enough" });
  });

  it("does not treat not sure as zero", () => {
    expect(
      getRatingTrend([rating(3, "2026-10-01"), rating("NOT_SURE", "2026-10-08")]),
    ).toEqual({ kind: "baseline", value: 3 });
  });
});

describe("getRatingsForSkill", () => {
  const all = [
    rating(3, "2026-10-08"),
    rating(1, "2026-10-01"),
    rating(2, "2026-10-01", 1, "css"),
    rating(2, "2026-10-01", 1, "html", "backend-developer"),
  ];

  it("returns only ratings for that career and skill, oldest first", () => {
    expect(
      getRatingsForSkill(all, "frontend-developer", "html").map((r) => r.value),
    ).toEqual([1, 3]);
  });
});

describe("createRating", () => {
  it("stamps the current scale version and time", () => {
    expect(
      createRating("frontend-developer", "html", 3, new Date("2026-10-19")),
    ).toEqual({
      careerId: "frontend-developer",
      skillId: "html",
      value: 3,
      scaleVersion: 1,
      ratedAt: "2026-10-19T00:00:00.000Z",
    });
  });
});
