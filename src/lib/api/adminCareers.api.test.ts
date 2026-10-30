import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { deleteAdminCareer } from "./adminCareers.api";

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
