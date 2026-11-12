import { describe, expect, it } from "vitest";
import type { CareerPathwayDto, PathwayStepDto } from "../../lib/api/pathways.api";
import type { ActivePathwayDto, SavedPathwayDto } from "../../lib/api/progress.api";
import { buildPathwayCards } from "./pathwayCards.utils";

const saved = (
  id: string,
  title: string,
  isActive: boolean,
  completed = 0,
  total = 3,
): SavedPathwayDto => ({
  career: { id, slug: id, title, retired: false },
  isActive,
  progress: { completed, total, percentage: 0 },
});

const publicStep = (id: string, order: number, over: Partial<PathwayStepDto> = {}): PathwayStepDto => ({
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

const pathwayOf = (careerId: string, steps: PathwayStepDto[]): CareerPathwayDto["pathway"] => ({
  id: `p-${careerId}`,
  careerId,
  title: "Roadmap",
  description: "",
  steps,
});

const active = (careerId: string, nextStepId: string | null): ActivePathwayDto => ({
  career: { id: careerId, slug: careerId, title: "x", roleSummary: "", retired: false },
  pathway: { id: `p-${careerId}`, title: "Roadmap" },
  progress: { completed: 1, total: 3, percentage: 33, nextStepId, selfReported: true, startStepId: null },
  steps: [
    { id: "a1", order: 1, title: "HTML", skills: [], status: "COMPLETED" },
    { id: "a2", order: 2, title: "CSS", skills: [], status: "NOT_STARTED" },
    { id: "a3", order: 3, title: "JavaScript", skills: [], status: "NOT_STARTED" },
  ],
});

const frontendSteps = [
  publicStep("a1", 1, { title: "HTML", description: "Structure pages with the right elements." }),
  publicStep("a2", 2, { title: "CSS", description: "Style and lay out pages." }),
  publicStep("a3", 3, { title: "JavaScript", description: "Make pages interactive." }),
];

describe("buildPathwayCards", () => {
  it("makes no cards when nothing is saved", () => {
    expect(buildPathwayCards({ saved: [], active: undefined, pathways: {} })).toEqual([]);
  });

  it("makes a card for each saved pathway, with its career's id and title", () => {
    const cards = buildPathwayCards({
      saved: [saved("c1", "Frontend Developer", true), saved("c2", "UX Designer", false)],
      active: undefined,
      pathways: {},
    });

    expect(cards.map((c) => [c.careerId, c.title])).toEqual([
      ["c1", "Frontend Developer"],
      ["c2", "UX Designer"],
    ]);
  });

  it("marks only the active pathway, and puts it first", () => {
    const cards = buildPathwayCards({
      saved: [saved("c2", "UX Designer", false), saved("c1", "Frontend Developer", true)],
      active: undefined,
      pathways: {},
    });

    expect(cards.map((c) => [c.careerId, c.isActive])).toEqual([
      ["c1", true],
      ["c2", false],
    ]);
  });

  it("shows 0 XP, since there is no XP data", () => {
    const [card] = buildPathwayCards({ saved: [saved("c1", "Frontend Developer", true)], active: undefined, pathways: {} });

    expect(card.xp).toBe(0);
  });

  describe("where they are, for the active pathway", () => {
    it("is the step the server says is next, described from the career's roadmap", () => {
      const [card] = buildPathwayCards({
        saved: [saved("c1", "Frontend Developer", true, 1)],
        active: active("c1", "a2"),
        pathways: { c1: pathwayOf("c1", frontendSteps) },
      });

      expect(card.currentStep).toEqual({ title: "CSS", description: "Style and lay out pages." });
    });

    it("falls back to the learning objective when the step has no description", () => {
      const [card] = buildPathwayCards({
        saved: [saved("c1", "Frontend Developer", true, 1)],
        active: active("c1", "a2"),
        pathways: { c1: pathwayOf("c1", [frontendSteps[0], publicStep("a2", 2, { title: "CSS", description: " ", learningObjective: "Style pages" })]) },
      });

      expect(card.currentStep?.description).toBe("Style pages");
    });

    it("still names the step before the roadmap has loaded, with nothing to describe it", () => {
      const [card] = buildPathwayCards({
        saved: [saved("c1", "Frontend Developer", true, 1)],
        active: active("c1", "a2"),
        pathways: {},
      });

      expect(card.currentStep).toEqual({ title: "CSS", description: "" });
    });

    it("has no step once every step is done", () => {
      const [card] = buildPathwayCards({
        saved: [saved("c1", "Frontend Developer", true, 3)],
        active: active("c1", null),
        pathways: { c1: pathwayOf("c1", frontendSteps) },
      });

      expect(card.currentStep).toBeNull();
    });
  });

  describe("where they are, for a pathway that isn't active", () => {
    const uxSteps = [
      publicStep("u1", 1, { title: "User research basics", description: "Learn to ask good questions." }),
      publicStep("u2", 2, { title: "Wireframing", description: "Sketch layouts." }),
      publicStep("u3", 3, { title: "Prototyping", description: "Make it clickable." }),
    ];

    it("is the step after the ones they have completed, by number", () => {
      const cards = buildPathwayCards({
        saved: [saved("c1", "Frontend Developer", true, 1), saved("c2", "UX Designer", false, 2)],
        active: active("c1", "a2"),
        pathways: { c1: pathwayOf("c1", frontendSteps), c2: pathwayOf("c2", uxSteps) },
      });

      expect(cards[1].currentStep).toEqual({ title: "Prototyping", description: "Make it clickable." });
    });

    it("starts at the first step when none are done", () => {
      const [card] = buildPathwayCards({
        saved: [saved("c2", "UX Designer", false, 0)],
        active: undefined,
        pathways: { c2: pathwayOf("c2", uxSteps) },
      });

      expect(card.currentStep?.title).toBe("User research basics");
    });

    it("has no step when they have completed them all, or the roadmap isn't there", () => {
      const done = buildPathwayCards({
        saved: [saved("c2", "UX Designer", false, 3)],
        active: undefined,
        pathways: { c2: pathwayOf("c2", uxSteps) },
      });
      const missing = buildPathwayCards({
        saved: [saved("c2", "UX Designer", false, 1)],
        active: undefined,
        pathways: { c2: null },
      });

      expect(done[0].currentStep).toBeNull();
      expect(missing[0].currentStep).toBeNull();
    });
  });
});
