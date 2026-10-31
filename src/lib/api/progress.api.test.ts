import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  fetchActivePathway,
  fetchSavedPathways,
  setActivePathway,
  setStartingPoint,
  setStepStatus,
} from "./progress.api";
import { httpStatus, isNetworkError } from "./progressErrors";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const progress = {
  completed: 1,
  total: 3,
  percentage: 33,
  nextStepId: "s2",
  selfReported: true,
  startStepId: null,
};

const active = {
  career: {
    id: "career-1",
    slug: "devops",
    title: "DevOps Engineer",
    roleSummary: "Builds pipelines.",
    retired: false,
  },
  pathway: { id: "p1", title: "DevOps Roadmap" },
  progress,
  steps: [
    { id: "s1", order: 1, title: "Linux", skills: [{ id: "k1", name: "Shell" }], status: "COMPLETED" },
    { id: "s2", order: 2, title: "Git", skills: [], status: "IN_PROGRESS" },
    { id: "s3", order: 3, title: "Docker", skills: [], status: "NOT_STARTED" },
  ],
};

const saved = (id: string, over: Record<string, unknown> = {}) => ({
  career: { id, slug: id, title: `Career ${id}`, retired: false },
  isActive: false,
  progress: { completed: 2, total: 8, percentage: 25 },
  ...over,
});

describe("fetchSavedPathways", () => {
  it("GETs the saved pathways with their progress", async () => {
    let method = "";
    server.use(
      http.get("*/me/pathways", ({ request }) => {
        method = request.method;
        return HttpResponse.json([saved("a", { isActive: true }), saved("b")]);
      }),
    );

    const pathways = await fetchSavedPathways();

    expect(method).toBe("GET");
    expect(pathways.map((p) => p.career.id)).toEqual(["a", "b"]);
    expect(pathways[0].isActive).toBe(true);
    expect(pathways[1].progress).toEqual({ completed: 2, total: 8, percentage: 25 });
  });

  it("returns an empty list for someone who hasn't saved anything", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.json([])));

    await expect(fetchSavedPathways()).resolves.toEqual([]);
  });

  it("keeps a retired career, marked as retired", async () => {
    server.use(
      http.get("*/me/pathways", () =>
        HttpResponse.json([
          saved("old", { career: { id: "old", slug: "old", title: "Old", retired: true } }),
        ]),
      ),
    );

    const [pathway] = await fetchSavedPathways();

    expect(pathway.career.retired).toBe(true);
  });

  it("fails with the HTTP status so a screen can tell what went wrong", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.json({}, { status: 500 })));

    const error = await fetchSavedPathways().catch((e: unknown) => e);

    expect(httpStatus(error)).toBe(500);
  });
});

describe("fetchActivePathway", () => {
  it("GETs the pathway being followed with its steps and their state", async () => {
    let method = "";
    server.use(
      http.get("*/me/active-pathway", ({ request }) => {
        method = request.method;
        return HttpResponse.json(active);
      }),
    );

    const result = await fetchActivePathway();

    expect(method).toBe("GET");
    expect(result.career?.title).toBe("DevOps Engineer");
    expect(result.steps.map((s) => s.status)).toEqual(["COMPLETED", "IN_PROGRESS", "NOT_STARTED"]);
    expect(result.progress?.nextStepId).toBe("s2");
  });

  it("returns what the server sends for someone who hasn't chosen a pathway", async () => {
    const none = { career: null, pathway: null, progress: null, steps: [] };
    server.use(http.get("*/me/active-pathway", () => HttpResponse.json(none)));

    await expect(fetchActivePathway()).resolves.toEqual(none);
  });
});

describe("setActivePathway", () => {
  it("PUTs the career id and returns the pathway with its steps", async () => {
    let received: unknown;
    let method = "";
    server.use(
      http.put("*/me/active-pathway", async ({ request }) => {
        method = request.method;
        received = await request.json();
        return HttpResponse.json(active);
      }),
    );

    const result = await setActivePathway("career-1");

    expect(method).toBe("PUT");
    expect(received).toEqual({ careerId: "career-1" });
    expect(result.pathway?.id).toBe("p1");
  });

  it.each([404, 409])("fails with the status %i, which the screens check", async (status) => {
    server.use(http.put("*/me/active-pathway", () => HttpResponse.json({}, { status })));

    const error = await setActivePathway("career-1").catch((e: unknown) => e);

    expect(httpStatus(error)).toBe(status);
  });
});

