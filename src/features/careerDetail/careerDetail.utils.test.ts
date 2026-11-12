import { describe, expect, it } from "vitest";
import { careers } from "../../test/fixtures/careers.fixture";
import { DATA, FRONTEND, detailFor } from "../../test/fixtures/careersApi.fixture";
import type { PublicCareerDetailDto } from "./career.types";
import {
  describeSource,
  formatMoney,
  getCareerInfo,
  groupByGeo,
  toCareer,
} from "./careerDetail.utils";

const publicDetail = (id: string) => detailFor(id) as unknown as PublicCareerDetailDto;

describe("toCareer", () => {
  it("maps the public detail response, taking the id from the request", () => {
    const career = toCareer(publicDetail(FRONTEND), FRONTEND);

    expect(career.id).toBe(FRONTEND);
    expect(career.title).toBe("Frontend Developer");
    expect(career.status).toBe("published");
    expect(career.tags).toEqual(["JavaScript", "Git", "CSS"]);
    expect(career.workActivities).toEqual(["Build components"]);
    expect(career.entryConsiderations).toContainEqual({
      label: "Key skills",
      detail: "JavaScript, Git, CSS",
    });
  });

  it("has a roadmap only when the career has steps", () => {
    const withSteps = toCareer(publicDetail(FRONTEND), FRONTEND);
    expect(withSteps.roadmapId).toBe(FRONTEND);
    expect(withSteps.roadmapStepCount).toBe(12);

    const withoutSteps = toCareer(publicDetail(DATA), DATA);
    expect(withoutSteps.roadmapId).toBeNull();
    expect(withoutSteps.roadmapStepCount).toBeNull();
  });

  it("reads pay, growth and demand from the projection", () => {
    const stats = toCareer(publicDetail(DATA), DATA).stats;

    expect(stats.find((s) => s.kind === "salary-median")).toMatchObject({ value: 78000, currency: "USD" });
    expect(stats.find((s) => s.kind === "employment-projection")).toMatchObject({ value: 11 });
    expect(stats.find((s) => s.kind === "demand")).toMatchObject({ value: "Moderate" });
  });

  it("lists the courses and certifications it recommends", () => {
    const dto = publicDetail(FRONTEND);
    const career = toCareer(
      {
        ...dto,
        requirements: {
          courses: [{ id: "c1", title: "The Odin Project", provider: "", url: "", costStatus: "FREE", estimatedWeeks: null, badgeImageUrl: null }],
          certifications: [{ id: "c2", title: "Backend Expert: Level 1", provider: "", url: "", costStatus: "FREE", estimatedWeeks: null, badgeImageUrl: null }],
        },
      },
      FRONTEND,
    );

    expect(career.entryConsiderations).toContainEqual({ label: "Courses", detail: "The Odin Project" });
    expect(career.entryConsiderations).toContainEqual({ label: "Certifications", detail: "Backend Expert: Level 1" });
  });
});

describe("describeSource", () => {
  it("leaves out a missing source instead of showing a stray comma", () => {
    expect(describeSource({ source: "", period: "2025" })).toBe("2025");
    expect(describeSource({ source: "BLS", period: "2024" })).toBe("BLS, 2024");
  });
});

describe("getCareerInfo", () => {
  it("returns published careers", () => {
    expect(getCareerInfo("frontend-developer", careers)?.title).toBe(
      "Frontend Developer",
    );
  });

  it("does not return retired careers", () => {
    expect(getCareerInfo("flash-developer", careers)).toBeNull();
  });
});

describe("groupByGeo", () => {
  it("keeps statistics from different geographies separate", () => {
    const career = getCareerInfo("frontend-developer", careers);
    const grouped = groupByGeo(career?.stats ?? []);

    expect([...grouped.keys()]).toEqual(["United States", "Lagos, Nigeria"]);
    expect(
      grouped
        .get("United States")
        ?.every((stat) => stat.geography === "United States"),
    ).toBe(true);
    expect(
      grouped
        .get("Lagos, Nigeria")
        ?.every((stat) => stat.geography === "Lagos, Nigeria"),
    ).toBe(true);
  });
});

describe("formatMoney", () => {
  it("formats a whole-dollar amount without decimal places", () => {
    expect(formatMoney(92750, "USD")).toBe("$92,750");
  });
});
