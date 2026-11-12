import { describe, expect, it } from "vitest";
import type { PathwayResourceDto, PathwayStepDto } from "../../lib/api/pathways.api";
import type { CareerProgress } from "../progress/progress.types";
import { buildOverview } from "./overview.utils";

const resource = (id: string): PathwayResourceDto => ({
  id,
  title: `Resource ${id}`,
  description: null,
  url: "https://example.com",
  type: "COURSE",
  provider: "Acme",
  costStatus: "FREE",
  certificationCost: null,
  curationRationale: "",
  lastCheckedDate: "2026-10-01",
  skills: [],
});

const step = (id: string, order: number, over: Partial<PathwayStepDto> = {}): PathwayStepDto => ({
  id,
  title: `Step ${order}`,
  description: `About step ${order}`,
  learningObjective: `Learn step ${order}`,
  prerequisites: null,
  expectedActivity: "",
  order,
  skills: [],
  resources: [],
  ...over,
});

const pathway = (steps: PathwayStepDto[]) => ({
  id: "p1",
  careerId: "c1",
  title: "Roadmap",
  description: "",
  steps,
});

const three = pathway([step("s1", 1), step("s2", 2), step("s3", 3)]);

const untracked: CareerProgress = { kind: "untracked", activeCareerTitle: null };

const active = (
  statuses: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">,
  over: { completed?: number; total?: number; nextStepId?: string | null } = {},
): CareerProgress => ({
  kind: "active",
  progress: {
    completed: 1,
    total: 3,
    percentage: 33,
    nextStepId: "s2",
    selfReported: true,
    startStepId: null,
    ...over,
  },
  statuses,
});

describe("buildOverview: the steps", () => {
  it("lists them in order, numbered from 1, whatever order the API sent", () => {
    const view = buildOverview(
      pathway([step("s3", 3), step("s1", 1), step("s2", 2)]),
      untracked,
    );

    expect(view.steps.map((s) => [s.number, s.id])).toEqual([
      [1, "s1"],
      [2, "s2"],
      [3, "s3"],
    ]);
  });

  it("describes a step with its description, or its learning objective when that is blank", () => {
    const view = buildOverview(
      pathway([step("s1", 1), step("s2", 2, { description: "  ", learningObjective: "Use Git" })]),
      untracked,
    );

    expect(view.steps[0].description).toBe("About step 1");
    expect(view.steps[1].description).toBe("Use Git");
  });

  it("copes with a pathway that has no steps", () => {
    const view = buildOverview(pathway([]), untracked);

    expect(view).toEqual({
      steps: [],
      nextStepId: null,
      completed: 0,
      total: 0,
      started: false,
      upNext: null,
    });
  });
});

describe("buildOverview: nothing started", () => {
  it.each<[string, CareerProgress]>([
    ["not saved yet", untracked],
    ["signed out", { kind: "signed-out" }],
    ["still loading", { kind: "loading" }],
    ["failed to load", { kind: "error" }],
  ])("shows every step not started when progress is %s", (_label, progress) => {
    const view = buildOverview(three, progress);

    expect(view.steps.map((s) => s.status)).toEqual(["NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]);
    expect(view.completed).toBe(0);
    expect(view.total).toBe(3);
    expect(view.started).toBe(false);
  });

  it("makes the first step the one up next", () => {
    const view = buildOverview(
      pathway([step("s1", 1, { title: "What design is for", resources: [resource("r1")] }), step("s2", 2)]),
      untracked,
    );

    expect(view.nextStepId).toBe("s1");
    expect(view.upNext).toEqual({ id: "s1", number: 1, title: "What design is for", resourceCount: 1 });
  });
});

describe("buildOverview: an active pathway", () => {
  it("takes each step's status, and the counts, from the server", () => {
    const view = buildOverview(
      three,
      active({ s1: "COMPLETED", s2: "IN_PROGRESS" }, { completed: 1, total: 3 }),
    );

    expect(view.steps.map((s) => s.status)).toEqual(["COMPLETED", "IN_PROGRESS", "NOT_STARTED"]);
    expect(view.completed).toBe(1);
    expect(view.total).toBe(3);
    expect(view.started).toBe(true);
  });

  it("puts the step the server names up next", () => {
    const view = buildOverview(
      pathway([step("s1", 1), step("s2", 2, { resources: [resource("a"), resource("b")] }), step("s3", 3)]),
      active({ s1: "COMPLETED" }, { nextStepId: "s2" }),
    );

    expect(view.nextStepId).toBe("s2");
    expect(view.upNext).toMatchObject({ id: "s2", number: 2, resourceCount: 2 });
  });

  it("has nothing up next once every step is done", () => {
    const view = buildOverview(
      three,
      active({ s1: "COMPLETED", s2: "COMPLETED", s3: "COMPLETED" }, { completed: 3, total: 3, nextStepId: null }),
    );

    expect(view.nextStepId).toBeNull();
    expect(view.upNext).toBeNull();
    expect(view.completed).toBe(3);
  });

  it("counts a step the server has no status for as not started", () => {
    const view = buildOverview(three, active({ s1: "COMPLETED" }));

    expect(view.steps[2].status).toBe("NOT_STARTED");
  });

  it("isn't started when nothing has been marked done yet", () => {
    const view = buildOverview(three, active({}, { completed: 0, nextStepId: "s1" }));

    expect(view.started).toBe(false);
  });
});

describe("buildOverview: a saved pathway that isn't the active one", () => {
  const inactive: CareerProgress = {
    kind: "inactive",
    counts: { completed: 2, total: 5, percentage: 40 },
    activeCareerTitle: "Data Analyst",
  };

  it("uses the saved counts, since the server gives no step statuses for it", () => {
    const view = buildOverview(three, inactive);

    expect(view.completed).toBe(2);
    expect(view.total).toBe(5);
    expect(view.started).toBe(true);
    expect(view.steps.map((s) => s.status)).toEqual(["NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]);
  });

  it("puts the step after the completed ones up next, as the pathway's card does", () => {
    expect(buildOverview(three, inactive).upNext?.id).toBe("s3");
  });
});