describe("setStepStatus", () => {
  const result = { stepId: "step-1", status: "COMPLETED", progress };

  it("PUTs the status for the step and returns the updated progress", async () => {
    let received: unknown;
    let method = "";
    server.use(
      http.put("*/me/pathway-steps/step-1", async ({ request }) => {
        method = request.method;
        received = await request.json();
        return HttpResponse.json(result);
      }),
    );

    await expect(setStepStatus("step-1", "COMPLETED")).resolves.toEqual(result);
    expect(method).toBe("PUT");
    expect(received).toEqual({ status: "COMPLETED" });
  });

  it("clears a step with NOT_STARTED", async () => {
    let received: unknown;
    server.use(
      http.put("*/me/pathway-steps/step-1", async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ ...result, status: "NOT_STARTED" });
      }),
    );

    const done = await setStepStatus("step-1", "NOT_STARTED");

    expect(received).toEqual({ status: "NOT_STARTED" });
    expect(done.status).toBe("NOT_STARTED");
  });

  it("keeps an unusual id from changing the request path", async () => {
    let path = "";
    server.use(
      http.put("*/me/pathway-steps/*", ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json(result);
      }),
    );

    await setStepStatus("a/b", "COMPLETED");

    expect(path.endsWith("/me/pathway-steps/a%2Fb")).toBe(true);
  });

  it.each([400, 404, 409])("fails with the status %i", async (status) => {
    server.use(http.put("*/me/pathway-steps/step-1", () => HttpResponse.json({}, { status })));

    const error = await setStepStatus("step-1", "COMPLETED").catch((e: unknown) => e);

    expect(httpStatus(error)).toBe(status);
  });
});

describe("setStartingPoint", () => {
  const updated = {
    careerId: "career-1",
    startStepId: "s2",
    progress: { ...progress, startStepId: "s2" },
  };

  it("PUTs the step to start from and returns the updated progress", async () => {
    let received: unknown;
    let method = "";
    server.use(
      http.put("*/me/pathways/career-1/starting-point", async ({ request }) => {
        method = request.method;
        received = await request.json();
        return HttpResponse.json(updated);
      }),
    );

    await expect(setStartingPoint("career-1", "s2")).resolves.toEqual(updated);
    expect(method).toBe("PUT");
    expect(received).toEqual({ stepId: "s2" });
  });

  it("clears the starting point when given null", async () => {
    let received: unknown;
    server.use(
      http.put("*/me/pathways/career-1/starting-point", async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ ...updated, startStepId: null });
      }),
    );

    const result = await setStartingPoint("career-1", null);

    expect(received).toEqual({ stepId: null });
    expect(result.startStepId).toBeNull();
  });

  it("keeps an unusual id from changing the request path", async () => {
    let path = "";
    server.use(
      http.put("*/me/pathways/*", ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json(updated);
      }),
    );

    await setStartingPoint("a/b", "s1");

    expect(path.endsWith("/me/pathways/a%2Fb/starting-point")).toBe(true);
  });

  it.each([400, 404])("fails with the status %i", async (status) => {
    server.use(
      http.put("*/me/pathways/career-1/starting-point", () => HttpResponse.json({}, { status })),
    );

    const error = await setStartingPoint("career-1", "s1").catch((e: unknown) => e);

    expect(httpStatus(error)).toBe(status);
  });

  it("fails without a status when the server can't be reached", async () => {
    server.use(http.put("*/me/pathways/career-1/starting-point", () => HttpResponse.error()));

    const error = await setStartingPoint("career-1", "s1").catch((e: unknown) => e);

    expect(isNetworkError(error)).toBe(true);
    expect(httpStatus(error)).toBeUndefined();
  });
});
