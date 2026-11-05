import { describe, expect, it } from "vitest";
import type { RoadmapStepRow } from "./components/YourRoadmapCard";
import type { ResourceGroup } from "./resourceGroups.utils";
import { completedSteps, tickedResources } from "./progressView.utils";

const row = (number: number, status: RoadmapStepRow["status"]): RoadmapStepRow => ({
  id: `s${number}`,
  number,
  title: `Step ${number} title`,
  description: "",
  status,
});

describe("completedSteps", () => {
  it("is the steps marked complete, the latest step first", () => {
    const steps = [row(1, "COMPLETED"), row(2, "NOT_STARTED"), row(3, "COMPLETED"), row(4, "IN_PROGRESS")];

    expect(completedSteps(steps)).toEqual([
      { id: "s3", number: 3, title: "Step 3 title" },
      { id: "s1", number: 1, title: "Step 1 title" },
    ]);
  });

  it("is empty when none are complete", () => {
    expect(completedSteps([row(1, "NOT_STARTED"), row(2, "IN_PROGRESS")])).toEqual([]);
    expect(completedSteps([])).toEqual([]);
  });
});

const resource = (id: string) => ({
  id,
  title: `Resource ${id}`,
  provider: "Acme",
  kind: "article" as const,
  url: `https://example.com/${id}`,
  description: null,
  lastChecked: "2026-09-12",
});

const groups: ResourceGroup[] = [
  { stepId: "s1", number: 1, title: "One", resources: [resource("a"), resource("b")], paid: [resource("p")] },
  { stepId: "s3", number: 3, title: "Three", resources: [resource("c")], paid: [] },
];

describe("tickedResources", () => {
  it("is the resources they ticked, in step order, each with the step it is in", () => {
    const ticked = tickedResources(groups, (id) => ["c", "a"].includes(id));

    expect(ticked).toEqual([
      { id: "a", title: "Resource a", step: { number: 1, title: "One" } },
      { id: "c", title: "Resource c", step: { number: 3, title: "Three" } },
    ]);
  });

  it("leaves out paid resources, which have no tick", () => {
    expect(tickedResources(groups, () => true).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("is empty when nothing is ticked", () => {
    expect(tickedResources(groups, () => false)).toEqual([]);
    expect(tickedResources([], () => true)).toEqual([]);
  });
});
