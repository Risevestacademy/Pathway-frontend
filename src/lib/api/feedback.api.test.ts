import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { submitFeedback, type SubmitFeedbackInput } from "./feedback.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const input: SubmitFeedbackInput = {
  category: "INCORRECT_CONTENT",
  description: "Salary looks too high",
  section: "OUTLOOK",
  careerId: "6f1c2a7e-0d4b-4b8e-9f53-2a1e7c9d0b11",
  platform: "WEB",
};

describe("submitFeedback", () => {
  it("posts the report as given", async () => {
    let body: unknown;
    server.use(
      http.post("*/feedback", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: "Feedback received" }, { status: 201 });
      }),
    );

    await submitFeedback(input);

    expect(body).toEqual(input);
  });

  it("explains the rate limit", async () => {
    server.use(http.post("*/feedback", () => new HttpResponse(null, { status: 429 })));

    await expect(submitFeedback(input)).rejects.toThrow(/sent a few reports/);
  });

  it("asks the learner to check the details on a 400", async () => {
    server.use(http.post("*/feedback", () => new HttpResponse(null, { status: 400 })));

    await expect(submitFeedback(input)).rejects.toThrow(/Check the details/);
  });

  it("says when the server can't be reached", async () => {
    server.use(http.post("*/feedback", () => HttpResponse.error()));

    await expect(submitFeedback(input)).rejects.toThrow(/couldn’t reach the server/);
  });
});
