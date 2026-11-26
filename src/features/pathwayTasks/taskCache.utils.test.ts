import { describe, expect, it } from "vitest";
import type {
  PathwayTaskDetailDto,
  PathwayTaskItemDto,
  PathwayTasksDto,
} from "../../lib/api/pathwayTasks.api";
import {
  applyChecklistToDetail,
  applyChecklistToList,
  applyCompletionToDetail,
  applyCompletionToList,
} from "./taskCache.utils";

const task = (id: string): PathwayTaskItemDto => ({
  id,
  title: `Task ${id}`,
  goal: `Goal ${id}`,
  estimatedWeeks: 1,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 1,
  checklistTotal: 3,
});

const list: PathwayTasksDto = {
  pathwayId: "p1",
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [
        { id: "s1", title: "One", order: 1, status: "NOT_STARTED", completedAt: null, tasks: [task("a"), task("b")] },
      ],
    },
  ],
};

const detail: PathwayTaskDetailDto = {
  ...task("a"),
  stepId: "s1",
  whatToMake: ["Make it"],
  hints: [],
  checklist: [
    { id: "i1", text: "First", isChecked: true, checkedAt: "2026-11-20T10:00:00.000Z" },
    { id: "i2", text: "Second", isChecked: false, checkedAt: null },
  ],
  helpfulLinks: [],
};

const completion = (taskId: string, completed: boolean) => ({
  taskId,
  completed,
  completedAt: completed ? "2026-11-23T15:00:00.000Z" : null,
  xpAwarded: 10,
  checklistChecked: 2,
  checklistTotal: 3,
});

const checklist = (itemId: string, checked: boolean) => ({
  itemId,
  taskId: "a",
  checked,
  checkedAt: checked ? "2026-11-23T15:00:00.000Z" : null,
  checklistChecked: 2,
  checklistTotal: 2,
});

const taskIn = (data: PathwayTasksDto, id: string) =>
  data.stages[0].steps[0].tasks.find((t) => t.id === id) as PathwayTaskItemDto;

describe("applyCompletionToList", () => {
  it("marks the task done, with when and its checklist counts", () => {
    const next = applyCompletionToList(list, completion("a", true));

    expect(taskIn(next, "a")).toMatchObject({
      isCompleted: true,
      completedAt: "2026-11-23T15:00:00.000Z",
      checklistChecked: 2,
      checklistTotal: 3,
    });
  });

  it("reopens a task", () => {
    const done = applyCompletionToList(list, completion("a", true));

    expect(taskIn(applyCompletionToList(done, completion("a", false)), "a")).toMatchObject({
      isCompleted: false,
      completedAt: null,
    });
  });

  it("leaves the other tasks alone, and doesn't change the original", () => {
    const next = applyCompletionToList(list, completion("a", true));

    expect(taskIn(next, "b")).toBe(taskIn(list, "b"));
    expect(taskIn(list, "a").isCompleted).toBe(false);
  });

  it("gives back undefined when there is nothing cached", () => {
    expect(applyCompletionToList(undefined, completion("a", true))).toBeUndefined();
  });
});

describe("applyChecklistToList", () => {
  it("updates the task's checklist counts, and nothing else about it", () => {
    const next = applyChecklistToList(list, checklist("i1", true));

    expect(taskIn(next, "a")).toMatchObject({
      checklistChecked: 2,
      checklistTotal: 2,
      isCompleted: false,
    });
    expect(taskIn(next, "b")).toBe(taskIn(list, "b"));
  });

  it("gives back undefined when there is nothing cached", () => {
    expect(applyChecklistToList(undefined, checklist("i1", true))).toBeUndefined();
  });
});

describe("applyCompletionToDetail", () => {
  it("marks the task done, with when and its checklist counts, keeping the rest", () => {
    const next = applyCompletionToDetail(detail, completion("a", true));

    expect(next).toMatchObject({
      isCompleted: true,
      completedAt: "2026-11-23T15:00:00.000Z",
      checklistChecked: 2,
      checklistTotal: 3,
      whatToMake: ["Make it"],
    });
    expect(next?.checklist).toBe(detail.checklist);
  });

  it("gives back undefined when there is nothing cached", () => {
    expect(applyCompletionToDetail(undefined, completion("a", true))).toBeUndefined();
  });
});

describe("applyChecklistToDetail", () => {
  it("checks the item, with when, and updates the counts", () => {
    const next = applyChecklistToDetail(detail, checklist("i2", true));

    expect(next?.checklist[1]).toEqual({
      id: "i2",
      text: "Second",
      isChecked: true,
      checkedAt: "2026-11-23T15:00:00.000Z",
    });
    expect(next).toMatchObject({ checklistChecked: 2, checklistTotal: 2 });
  });

  it("unchecks an item", () => {
    const next = applyChecklistToDetail(detail, checklist("i1", false));

    expect(next?.checklist[0]).toMatchObject({ isChecked: false, checkedAt: null });
  });

  it("leaves the other items alone, and doesn't change the original", () => {
    const next = applyChecklistToDetail(detail, checklist("i2", true));

    expect(next?.checklist[0]).toBe(detail.checklist[0]);
    expect(detail.checklist[1].isChecked).toBe(false);
  });

  it("gives back undefined when there is nothing cached", () => {
    expect(applyChecklistToDetail(undefined, checklist("i1", true))).toBeUndefined();
  });
});
