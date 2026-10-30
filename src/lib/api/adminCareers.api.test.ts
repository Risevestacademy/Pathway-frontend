import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  RevisionSaveError,
  deleteAdminCareer,
  saveCareerRevision,
} from "./adminCareers.api";
import type { CareerRevisionSnapshot } from "../../features/admin/careerRevision.types";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("deleteAdminCareer", () => {
  it("sends DELETE for the career id", async () => {
    let method = "";
    server.use(
      http.delete("*/admin/careers/abc", ({ request }) => {
        method = request.method;
        return HttpResponse.json({ message: "Career deleted" });
      }),
    );

    await expect(deleteAdminCareer("abc")).resolves.toBeUndefined();
    expect(method).toBe("DELETE");
  });

  it.each([
    [400, "This career no longer exists."],
    [404, "This career no longer exists."],
    [403, "Only admins can delete careers."],
    [
      409,
      "Only a draft that was never published and hasn’t been saved by anyone can be deleted.",
    ],
    [500, "We couldn’t delete this career. Please try again."],
  ])("explains a %i in plain words", async (status, message) => {
    server.use(
      http.delete("*/admin/careers/abc", () =>
        HttpResponse.json({ error: "CONFLICT", message: "raw server text" }, { status }),
      ),
    );

    await expect(deleteAdminCareer("abc")).rejects.toThrow(message);
  });
});

const snapshot: CareerRevisionSnapshot = {
  schemaVersion: 1,
  career: {
    title: "DevOps Engineer",
    slug: "devops-engineer",
    description: "Automates how software is built, tested and deployed.",
    roleSummary: "",
    fieldId: "field-1",
    targetLevels: ["STUDENT"],
    exampleActivities: [],
    typicalEducationNote: "",
    certificationsNote: "",
  },
  pathway: { title: "DevOps Roadmap", description: "" },
  steps: [],
  skills: [],
  outlook: [],
  resources: [],
};

const saved = {
  id: "rev-1",
  careerId: "abc",
  status: "DRAFT",
  baseVersion: 3,
  created: false,
  updatedAt: "2026-10-28T17:30:00.000Z",
};

describe("saveCareerRevision", () => {
  it("PUTs the whole snapshot and returns the saved revision", async () => {
    let received: unknown;
    let method = "";
    server.use(
      http.put("*/admin/careers/abc/revision", async ({ request }) => {
        method = request.method;
        received = await request.json();
        return HttpResponse.json(saved);
      }),
    );

    await expect(saveCareerRevision("abc", snapshot)).resolves.toEqual(saved);
    expect(method).toBe("PUT");
    expect(received).toEqual(snapshot);
  });

  it("accepts a response wrapped in data", async () => {
    server.use(
      http.put("*/admin/careers/abc/revision", () => HttpResponse.json({ data: saved })),
    );

    await expect(saveCareerRevision("abc", snapshot)).resolves.toEqual(saved);
  });

  it("returns what is wrong with an inconsistent snapshot", async () => {
    server.use(
      http.put("*/admin/careers/abc/revision", () =>
        HttpResponse.json(
          {
            error: "BAD_REQUEST",
            code: "INVALID_SNAPSHOT",
            details: { problems: ["Step 2 uses an unknown skill", "Two steps share order 1"] },
          },
          { status: 400 },
        ),
      ),
    );

    const error = (await saveCareerRevision("abc", snapshot).catch(
      (e: unknown) => e,
    )) as RevisionSaveError;

    expect(error).toBeInstanceOf(RevisionSaveError);
    expect(error.code).toBe("INVALID_SNAPSHOT");
    expect(error.problems).toEqual(["Step 2 uses an unknown skill", "Two steps share order 1"]);
  });

  it("says which revision is in review so it can be recalled", async () => {
    server.use(
      http.put("*/admin/careers/abc/revision", () =>
        HttpResponse.json(
          { code: "REVISION_IN_REVIEW", details: { revisionId: "rev-9" } },
          { status: 409 },
        ),
      ),
    );

    const error = (await saveCareerRevision("abc", snapshot).catch(
      (e: unknown) => e,
    )) as RevisionSaveError;

    expect(error.message).toBe("These changes are in review. Recall them before editing.");
    expect(error.code).toBe("REVISION_IN_REVIEW");
    expect(error.revisionId).toBe("rev-9");
  });

  it.each([
    [400, undefined, "Check the career details and try again."],
    [403, undefined, "Only editors and above can save changes."],
    [404, undefined, "This career no longer exists."],
    [409, "CAREER_RETIRED", "This career is retired, so it can’t be changed."],
    [500, undefined, "We couldn’t save this career. Please try again."],
  ])("explains a %i (%s) in plain words", async (status, code, message) => {
    server.use(
      http.put("*/admin/careers/abc/revision", () =>
        HttpResponse.json({ code, message: "raw server text" }, { status }),
      ),
    );

    await expect(saveCareerRevision("abc", snapshot)).rejects.toThrow(message);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.put("*/admin/careers/abc/revision", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(saveCareerRevision("abc", snapshot)).rejects.toThrow(
      "Your session has expired. Sign in again to save.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.put("*/admin/careers/abc/revision", () => HttpResponse.error()));

    await expect(saveCareerRevision("abc", snapshot)).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});
