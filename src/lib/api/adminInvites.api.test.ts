import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchAdminInvites, fetchAllAdminInvites, revokeAdminInvite } from "./adminInvites.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const invite = (id: string) => ({
  id,
  email: `${id}@example.com`,
  role: "EDITOR",
  status: "PENDING",
  invitedById: "u1",
  invitedByName: "Ada Lovelace",
  createdAt: "2026-10-27T07:31:28.842Z",
  expiresAt: "2026-11-03T07:31:28.842Z",
  acceptedAt: null,
  revokedAt: null,
});

const captureQuery = () => {
  const seen = { query: "" };
  server.use(
    http.get("*/admin/teams/invites", ({ request }) => {
      seen.query = new URL(request.url).search;
      return HttpResponse.json({ items: [], total: 0, page: 1, limit: 6 });
    }),
  );
  return seen;
};

describe("fetchAdminInvites", () => {
  it("returns the page the API sends", async () => {
    server.use(
      http.get("*/admin/teams/invites", () =>
        HttpResponse.json({ items: [invite("a"), invite("b")], total: 42, page: 2, limit: 6 }),
      ),
    );

    const result = await fetchAdminInvites({ page: 2, limit: 6 });

    expect(result.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(result).toMatchObject({ total: 42, page: 2, limit: 6 });
  });

  it("sends page, limit and the status filter", async () => {
    const seen = captureQuery();

    await fetchAdminInvites({ status: "EXPIRED", page: 3, limit: 6 });

    const params = new URLSearchParams(seen.query);
    expect(params.get("status")).toBe("EXPIRED");
    expect(params.get("page")).toBe("3");
    expect(params.get("limit")).toBe("6");
  });

  it("leaves status out when showing every invite", async () => {
    const seen = captureQuery();

    await fetchAdminInvites({ page: 1, limit: 6 });

    expect(new URLSearchParams(seen.query).has("status")).toBe(false);
  });

  it("reads a { data } wrapped body and tolerates missing fields", async () => {
    server.use(
      http.get("*/admin/teams/invites", () => HttpResponse.json({ data: { items: [invite("a")] } })),
    );

    expect(await fetchAdminInvites({ page: 1, limit: 6 })).toMatchObject({
      total: 1,
      page: 1,
      limit: 6,
    });
  });

  it("rejects when the user is not an admin", async () => {
    server.use(http.get("*/admin/teams/invites", () => HttpResponse.json({}, { status: 403 })));

    await expect(fetchAdminInvites({ page: 1, limit: 6 })).rejects.toThrow();
  });
});

describe("revokeAdminInvite", () => {
  it("sends DELETE for the invite id", async () => {
    let method = "";
    server.use(
      http.delete("*/admin/teams/invites/abc", ({ request }) => {
        method = request.method;
        return HttpResponse.json({ message: "Invite revoked" });
      }),
    );

    await expect(revokeAdminInvite("abc")).resolves.toBeUndefined();
    expect(method).toBe("DELETE");
  });

  it.each([
    [403, "Only admins can revoke invites."],
    [404, "This invite no longer exists."],
    [400, "This invite no longer exists."],
    [409, "This invite was already accepted, has expired or was already revoked."],
    [500, "We couldn’t revoke this invite. Please try again."],
  ])("explains a %i in plain words", async (status, message) => {
    server.use(
      http.delete("*/admin/teams/invites/abc", () =>
        HttpResponse.json({ error: "CONFLICT", message: "raw server text" }, { status }),
      ),
    );

    await expect(revokeAdminInvite("abc")).rejects.toThrow(message);
  });
});

describe("fetchAllAdminInvites", () => {
  it("asks for one status and follows pages until total is collected", async () => {
    const seen: { status: string | null; page: string | null }[] = [];
    const all = Array.from({ length: 5 }, (_, i) => invite(`i${i}`));
    server.use(
      http.get("*/admin/teams/invites", ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page"));
        seen.push({ status: url.searchParams.get("status"), page: url.searchParams.get("page") });
        // The server caps pages at 2 whatever limit is asked for.
        return HttpResponse.json({
          items: all.slice((page - 1) * 2, page * 2),
          total: 5,
          page,
          limit: 2,
        });
      }),
    );

    const result = await fetchAllAdminInvites("ACCEPTED");

    expect(result.map((i) => i.id)).toEqual(["i0", "i1", "i2", "i3", "i4"]);
    expect(seen.map((s) => s.status)).toEqual(["ACCEPTED", "ACCEPTED", "ACCEPTED"]);
    expect(seen.map((s) => s.page)).toEqual(["1", "2", "3"]);
  });

  it("stops when the server keeps repeating the same page", async () => {
    let calls = 0;
    server.use(
      http.get("*/admin/teams/invites", () => {
        calls += 1;
        return HttpResponse.json({ items: [invite("a")], total: 99, page: 1, limit: 1 });
      }),
    );

    expect(await fetchAllAdminInvites("ACCEPTED")).toHaveLength(1);
    expect(calls).toBe(2);
  });
});
