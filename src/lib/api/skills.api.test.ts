import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse, type JsonBodyType } from "msw";
import { setupServer } from "msw/node";
import {
  fetchAssessment,
  resetAssessment,
  saveAssessment,
  updateMySkills,
} from "./skills.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const assessment = {
  careerId: "c1",
  pathwayId: "p1",
  stages: [
    {
      stageId: "s1",
      stageTitle: "Foundations",
      stageOrder: 1,
      skills: [{ skillId: "k1", skillName: "HTML", status: "HAVE", rating: 4 }],
    },
  ],
};

function getAssessmentReturns(status: number, body: JsonBodyType = {}) {
  server.use(http.get("*/me/skills/assessment", () => HttpResponse.json(body, { status })));
}

describe("fetchAssessment", () => {
  it("returns the assessment", async () => {
    getAssessmentReturns(200, assessment);
    await expect(fetchAssessment()).resolves.toEqual(assessment);
  });

  it("returns null when there is no active pathway", async () => {
    getAssessmentReturns(404, { code: "NO_ACTIVE_PATHWAY" });
    await expect(fetchAssessment()).resolves.toBeNull();
  });

  it("rethrows other failures so the page can offer a retry", async () => {
    getAssessmentReturns(500);
    await expect(fetchAssessment()).rejects.toThrow();
  });
});

describe("saveAssessment", () => {
  it("sends the answers wrapped in a skills array", async () => {
    let body: unknown;
    server.use(
      http.put("*/me/skills/assessment", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ updated: 1 });
      }),
    );

    await saveAssessment([{ skillId: "k1", status: "HAVE", rating: 3 }]);

    expect(body).toEqual({ skills: [{ skillId: "k1", status: "HAVE", rating: 3 }] });
  });
});

describe("resetAssessment", () => {
  it("deletes the assessment", async () => {
    let called = false;
    server.use(
      http.delete("*/me/skills/assessment", () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await resetAssessment();

    expect(called).toBe(true);
  });
});

describe("updateMySkills", () => {
  it("sends the full list of skill ids", async () => {
    let body: unknown;
    server.use(
      http.put("*/me/skills", async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await updateMySkills(["k1", "k2"]);

    expect(body).toEqual({ skillIds: ["k1", "k2"] });
  });
});
