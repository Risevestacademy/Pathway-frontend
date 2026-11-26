import { describe, expect, it } from "vitest";
import type { PathwayTaskItemDto, PathwayTasksStageDto } from "../../lib/api/pathwayTasks.api";
import { buildTaskSections, countSteps } from "./taskSections.utils";

const task = (id: string, isCompleted = false): PathwayTaskItemDto => ({
  id,
  title: `Task ${id}`,
  goal: `Goal ${id}`,
  estimatedWeeks: 1,
  isCompleted,
  completedAt: isCompleted ? "2026-11-23T14:39:33.192Z" : null,
  checklistChecked: 0,
  checklistTotal: 2,
});

const step = (id: string, order: number, tasks: PathwayTaskItemDto[]) => ({
  id,
  title: `Step ${id}`,
  order,
  status: "NOT_STARTED" as const,
  completedAt: null,
  tasks,
});

const stage = (
  id: string,
  order: number,
  steps: ReturnType<typeof step>[],
  progress = { completed: 0, total: steps.length, percentage: 0 },
): PathwayTasksStageDto => ({
  id,
  title: `Stage ${id}`,
  order,
  progress,
  quiz: { status: "NOT_TAKEN" },
  steps,
});

// Out of order on purpose: everything is ordered by `order`, not by position.
const stages: PathwayTasksStageDto[] = [
  stage("g2", 2, [step("s3", 1, [task("c", true)])], { completed: 1, total: 1, percentage: 100 }),
  stage(
    "g1",
    1,
    [step("s2", 2, [task("b"), task("a", true)]), step("s1", 1, [])],
    { completed: 1, total: 2, percentage: 50 },
  ),
];

describe("buildTaskSections", () => {
  it("makes a section of each stage, in stage order", () => {
    const sections = buildTaskSections(stages);

    expect(sections.map((s) => [s.id, s.title])).toEqual([
      ["g1", "Stage g1"],
      ["g2", "Stage g2"],
    ]);
  });

  it("reports each stage's steps complete out of all its steps, as the backend counts them", () => {
    const sections = buildTaskSections(stages);

    // Stage g1 has 2 steps (one with no tasks), so it is 1 of 2, not a count of its tasks.
    expect(sections.map((s) => [s.done, s.total])).toEqual([
      [1, 2],
      [1, 1],
    ]);
  });

  it("counts a stage whose steps have no tasks by the backend's figure, not as empty", () => {
    const [section] = buildTaskSections([
      stage("g9", 1, [step("s9", 1, [])], { completed: 0, total: 1, percentage: 0 }),
    ]);

    expect(section).toMatchObject({ done: 0, total: 1, steps: [] });
  });

  it("numbers each step by its place in the whole pathway, including steps with no tasks", () => {
    const sections = buildTaskSections(stages);

    expect(sections[1].steps.map((s) => s.number)).toEqual([3]);
    expect(sections[0].steps.map((s) => [s.id, s.number])).toEqual([["s2", 2]]);
  });

  it("leaves out a step with no tasks, but keeps a stage with none, so it still shows in the nav", () => {
    const sections = buildTaskSections([
      ...stages,
      stage("g3", 3, [step("s4", 1, [])]),
    ]);

    expect(sections[0].steps.map((s) => s.id)).toEqual(["s2"]);
    expect(sections[2]).toMatchObject({ id: "g3", steps: [] });
  });

  it("keeps each step's tasks in the order the backend sent them", () => {
    const sections = buildTaskSections(stages);

    expect(sections[0].steps[0].tasks.map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("is empty when there are no stages", () => {
    expect(buildTaskSections([])).toEqual([]);
  });
});

describe("countSteps", () => {
  it("counts every step in every stage, with or without tasks", () => {
    expect(countSteps(stages)).toBe(3);
  });

  it("is 0 when there are no stages", () => {
    expect(countSteps([])).toBe(0);
  });
});
