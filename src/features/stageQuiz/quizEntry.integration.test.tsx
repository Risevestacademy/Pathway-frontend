import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import { act } from "react";
import type { PathwayDetailDto } from "../../lib/api/pathways.api";
import type { PathwayStepStatus } from "../../lib/api/progress.api";
import { useAuthStore } from "../../lib/stores/authStore";
import { renderWithRouter, stubDialog } from "../../test/renderWithRouter";
import { ResourcesPage } from "../pathwayRoadmap/components/ResourcesPage";
import type { CareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";

/**
 * The resources tab with its real hooks and screens, faking only the network and
 * the career/progress lookups, to check the quiz entry really shows up end to end.
 */

const useCareerPathwayData = vi.fn();
const fetchPathwayById = vi.fn();
const fetchPathwayOrNull = vi.fn();
const fetchPathwayResources = vi.fn();
const fetchQuiz = vi.fn();

vi.mock("../pathwayRoadmap/hooks/useCareerPathwayData", () => ({
  useCareerPathwayData: (careerId: string) => useCareerPathwayData(careerId),
}));
vi.mock("../../lib/api/pathways.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathways.api")>()),
  fetchPathwayById: (id: string) => fetchPathwayById(id),
  fetchPathwayOrNull: (careerId: string) => fetchPathwayOrNull(careerId),
}));
vi.mock("../../lib/api/pathwayResources.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayResources.api")>()),
  fetchPathwayResources: (id: string) => fetchPathwayResources(id),
}));

vi.mock("../../lib/api/pathwayQuiz.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayQuiz.api")>()),
  fetchQuiz: (...args: unknown[]) => fetchQuiz(...args),
}));

beforeEach(() => {
  stubDialog();
  act(() => {
    useAuthStore.getState().setAuth({ id: "u1", email: "u1@b.c", role: "USER" }, "token");
    useAuthStore.getState().finishHydrating();
  });
});
afterEach(() => {
  cleanup();
  useCareerPathwayData.mockReset();
  fetchPathwayById.mockReset();
  fetchPathwayOrNull.mockReset();
  fetchPathwayResources.mockReset();
  fetchQuiz.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

const careerStep = (id: string, order: number) => ({
  id,
  title: `Step ${order}`,
  description: "",
  learningObjective: "",
  prerequisites: null,
  expectedActivity: "",
  order,
  skills: [],
  resources: [],
});

const careerPathway = {
  id: "p1",
  careerId: "c1",
  title: "Roadmap",
  description: "",
  steps: [careerStep("s1", 1), careerStep("s2", 2), careerStep("s3", 3)],
};

const detailStep = (id: string, order: number) => ({
  id,
  title: `Step ${order}`,
  order,
  status: "NOT_STARTED" as const,
  description: "",
  skills: [],
  expectedActivity: "",
  careerReadiness: "",
  resources: [],
  tasks: [],
});

const detail: PathwayDetailDto = {
  id: "p1",
  career: { id: "c1", title: "Designer", description: "", retired: false, stageCount: 2, stepCount: 3, resourceCount: 0 },
  progress: { completed: 0, total: 3, percentage: 0, nextStepId: null, selfReported: true },
  stages: [
    {
      id: "g1",
      title: "Foundations",
      order: 1,
      description: "",
      progress: { completed: 0, total: 2, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [detailStep("s1", 1), detailStep("s2", 2)],
    },
    {
      id: "g2",
      title: "Core skills",
      order: 2,
      description: "",
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: "NOT_TAKEN" },
      steps: [detailStep("s3", 3)],
    },
  ],
};

const tracking = (statuses: Record<string, PathwayStepStatus>): CareerPathwayData => ({
  kind: "ready",
  careerTitle: "Designer",
  pathway: careerPathway,
  progress: {
    kind: "active",
    progress: { completed: 0, total: 3, percentage: 0, nextStepId: null, selfReported: true, startStepId: null },
    statuses,
  },
});

function have(data: CareerPathwayData) {
  useCareerPathwayData.mockReturnValue({ data, retry: vi.fn() });
  fetchPathwayById.mockResolvedValue(detail);
  fetchPathwayOrNull.mockResolvedValue(careerPathway);
  fetchPathwayResources.mockResolvedValue({ pathwayId: "p1", stages: [], optionalPaidCourses: [] });
  // Every stage has a quiz unless a test says otherwise.
  fetchQuiz.mockResolvedValue({ id: "quiz1", questions: [] });
}

const renderTab = () =>
  renderWithRouter(() => <ResourcesPage careerId="c1" />, { path: "/" });

describe("the quiz entry on the resources tab, end to end", () => {
  it("offers the stage's quiz, as complete, once every step in the stage is done", async () => {
    have(tracking({ s1: "COMPLETED", s2: "COMPLETED", s3: "NOT_STARTED" }));

    await renderTab();

    const link = await screen.findByRole("link", { name: "Take the Foundations quiz" });
    expect(link.getAttribute("href")).toBe("/my-pathway/c1/quiz/g1");
    expect(screen.getByRole("heading", { name: "Foundations stage complete" })).toBeTruthy();
    expect(fetchPathwayById).toHaveBeenCalledWith("p1");
  });

  it("offers no quiz for a stage that has none, since the server answers 404", async () => {
    have(tracking({ s1: "COMPLETED", s2: "COMPLETED", s3: "NOT_STARTED" }));
    fetchQuiz.mockResolvedValue(null);

    await renderTab();

    await screen.findByRole("navigation", { name: "Stages" });
    await vi.waitFor(() => expect(fetchQuiz).toHaveBeenCalledWith("p1", "g1"));
    expect(screen.queryByRole("link", { name: /quiz/ })).toBeNull();
  });

  it("lists the stages down the side, not their steps", async () => {
    have(tracking({ s1: "NOT_STARTED", s2: "NOT_STARTED", s3: "NOT_STARTED" }));

    await renderTab();

    const nav = await screen.findByRole("navigation", { name: "Stages" });
    expect(within(nav).getAllByRole("button").map((b) => b.textContent?.replace(/(\d of \d|No resources)$/, ""))).toEqual([
      "Foundations",
      "Core skills",
    ]);
  });

  it("offers the quiz while a step in the stage is still to do, without calling the stage complete", async () => {
    have(tracking({ s1: "COMPLETED", s2: "NOT_STARTED", s3: "NOT_STARTED" }));

    await renderTab();

    const link = await screen.findByRole("link", { name: "Take the Foundations quiz" });
    expect(link.getAttribute("href")).toBe("/my-pathway/c1/quiz/g1");
    expect(screen.queryByRole("heading", { name: "Foundations stage complete" })).toBeNull();
  });

  it("says the stages couldn't be loaded, instead of silently offering no quiz", async () => {
    have(tracking({ s1: "COMPLETED", s2: "COMPLETED", s3: "NOT_STARTED" }));
    fetchPathwayById.mockRejectedValue(new Error("boom"));

    await renderTab();

    expect((await screen.findByRole("alert")).textContent).toContain("We couldn’t load the stages");
    expect(screen.queryByRole("link", { name: /quiz/ })).toBeNull();
  });
});
