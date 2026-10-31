import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  CreateCareerError,
  RevisionSaveError,
  createAdminCareer,
  deleteAdminCareer,
  fetchAdminCareer,
  fetchAdminCareers,
  fetchAllAdminCareers,
  saveCareerRevision,
} from "./adminCareers.api";
import type { CreateCareerInput } from "../../features/admin/adminCareers.types";
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
    [409, "REVISION_IN_REVIEW", "These changes are in review. Recall them before editing."],
    // Other 409 codes are not guessed at.
    [409, "SOMETHING_ELSE", "We couldn’t save this career. Please try again."],
    [409, undefined, "We couldn’t save this career. Please try again."],
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

const newCareer: CreateCareerInput = {
  title: "DevOps Engineer",
  slug: "devops-engineer",
  fieldId: "field-1",
  description: "Automates how software is built, tested and deployed.",
  roleSummary: "Builds and runs the pipelines that ship software.",
  targetLevels: ["RECENT_GRAD", "EARLY_CAREER"],
};

const created = {
  id: "career-1",
  slug: "devops-engineer",
  title: "DevOps Engineer",
  description: newCareer.description,
  roleSummary: null,
  fieldId: "field-1",
  targetLevels: ["RECENT_GRAD"],
  status: "DRAFT",
  version: 1,
  createdAt: "2026-10-28T10:30:00.000Z",
  revision: { id: "rev-1", status: "DRAFT", baseVersion: 1 },
};

