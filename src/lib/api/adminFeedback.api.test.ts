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

  it("follows pages until every report in `total` is collected", async () => {
    const requested: string[] = [];
    server.use(
      http.get("*/admin/feedback", ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        requested.push(String(page));
        return HttpResponse.json({ items: [item(`p${page}`)], total: 3, page, limit: 1 });
      }),
    );

    expect((await fetchAdminFeedback()).map((f) => f.id)).toEqual(["p1", "p2", "p3"]);
    expect(requested).toEqual(["1", "2", "3"]);
  });

  it("keeps going when the server caps the page size below what was asked", async () => {
    const all = Array.from({ length: 42 }, (_, i) => item(`r${i}`));
    server.use(
      http.get("*/admin/feedback", ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        // The server ignores limit=100 and always sends 20.
        return HttpResponse.json({
          items: all.slice((page - 1) * 20, page * 20),
          total: 42,
          page,
          limit: 20,
        });
      }),
    );

    expect(await fetchAdminFeedback()).toHaveLength(42);
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
  const page = (count: number, total?: number) => ({
    items: Array.from({ length: count }, (_, i) => item(`x${i}`)) as never[],
    total,
  });

  it("never asks for more after an empty page", () => {
    expect(hasMorePages(page(0, 9), 0)).toBe(false);
  });

  it("compares what has been collected with the total", () => {
    expect(hasMorePages(page(20, 42), 20)).toBe(true);
    expect(hasMorePages(page(2, 42), 42)).toBe(false);
  });

  it("treats a full page as possibly more when there is no total", () => {
    expect(hasMorePages(page(100), 100)).toBe(true);
    expect(hasMorePages(page(40), 40)).toBe(false);
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
