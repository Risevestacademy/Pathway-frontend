import { describe, expect, it } from "vitest";
import type {
  PathwayResourceDetailDto,
  PathwayResourceItemDto,
  PathwayResourcesDto,
} from "../../lib/api/pathwayResources.api";
import { buildResourceDetail, findResourceStep, formatCheckedDate } from "./resourceDetail.utils";

describe("formatCheckedDate", () => {
  it("writes the day, short month and year", () => {
    expect(formatCheckedDate("2026-09-12")).toBe("12 Sep 2026");
    expect(formatCheckedDate("2026-01-05")).toBe("5 Jan 2026");
  });

  it("reads the date as written, whatever the time zone", () => {
    expect(formatCheckedDate("2026-12-31T23:30:00.000Z")).toBe("31 Dec 2026");
  });

  it("gives back what it was given when it isn't a date", () => {
    expect(formatCheckedDate("sometime")).toBe("sometime");
    expect(formatCheckedDate("")).toBe("");
  });
});

const item = (id: string): PathwayResourceItemDto => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  type: "COURSE",
  costStatus: "FREE",
  estimatedWeeks: 2,
  lastCheckedDate: "2026-11-23T14:36:49.328Z",
  isCompleted: false,
  completedAt: null,
});

const step = (id: string, order: number, resources: PathwayResourceItemDto[]) => ({
  id,
  title: `Step ${id}`,
  order,
  status: "NOT_STARTED" as const,
  completedAt: null,
  resources,
});

const stage = (id: string, order: number, steps: ReturnType<typeof step>[]) => ({
  id,
  title: `Stage ${id}`,
  order,
  progress: { completed: 0, total: steps.length, percentage: 0 },
  quiz: { status: "NOT_TAKEN" },
  steps,
});

// Out of order on purpose: the numbering follows stage order, then step order.
const resources: PathwayResourcesDto = {
  pathwayId: "p1",
  stages: [
    stage("g2", 2, [step("s3", 1, [item("c")])]),
    stage("g1", 1, [step("s2", 2, [item("b"), item("a")]), step("s1", 1, [item("a")])]),
  ],
  optionalPaidCourses: [item("paid")],
};

describe("findResourceStep", () => {
  it("finds the step that lists the resource, numbered by its place in the whole pathway", () => {
    expect(findResourceStep(resources, "b")).toEqual({ id: "s2", number: 2, title: "Step s2" });
    expect(findResourceStep(resources, "c")).toEqual({ id: "s3", number: 3, title: "Step s3" });
  });

  it("takes the earliest step when more than one lists it", () => {
    expect(findResourceStep(resources, "a")).toEqual({ id: "s1", number: 1, title: "Step s1" });
  });

  it("is null for a resource no step lists, such as an optional paid course", () => {
    expect(findResourceStep(resources, "paid")).toBeNull();
    expect(findResourceStep(resources, "nope")).toBeNull();
  });
});

describe("buildResourceDetail", () => {
  const read: PathwayResourceDetailDto = {
    ...item("r1"),
    title: "The TypeScript Handbook",
    provider: "Microsoft",
    description: "  The official guide.  ",
    outcomes: ["Write type-safe functions", "Use generics"],
    url: "https://www.typescriptlang.org/docs/handbook/",
    usageNote: "Read the first three chapters.",
    nextTask: { id: "t1", title: "Build a typed API client", goal: "Practise generics", estimatedWeeks: 1 },
  };
  const where = { id: "s1", number: 1, title: "Learn TypeScript Basics" };

  it("shapes the resource the way the step pages show it", () => {
    const detail = buildResourceDetail(read, where);

    expect(detail.resource).toEqual({
      id: "r1",
      title: "The TypeScript Handbook",
      provider: "Microsoft",
      kind: "course",
      url: "https://www.typescriptlang.org/docs/handbook/",
      costLabel: "Course: free",
    });
  });

  it.each([
    ["PAID", "Course: paid"],
    ["UNKNOWN", "Cost unknown"],
  ] as const)("words a %s cost as %s", (costStatus, label) => {
    expect(buildResourceDetail({ ...read, costStatus }, where).resource.costLabel).toBe(label);
  });

  it.each([
    ["COURSE", "course"],
    ["CERTIFICATION", "certification"],
    ["ARTICLE", "article"],
    ["VIDEO", "video"],
    ["BOOK", "book"],
  ] as const)("shows a %s as a %s", (type, kind) => {
    expect(buildResourceDetail({ ...read, type }, where).resource.kind).toBe(kind);
  });

  it("carries the step, what it covers, the outcomes, how to use it, and when it was checked", () => {
    const detail = buildResourceDetail(read, where);

    expect(detail).toMatchObject({
      step: where,
      description: "The official guide.",
      outcomes: ["Write type-safe functions", "Use generics"],
      usageNote: "Read the first three chapters.",
      lastChecked: "2026-11-23T14:36:49.328Z",
      estimatedWeeks: 2,
      nextTask: { id: "t1", title: "Build a typed API client", goal: "Practise generics", estimatedWeeks: 1 },
    });
  });

  it("has no description, usage note or next task when the backend gave none, or only blanks", () => {
    const detail = buildResourceDetail(
      { ...read, description: "   ", usageNote: undefined, nextTask: null },
      where,
    );

    expect(detail.description).toBeNull();
    expect(detail.usageNote).toBeNull();
    expect(detail.nextTask).toBeNull();
  });

  it("has no step when no step lists the resource", () => {
    expect(buildResourceDetail(read, null).step).toBeNull();
  });
});
