import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { DeleteRevisionError, deleteRevision } from "./adminRevisions.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("deleteRevision", () => {
  it("sends DELETE for the revision id", async () => {
    let method = "";
    server.use(
      http.delete("*/admin/revisions/rev-1", ({ request }) => {
        method = request.method;
        return HttpResponse.json({ message: "Draft revision deleted" });
      }),
    );

    await expect(deleteRevision("rev-1")).resolves.toBeUndefined();
    expect(method).toBe("DELETE");
  });

  it("keeps an unusual id from changing the request path", async () => {
    let path = "";
    server.use(
      http.delete("*/admin/revisions/*", ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ message: "Draft revision deleted" });
      }),
    );

    await deleteRevision("a/b");

    expect(path.endsWith("/admin/revisions/a%2Fb")).toBe(true);
  });

  it.each([
    [400, undefined, "This draft no longer exists."],
    [404, undefined, "This draft no longer exists."],
    [403, undefined, "Only editors and above can discard drafts."],
    [
      409,
      "INVALID_REVISION_STATE",
      "Only a draft can be discarded. This change is already in review or has been decided.",
    ],
    // Other 409 codes are not guessed at.
    [409, "SOMETHING_ELSE", "We couldn’t discard this draft. Please try again."],
    [409, undefined, "We couldn’t discard this draft. Please try again."],
    [500, undefined, "We couldn’t discard this draft. Please try again."],
  ])("explains a %i %s in plain words and keeps the code", async (status, code, message) => {
    server.use(
      http.delete("*/admin/revisions/rev-1", () =>
        HttpResponse.json({ code, message: "raw server text" }, { status }),
      ),
    );

    const error = (await deleteRevision("rev-1").catch((e: unknown) => e)) as DeleteRevisionError;

    expect(error).toBeInstanceOf(DeleteRevisionError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it("explains an expired session once a token refresh fails", async () => {
    server.use(
      http.delete("*/admin/revisions/rev-1", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
    );

    await expect(deleteRevision("rev-1")).rejects.toThrow(
      "Your session has expired. Sign in again to continue.",
    );
  });

  it("explains a network failure", async () => {
    server.use(http.delete("*/admin/revisions/rev-1", () => HttpResponse.error()));

    await expect(deleteRevision("rev-1")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});
