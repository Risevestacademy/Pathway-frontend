import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  ActivePathwayError,
  MyPathwaysError,
  StartingPointError,
  StepStatusError,
  fetchActivePathway,
  fetchMyPathways,
  setActivePathway,
  setPathwayStepStatus,
  setStartingPoint,
} from "./progress.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const result = {
  stepId: "step-1",
  status: "COMPLETED",
  progress: {
    completed: 2,
    total: 8,
    percentage: 25,
    nextStepId: "step-3",
    selfReported: true,
    startStepId: "step-1",
  },
};

describe("setPathwayStepStatus", () => {
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

    await expect(setPathwayStepStatus("step-1", "COMPLETED")).resolves.toEqual(result);
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

    const done = await setPathwayStepStatus("step-1", "NOT_STARTED");

    expect(received).toEqual({ status: "NOT_STARTED" });
    expect(done.status).toBe("NOT_STARTED");
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.put("*/me/pathway-steps/step-1", () => HttpResponse.json({ data: result })));

    await expect(setPathwayStepStatus("step-1", "COMPLETED")).resolves.toEqual(result);
  });

  it("turns missing progress fields into null and zero", async () => {
    server.use(
      http.put("*/me/pathway-steps/step-1", () =>
        HttpResponse.json({
          stepId: "step-1",
          status: "COMPLETED",
          progress: { completed: 8, total: 8, percentage: 100, selfReported: true },
        }),
      ),
    );

    const { progress } = await setPathwayStepStatus("step-1", "COMPLETED");

    expect(progress.nextStepId).toBeNull();
    expect(progress.startStepId).toBeNull();
    expect(progress.percentage).toBe(100);
  });

  it("keeps an unusual id from changing the request path", async () => {
    let path = "";
    server.use(
      http.put("*/me/pathway-steps/*", ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json(result);
      }),
    );

    await setPathwayStepStatus("a/b", "COMPLETED");

    expect(path.endsWith("/me/pathway-steps/a%2Fb")).toBe(true);
  });

  it.each([
    [400, "We couldn’t update this step. Please try again."],
    [404, "This step isn’t available any more."],
    [409, "Save this career to your pathways before tracking progress on it."],
    [500, "We couldn’t update this step. Please try again."],
  ])("explains a %i in plain words and keeps the status", async (status, message) => {
    server.use(
      http.put("*/me/pathway-steps/step-1", () =>
        HttpResponse.json({ message: "raw server text" }, { status }),
      ),
    );

    const error = (await setPathwayStepStatus("step-1", "COMPLETED").catch(
      (e: unknown) => e,
    )) as StepStatusError;

    expect(error).toBeInstanceOf(StepStatusError);
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.put("*/me/pathway-steps/step-1", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(setPathwayStepStatus("step-1", "COMPLETED")).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.put("*/me/pathway-steps/step-1", () => HttpResponse.error()));

    await expect(setPathwayStepStatus("step-1", "COMPLETED")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});

const saved = (id: string, over: Record<string, unknown> = {}) => ({
  career: { id, slug: id, title: `Career ${id}`, retired: false },
  isActive: false,
  progress: { completed: 2, total: 8, percentage: 25 },
  ...over,
});

describe("fetchMyPathways", () => {
  it("GETs the saved pathways with their progress", async () => {
    let method = "";
    server.use(
      http.get("*/me/pathways", ({ request }) => {
        method = request.method;
        return HttpResponse.json([saved("a", { isActive: true }), saved("b")]);
      }),
    );

    const pathways = await fetchMyPathways();

    expect(method).toBe("GET");
    expect(pathways.map((p) => p.career.id)).toEqual(["a", "b"]);
    expect(pathways[0].isActive).toBe(true);
    expect(pathways[1].progress).toEqual({ completed: 2, total: 8, percentage: 25 });
  });

  it("returns an empty list for someone who hasn't saved anything", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.json([])));

    await expect(fetchMyPathways()).resolves.toEqual([]);
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.json({ data: [saved("a")] })));

    await expect(fetchMyPathways()).resolves.toHaveLength(1);
  });

  it("keeps a retired career, marked as retired", async () => {
    server.use(
      http.get("*/me/pathways", () =>
        HttpResponse.json([
          saved("old", { career: { id: "old", slug: "old", title: "Old", retired: true } }),
        ]),
      ),
    );

    const [pathway] = await fetchMyPathways();

    expect(pathway.career.retired).toBe(true);
  });

  it("treats a missing progress or active flag as zero and not active", async () => {
    server.use(
      http.get("*/me/pathways", () =>
        HttpResponse.json([{ career: { id: "a", slug: "a", title: "A", retired: false } }]),
      ),
    );

    const [pathway] = await fetchMyPathways();

    expect(pathway.isActive).toBe(false);
    expect(pathway.progress).toEqual({ completed: 0, total: 0, percentage: 0 });
  });

  it("returns nothing, not a crash, if the body isn't a list", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.json({ unexpected: true })));

    await expect(fetchMyPathways()).resolves.toEqual([]);
  });

  it("explains a server error and keeps the status", async () => {
    server.use(
      http.get("*/me/pathways", () => HttpResponse.json({ message: "raw" }, { status: 500 })),
    );

    const error = (await fetchMyPathways().catch((e: unknown) => e)) as MyPathwaysError;

    expect(error).toBeInstanceOf(MyPathwaysError);
    expect(error.message).toBe("We couldn’t load your pathways. Please try again.");
    expect(error.status).toBe(500);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.get("*/me/pathways", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(fetchMyPathways()).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure, with no status", async () => {
    server.use(http.get("*/me/pathways", () => HttpResponse.error()));

    const error = (await fetchMyPathways().catch((e: unknown) => e)) as MyPathwaysError;

    expect(error.message).toBe(
      "We couldn’t reach the server. Check your connection and try again.",
    );
    expect(error.status).toBeUndefined();
  });
});

