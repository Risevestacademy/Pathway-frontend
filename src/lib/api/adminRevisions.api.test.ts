import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchRevisionDiff } from "./adminRevisions.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const diff = {
  revisionId: "rev-1",
  title: "UX Designer: salary range",
  submittedBy: "Chidi E.",
  submittedAt: "5 hours ago",
  baseVersion: 3,
  liveVersion: 3,
  stale: false,
  blockers: [],
  advisories: [],
  sections: {
    outlook: {
      changed: [
        {
          field: "sourceId",
          label: "Source",
          before: "a3f2",
          after: "b7e2",
          beforeLabel: "Jobberman salary guide 2025",
          afterLabel: "Jobberman salary guide 2026",
        },
      ],
      added: [],
      removed: [],
      moved: [],
    },
  },
};

describe("fetchRevisionDiff", () => {
  it("GETs the diff for the revision and returns it", async () => {
    let method = "";
    server.use(
      http.get("*/admin/revisions/rev-1/diff", ({ request }) => {
        method = request.method;
        return HttpResponse.json(diff);
      }),
    );

    await expect(fetchRevisionDiff("rev-1")).resolves.toEqual(diff);
    expect(method).toBe("GET");
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.get("*/admin/revisions/rev-1/diff", () => HttpResponse.json({ data: diff })));

    await expect(fetchRevisionDiff("rev-1")).resolves.toEqual(diff);
  });

  it("falls back to empty lists and sections when the server leaves them out", async () => {
    const { blockers, advisories, sections, ...bare } = diff;
    void blockers;
    void advisories;
    void sections;
    server.use(http.get("*/admin/revisions/rev-1/diff", () => HttpResponse.json(bare)));

    const result = await fetchRevisionDiff("rev-1");

    expect(result.blockers).toEqual([]);
    expect(result.advisories).toEqual([]);
    expect(result.sections).toEqual({});
  });

  it.each([
    [
      403,
      "You can’t view this change. Editors can only see their own; reviewers can see any.",
    ],
    [404, "This change no longer exists."],
    [400, "This change no longer exists."],
    [500, "We couldn’t load this change. Please try again."],
  ])("explains a %i in plain words", async (status, message) => {
    server.use(
      http.get("*/admin/revisions/rev-1/diff", () =>
        HttpResponse.json({ message: "raw server text" }, { status }),
      ),
    );

    await expect(fetchRevisionDiff("rev-1")).rejects.toThrow(message);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.get("*/admin/revisions/rev-1/diff", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(fetchRevisionDiff("rev-1")).rejects.toThrow(
      "Your session has expired. Sign in again to see this change.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.get("*/admin/revisions/rev-1/diff", () => HttpResponse.error()));

    await expect(fetchRevisionDiff("rev-1")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});
