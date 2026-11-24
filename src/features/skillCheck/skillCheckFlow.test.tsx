import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiHandlers, renderAt, signIn, signOut } from "@/test/renderApp";
import type { AssessmentSkillInput, UserSkillStatus } from "@/lib/api/skills.api";
import { activePathwayDto, assessmentDto } from "./skillCheck.fixtures";

vi.setConfig({ testTimeout: 90_000 });

const server = setupServer();

/** A small stand-in for the backend's skill check state. */
let activeCareerId: string | null;
/** Answered skills only; anything else reads Not sure with no assessedAt, as on the server. */
let answers: Record<string, { status: UserSkillStatus; rating: number | null; assessedAt: string }>;
let startStepId: string | null;
let saves: AssessmentSkillInput[][];
let switches: string[];
let resets: number;

const careers = [
  { id: "c1", slug: "frontend-engineer", title: "Frontend Developer", description: "", iconKey: null, targetLevels: [], topicCount: 4, resourceCount: 0 },
  { id: "c2", slug: "backend-engineer", title: "Backend Developer", description: "", iconKey: null, targetLevels: [], topicCount: 6, resourceCount: 0 },
  { id: "c3", slug: "data-analyst", title: "Data Analyst", description: "", iconKey: null, targetLevels: [], topicCount: 3, resourceCount: 0 },
];

/** c1 and c2 list skills on their steps; c3 has steps but no skills yet. */
function roadmap(careerId: string) {
  const skills = careerId === "c3" ? [] : [{ id: "html", name: "HTML" }];
  return {
    pathway: {
      id: `p-${careerId}`,
      careerId,
      title: "",
      description: "",
      steps: [{ id: `${careerId}-s1`, order: 1, title: "Step", skills, resources: [] }],
    },
  };
}

function firstGapStep(): string | null {
  const steps = [...activePathwayDto.steps].sort((a, b) => a.order - b.order);
  return (
    steps.find((step) => step.skills.some((skill) => answers[skill.id]?.status === "DONT_HAVE"))?.id ??
    null
  );
}

