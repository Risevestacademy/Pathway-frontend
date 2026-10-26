import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchAdminFeedback, hasMorePages, updateFeedbackStatus } from "./adminFeedback.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const item = (id: string) => ({
  id,
  category: "BROKEN_LINK",
  section: "RESOURCES",
  careerId: null,
  description: "",
  userEmail: "a@b.co",
  platform: "WEB",
  status: "NEW",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("fetchAdminFeedback", () => {
  it("reads a bare array", async () => {
    server.use(http.get("*/admin/feedback", () => HttpResponse.json([item("1"), item("2")])));

    expect((await fetchAdminFeedback()).map((f) => f.id)).toEqual(["1", "2"]);
  });

  it("reads { data: { items } }", async () => {
    server.use(
      http.get("*/admin/feedback", () => HttpResponse.json({ data: { items: [item("1")] } })),
    );

    expect((await fetchAdminFeedback()).map((f) => f.id)).toEqual(["1"]);
  });

  it("returns nothing for an unexpected body", async () => {
    server.use(http.get("*/admin/feedback", () => HttpResponse.json({ data: null })));

    expect(await fetchAdminFeedback()).toEqual([]);
  });

  it("follows pages until totalPages", async () => {
    const requested: string[] = [];
    server.use(
      http.get("*/admin/feedback", ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        requested.push(String(page));
        return HttpResponse.json({ data: { items: [item(`p${page}`)], page, totalPages: 3 } });
      }),
    );

    expect((await fetchAdminFeedback()).map((f) => f.id)).toEqual(["p1", "p2", "p3"]);
    expect(requested).toEqual(["1", "2", "3"]);
  });

  it("stops when the server ignores paging and repeats the same items", async () => {
    let calls = 0;
    server.use(
      http.get("*/admin/feedback", () => {
        calls += 1;
        return HttpResponse.json(Array.from({ length: 100 }, (_, i) => item(`r${i}`)));
      }),
    );

    expect(await fetchAdminFeedback()).toHaveLength(100);
    expect(calls).toBe(2);
  });
});

describe("hasMorePages", () => {
  it("never asks for more after an empty page", () => {
    expect(hasMorePages({ totalPages: 9 }, 1, 0, 0)).toBe(false);
  });

  it("uses hasNext and total when there is no totalPages", () => {
    expect(hasMorePages({ hasNext: true }, 1, 10, 10)).toBe(true);
    expect(hasMorePages({ meta: { hasNext: false } }, 1, 10, 10)).toBe(false);
    expect(hasMorePages({ pagination: { total: 150 } }, 1, 100, 100)).toBe(true);
    expect(hasMorePages({ pagination: { total: 100 } }, 1, 100, 100)).toBe(false);
  });

  it("treats a full page as possibly more when there is no paging info", () => {
    expect(hasMorePages([], 1, 100, 100)).toBe(true);
    expect(hasMorePages([], 1, 40, 40)).toBe(false);
  });
});

describe("updateFeedbackStatus", () => {
  it("patches the status and unwraps the report", async () => {
    let body: unknown;
    server.use(
      http.patch("*/admin/feedback/7/status", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { ...item("7"), status: "RESOLVED" } });
      }),
    );

    const updated = await updateFeedbackStatus("7", "RESOLVED");

    expect(body).toEqual({ status: "RESOLVED" });
    expect(updated.status).toBe("RESOLVED");
  });
});
