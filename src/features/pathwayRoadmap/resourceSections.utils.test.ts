import { describe, expect, it } from "vitest";
import { buildResourceSections } from "./resourceSections.utils";
import type { ResourceGroup } from "./resourceGroups.utils";

const group = (stepId: string, number: number, title: string): ResourceGroup => ({
  stepId,
  number,
  title,
  resources: [],
  paid: [],
});

const groups = [
  group("s1", 1, "What design is for"),
  group("s2", 2, "How people think"),
  group("s3", 3, "Prototype"),
  group("s4", 4, "Portfolio"),
];

describe("buildResourceSections", () => {
  const stages = [
    { id: "g1", title: "Foundations", stepIds: ["s1", "s2"] },
    { id: "g2", title: "Core skills", stepIds: ["s3"] },
  ];

  it("makes a section of each stage, holding its steps in the pathway's order", () => {
    const sections = buildResourceSections(groups.slice(0, 3), stages);

    expect(sections.map((s) => [s.id, s.title, s.stageId])).toEqual([
      ["g1", "Foundations", "g1"],
      ["g2", "Core skills", "g2"],
    ]);
    expect(sections[0].groups.map((g) => g.stepId)).toEqual(["s1", "s2"]);
    expect(sections[1].groups.map((g) => g.stepId)).toEqual(["s3"]);
  });

  it("follows the order of the stages given, not of the steps", () => {
    const sections = buildResourceSections(groups.slice(0, 3), [...stages].reverse());

    expect(sections.map((s) => s.id)).toEqual(["g2", "g1"]);
  });

  it("leaves out a stage none of whose steps are shown", () => {
    const sections = buildResourceSections(groups.slice(0, 2), stages);

    expect(sections.map((s) => s.id)).toEqual(["g1"]);
  });

  it("gives a step that is in no stage a section of its own, after the stages", () => {
    const sections = buildResourceSections(groups, stages);

    expect(sections.map((s) => [s.id, s.title, s.stageId])).toEqual([
      ["g1", "Foundations", "g1"],
      ["g2", "Core skills", "g2"],
      ["step:s4", "Step 4 · Portfolio", null],
    ]);
    expect(sections[2].groups.map((g) => g.stepId)).toEqual(["s4"]);
  });

  it("gives every step its own section when the stages aren't known", () => {
    const sections = buildResourceSections(groups.slice(0, 2), []);

    expect(sections.map((s) => [s.id, s.title, s.stageId])).toEqual([
      ["step:s1", "Step 1 · What design is for", null],
      ["step:s2", "Step 2 · How people think", null],
    ]);
  });

  it("has no sections when there are no steps", () => {
    expect(buildResourceSections([], stages)).toEqual([]);
  });
});