function handlers() {
  return [
    http.get("*/careers", () => HttpResponse.json({ items: careers })),
    http.get("*/careers/:id/pathway", ({ params }) => HttpResponse.json(roadmap(params.id as string))),
    http.get("*/me/active-pathway", () =>
      activeCareerId === "c1"
        ? HttpResponse.json({
            ...activePathwayDto,
            progress: { ...activePathwayDto.progress!, startStepId },
          })
        : HttpResponse.json({ career: null, pathway: null, progress: null, steps: [] }),
    ),
    http.put("*/me/active-pathway", async ({ request }) => {
      const { careerId } = (await request.json()) as { careerId: string };
      switches.push(careerId);
      activeCareerId = careerId;
      return HttpResponse.json({
        ...activePathwayDto,
        progress: { ...activePathwayDto.progress!, startStepId },
      });
    }),
    http.get("*/me/skills/assessment", () => {
      if (activeCareerId !== "c1") return HttpResponse.json({}, { status: 404 });
      const dates = Object.values(answers).map((answer) => answer.assessedAt).sort();
      return HttpResponse.json({
        ...assessmentDto,
        lastAssessedAt: dates.at(-1) ?? null,
        stages: assessmentDto.stages.map((stage) => ({
          ...stage,
          skills: stage.skills.map((skill) => ({
            ...skill,
            status: answers[skill.skillId]?.status ?? "NOT_SURE",
            rating: answers[skill.skillId]?.rating ?? null,
            assessedAt: answers[skill.skillId]?.assessedAt ?? null,
          })),
        })),
      });
    }),
    http.put("*/me/skills/assessment", async ({ request }) => {
      const { skills } = (await request.json()) as { skills: AssessmentSkillInput[] };
      saves.push(skills);
      for (const skill of skills) {
        answers[skill.skillId] = {
          status: skill.status,
          rating: skill.rating ?? null,
          assessedAt: new Date().toISOString(),
        };
      }
      startStepId = firstGapStep();
      return HttpResponse.json({ updated: skills.length, startStepId });
    }),
    http.delete("*/me/skills/assessment", () => {
      resets += 1;
      answers = {};
      startStepId = null;
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
beforeEach(() => {
  activeCareerId = "c1";
  answers = {};
  startStepId = null;
  saves = [];
  switches = [];
  resets = 0;
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  server.use(...handlers(), ...apiHandlers());
  signIn();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  signOut();
});
afterAll(() => server.close());

async function answer(skillName: string, label: "Have" | "Not yet" | "Not sure") {
  const group = await screen.findByRole("group", { name: `Your answer for ${skillName}` });
  await userEvent.click(within(group).getByRole("radio", { name: label }));
}

const SAVED_AT = "2026-11-20T10:00:00.000Z";

function saveResult() {
  answers = {
    html: { status: "HAVE", rating: 4, assessedAt: SAVED_AT },
    css: { status: "HAVE", rating: null, assessedAt: SAVED_AT },
    js: { status: "DONT_HAVE", rating: null, assessedAt: SAVED_AT },
    layout: { status: "DONT_HAVE", rating: null, assessedAt: SAVED_AT },
    a11y: { status: "NOT_SURE", rating: null, assessedAt: SAVED_AT },
  };
  startStepId = "st3";
}

describe("Skill check against the API", () => {
  it("asks about the active pathway's skills one stage at a time and saves them", async () => {
    await renderAt("/my-pathway/skill-check/c1");

    expect(await screen.findByRole("heading", { name: "Core web" })).toBeTruthy();
    await answer("HTML", "Have");
    await answer("CSS", "Have");
    await answer("JavaScript", "Not yet");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("heading", { name: "Building interfaces" })).toBeTruthy();
    await answer("Responsive layout", "Not sure");
    await answer("Accessibility", "Not sure");
    await userEvent.click(screen.getByRole("button", { name: "See my result" }));

    expect(await screen.findByRole("heading", { name: "Here is where you stand" })).toBeTruthy();
    expect(saves).toEqual([
      [
        { skillId: "html", status: "HAVE" },
        { skillId: "css", status: "HAVE" },
        { skillId: "js", status: "DONT_HAVE" },
        { skillId: "layout", status: "NOT_SURE" },
        { skillId: "a11y", status: "NOT_SURE" },
      ],
    ]);
    expect(await screen.findByText("Step 3, JavaScript basics")).toBeTruthy();
  });

  it("keeps a saved rating when the answers are edited", async () => {
    saveResult();
    await renderAt("/my-pathway/skill-check/c1");

    // Everything is answered, so it reopens on the last stage.
    await screen.findByRole("heading", { name: "Building interfaces" });
    await userEvent.click(screen.getByRole("button", { name: "See my result" }));

    await screen.findByRole("heading", { name: "Here is where you stand" });
    expect(saves[0]).toContainEqual({ skillId: "html", status: "HAVE", rating: 4 });
  });

  it("shows the saved result with gaps in roadmap order and the server's starting step", async () => {
    saveResult();
    await renderAt("/my-pathway/skill-check/c1/result");

    const gaps = await screen.findByRole("region", { name: "Skill gaps, in roadmap order" });
    const items = within(gaps).getAllByRole("listitem").map((item) => item.textContent);
    expect(items[0]).toContain("JavaScript");
    expect(items[0]).toContain("Step 3 · JavaScript basics");
    expect(items).toHaveLength(3);
    expect(screen.getByText("Step 3, JavaScript basics")).toBeTruthy();
  });

  it("rates a skill marked Have", async () => {
    saveResult();
    await renderAt("/my-pathway/skill-check/c1/result");

    await userEvent.click(await screen.findByRole("button", { name: "Rate CSS" }));
    await userEvent.click(await screen.findByRole("radio", { name: /^3:/u }));
    await userEvent.click(screen.getByRole("button", { name: "Save rating" }));

    expect(await screen.findByText(/Rating saved/)).toBeTruthy();
    expect(saves).toEqual([[{ skillId: "css", status: "HAVE", rating: 3 }]]);
  });

  it("clears the answers on retake and opens a blank questionnaire", async () => {
    saveResult();
    await renderAt("/my-pathway/skill-check");

    expect(await screen.findByText("Result saved")).toBeTruthy();
    expect(screen.getByText(/Last checked 20 November/)).toBeTruthy();
    expect(screen.getByText("Step 3 · JavaScript basics")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Retake skill check" }));
    await userEvent.click(await screen.findByRole("button", { name: "Clear and start again" }));

    expect(await screen.findByRole("heading", { name: "Core web" })).toBeTruthy();
    expect(resets).toBe(1);
    expect(screen.getByText(/0 of 5 answered/)).toBeTruthy();
  });

  it("switches the active pathway before checking a different career", async () => {
    await renderAt("/my-pathway/skill-check/c2");

    expect(
      await screen.findByRole("heading", { name: "Switch your active pathway to Backend Developer?" }),
    ).toBeTruthy();
    expect(screen.getByText(/Your progress on Frontend Developer is saved/)).toBeTruthy();
  });

  it("starts a pathway for someone without one, then asks about its skills", async () => {
    activeCareerId = null;
    await renderAt("/my-pathway/skill-check/c1");

    await userEvent.click(await screen.findByRole("button", { name: "Start pathway" }));

    expect(await screen.findByRole("heading", { name: "Core web" })).toBeTruthy();
    expect(switches).toEqual(["c1"]);
  });

  it("offers a career to check when there is no active pathway", async () => {
    activeCareerId = null;
    await renderAt("/my-pathway/skill-check");

    expect(await screen.findByRole("heading", { name: "Choose a career to explore." })).toBeTruthy();
  });

  it("says a career has no skill list before offering to switch to it", async () => {
    await renderAt("/my-pathway/skill-check/c3");

    expect(await screen.findByRole("heading", { name: "No skill list for Data Analyst yet" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Switch pathway" })).toBeNull();
    expect(switches).toEqual([]);
  });

  it("does not show a result for a starting step chosen without a skill check", async () => {
    startStepId = "st3";
    await renderAt("/my-pathway/skill-check");

    expect(await screen.findByRole("button", { name: /Start skill check/ })).toBeTruthy();
    expect(screen.queryByText("Result saved")).toBeNull();
  });

  it("sends a result link for another career to the switch screen", async () => {
    await renderAt("/my-pathway/skill-check/c2/result");

    expect(
      await screen.findByRole("heading", { name: "Switch your active pathway to Backend Developer?" }),
    ).toBeTruthy();
  });
});