const active = {
  career: {
    id: "career-1",
    slug: "devops",
    title: "DevOps Engineer",
    roleSummary: "Builds pipelines.",
    retired: false,
  },
  pathway: { id: "p1", title: "DevOps Roadmap" },
  progress: {
    completed: 1,
    total: 3,
    percentage: 33,
    nextStepId: "s2",
    selfReported: true,
    startStepId: null,
  },
  steps: [
    { id: "s1", order: 1, title: "Linux", skills: [{ id: "k1", name: "Shell" }], status: "COMPLETED" },
    { id: "s2", order: 2, title: "Git", skills: [], status: "IN_PROGRESS" },
    { id: "s3", order: 3, title: "Docker", skills: [], status: "NOT_STARTED" },
  ],
};

describe("setActivePathway", () => {
  it("PUTs the career id and returns the pathway with its steps and their state", async () => {
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
    expect(result.career?.title).toBe("DevOps Engineer");
    expect(result.steps.map((s) => s.status)).toEqual(["COMPLETED", "IN_PROGRESS", "NOT_STARTED"]);
    expect(result.progress?.nextStepId).toBe("s2");
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.put("*/me/active-pathway", () => HttpResponse.json({ data: active })));

    await expect(setActivePathway("career-1")).resolves.toMatchObject({ pathway: { id: "p1" } });
  });

  it("fills in what the server leaves out", async () => {
    server.use(
      http.put("*/me/active-pathway", () =>
        HttpResponse.json({
          career: active.career,
          steps: [{ id: "s1", order: 1, title: "Linux", status: "NOT_STARTED" }],
        }),
      ),
    );

    const result = await setActivePathway("career-1");

    expect(result.pathway).toBeNull();
    expect(result.progress).toBeNull();
    expect(result.steps[0].skills).toEqual([]);
  });

  it("returns no steps rather than crashing when the list is missing", async () => {
    server.use(http.put("*/me/active-pathway", () => HttpResponse.json({})));

    await expect(setActivePathway("career-1")).resolves.toEqual({
      career: null,
      pathway: null,
      progress: null,
      steps: [],
    });
  });

  it.each([
    [404, "This career isn’t available to follow right now."],
    [409, "This career doesn’t have a pathway yet."],
    [500, "We couldn’t set this pathway. Please try again."],
  ])("explains a %i in plain words and keeps the status", async (status, message) => {
    server.use(
      http.put("*/me/active-pathway", () =>
        HttpResponse.json({ message: "raw server text" }, { status }),
      ),
    );

    const error = (await setActivePathway("career-1").catch((e: unknown) => e)) as ActivePathwayError;

    expect(error).toBeInstanceOf(ActivePathwayError);
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.put("*/me/active-pathway", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(setActivePathway("career-1")).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.put("*/me/active-pathway", () => HttpResponse.error()));

    await expect(setActivePathway("career-1")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
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
    expect(result.steps.map((s) => s.title)).toEqual(["Linux", "Git", "Docker"]);
    expect(result.progress?.nextStepId).toBe("s2");
  });

  it("returns an empty result for someone who hasn't chosen a pathway", async () => {
    server.use(
      http.get("*/me/active-pathway", () =>
        HttpResponse.json({ career: null, pathway: null, progress: null, steps: [] }),
      ),
    );

    await expect(fetchActivePathway()).resolves.toEqual({
      career: null,
      pathway: null,
      progress: null,
      steps: [],
    });
  });

  it("accepts a response wrapped in data, and a body with nothing in it", async () => {
    server.use(http.get("*/me/active-pathway", () => HttpResponse.json({ data: active })));
    await expect(fetchActivePathway()).resolves.toMatchObject({ pathway: { id: "p1" } });

    server.use(http.get("*/me/active-pathway", () => HttpResponse.json({})));
    await expect(fetchActivePathway()).resolves.toMatchObject({ career: null, steps: [] });
  });

  it("explains a server error and keeps the status", async () => {
    server.use(
      http.get("*/me/active-pathway", () => HttpResponse.json({ message: "raw" }, { status: 500 })),
    );

    const error = (await fetchActivePathway().catch((e: unknown) => e)) as ActivePathwayError;

    expect(error).toBeInstanceOf(ActivePathwayError);
    expect(error.message).toBe("We couldn’t load your active pathway. Please try again.");
    expect(error.status).toBe(500);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.get("*/me/active-pathway", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(fetchActivePathway()).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure, with no status", async () => {
    server.use(http.get("*/me/active-pathway", () => HttpResponse.error()));

    const error = (await fetchActivePathway().catch((e: unknown) => e)) as ActivePathwayError;

    expect(error.message).toBe(
      "We couldn’t reach the server. Check your connection and try again.",
    );
    expect(error.status).toBeUndefined();
  });
});

describe("setStartingPoint", () => {
  const updated = {
    careerId: "career-1",
    startStepId: "s2",
    progress: {
      completed: 1,
      total: 3,
      percentage: 33,
      nextStepId: "s2",
      selfReported: true,
      startStepId: "s2",
    },
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

  it("accepts a response wrapped in data and fills in missing progress fields", async () => {
    server.use(
      http.put("*/me/pathways/career-1/starting-point", () =>
        HttpResponse.json({ data: { careerId: "career-1", progress: { completed: 2 } } }),
      ),
    );

    const result = await setStartingPoint("career-1", "s1");

    expect(result.startStepId).toBeNull();
    expect(result.progress).toMatchObject({ completed: 2, total: 0, nextStepId: null });
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

  it.each([
    [400, "That step isn’t part of this pathway."],
    [404, "Save this pathway before choosing where to start."],
    [500, "We couldn’t save your starting point. Please try again."],
  ])("explains a %i in plain words and keeps the status", async (status, message) => {
    server.use(
      http.put("*/me/pathways/career-1/starting-point", () =>
        HttpResponse.json({ message: "raw server text" }, { status }),
      ),
    );

    const error = (await setStartingPoint("career-1", "s1").catch(
      (e: unknown) => e,
    )) as StartingPointError;

    expect(error).toBeInstanceOf(StartingPointError);
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.put("*/me/pathways/career-1/starting-point", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(setStartingPoint("career-1", "s1")).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.put("*/me/pathways/career-1/starting-point", () => HttpResponse.error()));

    await expect(setStartingPoint("career-1", "s1")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});
