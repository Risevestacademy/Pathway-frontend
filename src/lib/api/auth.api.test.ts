import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  loginUser,
  registerUser,
} from "./auth.api";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("auth API", () => {
  it("shows invalid credentials without attempting a token refresh", async () => {
    let refreshCallCount = 0;

    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ message: "invalid credentials" }, { status: 401 }),
      ),
      http.post("*/auth/refresh", () => {
        refreshCallCount += 1;
        return HttpResponse.json({ data: { accessToken: "fresh-token" } });
      }),
    );

    await expect(
      loginUser({ email: "user@example.com", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(refreshCallCount).toBe(0);
  });

  it("shows the duplicate-email message when registration conflicts", async () => {
    server.use(
      http.post("*/auth/register", () =>
        HttpResponse.json({ message: "email already registered" }, { status: 409 }),
      ),
    );

    await expect(
      registerUser({
        fullName: "Test User",
        email: "user@example.com",
        password: "Password123!",
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });
});
