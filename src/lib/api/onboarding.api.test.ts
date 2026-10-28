import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchOnboardingOptions } from "./onboarding.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const options = {
  educationLevels: [{ value: "BACHELOR", label: "Bachelor's degree" }],
  internshipOptions: [],
  experienceOptions: [],
  skills: [],
  fields: [],
};

describe("fetchOnboardingOptions", () => {
  it("returns the options on success", async () => {
    server.use(
      http.get("*/onboarding/options", () => HttpResponse.json(options)),
    );
    await expect(fetchOnboardingOptions()).resolves.toEqual(options);
  });

  it("throws on a server error so the screen can offer a retry", async () => {
    server.use(
      http.get("*/onboarding/options", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    await expect(fetchOnboardingOptions()).rejects.toThrow();
  });
});