describe("createAdminCareer", () => {
  it("POSTs the career and returns it with its first revision", async () => {
    let received: unknown;
    let method = "";
    server.use(
      http.post("*/admin/careers", async ({ request }) => {
        method = request.method;
        received = await request.json();
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    await expect(createAdminCareer(newCareer)).resolves.toEqual(created);
    expect(method).toBe("POST");
    expect(received).toEqual(newCareer);
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.post("*/admin/careers", () => HttpResponse.json({ data: created })));

    await expect(createAdminCareer(newCareer)).resolves.toEqual(created);
  });

  it.each([
    [400, "FIELD_NOT_FOUND", "That field no longer exists. Pick another one."],
    [400, "VALIDATION_ERROR", "Check the career details and try again."],
    [403, undefined, "Only editors and above can create careers."],
    [409, "CAREER_TITLE_TAKEN", "Another career already has this title."],
    [409, "CAREER_SLUG_TAKEN", "Another career already uses this slug."],
    // Other 409 codes are not guessed at.
    [409, "SOMETHING_ELSE", "We couldn’t create this career. Please try again."],
    [409, undefined, "We couldn’t create this career. Please try again."],
    [500, undefined, "We couldn’t create this career. Please try again."],
  ])("explains a %i %s in plain words and keeps the code", async (status, code, message) => {
    server.use(
      http.post("*/admin/careers", () =>
        HttpResponse.json({ code, message: "raw server text" }, { status }),
      ),
    );

    const error = (await createAdminCareer(newCareer).catch((e: unknown) => e)) as CreateCareerError;

    expect(error).toBeInstanceOf(CreateCareerError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.post("*/admin/careers", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(createAdminCareer(newCareer)).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.post("*/admin/careers", () => HttpResponse.error()));

    await expect(createAdminCareer(newCareer)).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});

const listItem = (id: string, status = "DRAFT") => ({
  id,
  slug: id,
  title: `Career ${id}`,
  status,
  version: 1,
  updatedAt: "2026-10-28T10:30:00.000Z",
  field: { name: "Technology", slug: "technology" },
});

describe("fetchAdminCareers", () => {
  it("returns careers in any status and sends the filters it is given", async () => {
    let query = "";
    server.use(
      http.get("*/admin/careers", ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({
          items: [listItem("a", "DRAFT"), listItem("b", "RETIRED")],
          total: 2,
          page: 1,
          limit: 20,
        });
      }),
    );

    const result = await fetchAdminCareers({ status: "DRAFT", search: "dev", page: 2, limit: 20 });

    expect(result.items.map((c) => c.status)).toEqual(["DRAFT", "RETIRED"]);
    const params = new URLSearchParams(query);
    expect(params.get("status")).toBe("DRAFT");
    expect(params.get("search")).toBe("dev");
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("20");
  });

  it("copes with a response that leaves out the paging fields", async () => {
    server.use(http.get("*/admin/careers", () => HttpResponse.json({ items: [listItem("a")] })));

    await expect(fetchAdminCareers()).resolves.toMatchObject({ total: 1, page: 1 });
  });
});

describe("fetchAllAdminCareers", () => {
  it("follows pages until it has every career", async () => {
    const pages: number[] = [];
    server.use(
      http.get("*/admin/careers", ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        pages.push(page);
        return HttpResponse.json({
          items: page === 1 ? [listItem("a"), listItem("b")] : [listItem("c")],
          total: 3,
          page,
          limit: 2,
        });
      }),
    );

    const all = await fetchAllAdminCareers();

    expect(all.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(pages).toEqual([1, 2]);
  });

  it("stops when a page repeats instead of looping forever", async () => {
    let calls = 0;
    server.use(
      http.get("*/admin/careers", () => {
        calls += 1;
        return HttpResponse.json({ items: [listItem("a")], total: 99, page: 1, limit: 1 });
      }),
    );

    await expect(fetchAllAdminCareers()).resolves.toHaveLength(1);
    expect(calls).toBe(2);
  });
});

describe("fetchAdminCareer", () => {
  const raw = {
    ...listItem("abc"),
    description: "Automates delivery.",
    roleSummary: null,
    exampleActivities: [],
    typicalEducationNote: null,
    certificationsNote: null,
    targetLevels: ["STUDENT"],
    publishedAt: null,
    createdAt: "2026-10-28T10:30:00.000Z",
    field: { id: "f1", name: "Technology", slug: "technology" },
    skills: [{ id: "s1", name: "Git", importance: "REQUIRED" }],
    outlook: [
      {
        id: "o1",
        type: "SALARY",
        geography: "Lagos",
        period: "2026",
        median: "230000.00",
        percentile25: null,
        percentile75: null,
        currency: "NGN",
        payPeriod: "MONTHLY",
        grossOrNet: null,
        experienceLevel: null,
        baseYear: null,
        baseValue: null,
        projectedYear: null,
        projectedValue: null,
        growthPercent: null,
        demandLevel: null,
        updatedAt: "2026-10-01T00:00:00.000Z",
        source: { id: "src1", name: "Jobberman 2026", url: "https://example.com", lastCheckedAt: null },
      },
    ],
    pathway: {
      id: "p1",
      title: "DevOps Roadmap",
      description: "Learn it.",
      steps: [
        {
          id: "st1",
          order: 1,
          title: "Linux",
          description: null,
          learningObjective: "Use a shell",
          prerequisites: null,
          expectedActivity: "Practice",
          skills: [{ id: "s1", name: "Git" }],
          resources: [
            {
              id: "r1",
              title: "Course",
              url: "https://example.com/c",
              type: "COURSE",
              provider: "Acme",
              costStatus: "FREE",
              status: "ACTIVE",
              lastCheckedDate: "2026-10-01",
            },
            {
              id: "r2",
              title: "Old course",
              url: "https://example.com/old",
              type: "COURSE",
              provider: "Acme",
              costStatus: "FREE",
              status: "WITHDRAWN",
              lastCheckedDate: "2026-01-01",
            },
          ],
        },
      ],
    },
  };

  it("loads a draft, which the public endpoint would 404 on", async () => {
    server.use(http.get("*/admin/careers/abc", () => HttpResponse.json(raw)));

    const view = await fetchAdminCareer("abc");

    expect(view.detail.status).toBe("DRAFT");
    expect(view.version).toBe(1);
  });

  it("turns the admin shapes into the ones the editor uses", async () => {
    server.use(http.get("*/admin/careers/abc", () => HttpResponse.json({ data: raw })));

    const { detail, pathway } = await fetchAdminCareer("abc");

    // Null text becomes empty text; the outlook's source object becomes a name and a link.
    expect(detail.roleSummary).toBe("");
    expect(detail.typicalEducationNote).toBe("");
    expect(detail.outlook[0]).toMatchObject({ source: "Jobberman 2026", sourceUrl: "https://example.com" });
    expect(detail.pathway).toEqual({ id: "p1", title: "DevOps Roadmap", stepCount: 1 });
    // The pathway comes along with its steps, without the withdrawn resource.
    expect(pathway?.steps[0].description).toBe("");
    expect(pathway?.steps[0].resources.map((r) => r.id)).toEqual(["r1"]);
  });

  it("copes with a career that has no pathway or source yet", async () => {
    server.use(
      http.get("*/admin/careers/abc", () =>
        HttpResponse.json({ ...raw, pathway: null, outlook: [{ ...raw.outlook[0], source: null }] }),
      ),
    );

    const { detail, pathway } = await fetchAdminCareer("abc");

    expect(pathway).toBeNull();
    expect(detail.pathway).toBeNull();
    expect(detail.outlook[0]).toMatchObject({ source: "", sourceUrl: null });
  });
});
