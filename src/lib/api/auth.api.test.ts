import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  AcceptInviteError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  acceptInvite,
  loginUser,
  loginWithGoogle,
  passwordResetConfirm,
  passwordResetRequest,
  registerUser,
  resendVerification,
  verifyEmail,
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

  it("shows a server-side message for 500 responses", async () => {
    server.use(
      http.post("*/auth/login", () => HttpResponse.json({}, { status: 500 })),
    );

    await expect(
      loginUser({ email: "user@example.com", password: "Password123!" }),
    ).rejects.toThrow("Something went wrong on our side. Please try again.");
  });

  it("shows a connection message on network errors", async () => {
    server.use(http.post("*/auth/login", () => HttpResponse.error()));

    await expect(
      loginUser({ email: "user@example.com", password: "Password123!" }),
    ).rejects.toThrow("We couldn't reach the server");
  });

  it("does not refresh or show the password error when Google sign-in fails", async () => {
    let refreshCallCount = 0;

    server.use(
      http.post("*/auth/google", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCallCount += 1;
        return HttpResponse.json({ data: { accessToken: "fresh-token" } });
      }),
    );

    const error = await loginWithGoogle("id-token").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(InvalidCredentialsError);
    expect(refreshCallCount).toBe(0);
  });

  it("registers without expecting tokens and returns the verification email", async () => {
    server.use(
      http.post("*/auth/register", () =>
        HttpResponse.json(
          { message: "Verification code sent", email: "user@example.com" },
          { status: 201 },
        ),
      ),
    );

    await expect(
      registerUser({
        fullName: "Ada Obi",
        email: "user@example.com",
        password: "Password123!",
      }),
    ).resolves.toEqual({
      message: "Verification code sent",
      email: "user@example.com",
    });
  });

  it("verifies an email and returns the session, or explains a bad code", async () => {
    server.use(
      http.post("*/auth/verify-email", async ({ request }) => {
        const { otp } = (await request.json()) as { otp: string };
        return otp === "123456"
          ? HttpResponse.json({
              accessToken: "token",
              user: { id: "1", email: "user@example.com", role: "user" },
            })
          : HttpResponse.json({}, { status: 400 });
      }),
    );

    await expect(verifyEmail("user@example.com", "123456")).resolves.toMatchObject(
      { accessToken: "token" },
    );
    await expect(verifyEmail("user@example.com", "000000")).rejects.toThrow(
      "invalid or has expired",
    );
  });

  it.each([
    ["/auth/register", () => registerUser({ fullName: "A", email: "a@a.com", password: "x" })],
    ["/auth/login", () => loginUser({ email: "a@a.com", password: "x" })],
    ["/auth/google", () => loginWithGoogle("id-token")],
    ["/auth/verify-email", () => verifyEmail("a@a.com", "123456")],
    ["/auth/resend-verification", () => resendVerification("a@a.com")],
    ["/auth/password-reset/request", () => passwordResetRequest("a@a.com")],
    ["/auth/password-reset/confirm", () => passwordResetConfirm("new-password", "token")],
  ])("does not try to refresh the session when %s returns 401", async (path, call) => {
    let refreshCallCount = 0;
    server.use(
      http.post(`*${path}`, () =>
        HttpResponse.json({ message: "unauthorized" }, { status: 401 }),
      ),
      http.post("*/auth/refresh", () => {
        refreshCallCount += 1;
        return HttpResponse.json({ data: { accessToken: "fresh-token" } });
      }),
    );

    await expect(call()).rejects.toBeTruthy();
    expect(refreshCallCount).toBe(0);
  });
});

describe("acceptInvite", () => {
  const session = {
    accessToken: "new-token",
    user: { id: "u1", email: "ada@example.com", role: "EDITOR" },
  };

  it("POSTs the token from the link and returns the fresh session", async () => {
    let received: unknown;
    server.use(
      http.post("*/auth/invites/accept", async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(session);
      }),
    );

    await expect(acceptInvite("tok-123")).resolves.toEqual(session);
    expect(received).toEqual({ token: "tok-123" });
  });

  it("accepts a response wrapped in data", async () => {
    server.use(http.post("*/auth/invites/accept", () => HttpResponse.json({ data: session })));

    await expect(acceptInvite("tok")).resolves.toEqual(session);
  });

  it.each([
    [
      403,
      "INVITE_EMAIL_MISMATCH",
      "This invite was sent to a different email address. Sign in with the email it was sent to.",
    ],
    [
      403,
      "EMAIL_NOT_VERIFIED",
      "Verify your email address first, then open the invite link again.",
    ],
    [
      404,
      "INVITE_NOT_FOUND",
      "This invite link isn’t valid, or it was revoked. Ask the person who invited you to send a new one.",
    ],
    [409, "INVITE_ALREADY_ACCEPTED", "This invite has already been accepted."],
    // Other 403 and 409 codes are not guessed at.
    [403, "SOMETHING_ELSE", "We couldn’t accept this invite. Please try again."],
    [403, undefined, "We couldn’t accept this invite. Please try again."],
    [409, "SOMETHING_ELSE", "We couldn’t accept this invite. Please try again."],
    [409, undefined, "We couldn’t accept this invite. Please try again."],
    [
      410,
      "INVITE_EXPIRED",
      "This invite has expired. Ask the person who invited you to send a new one.",
    ],
    [500, undefined, "We couldn’t accept this invite. Please try again."],
  ])("explains a %i %s in plain words and keeps the code", async (status, code, message) => {
    server.use(
      http.post("*/auth/invites/accept", () =>
        HttpResponse.json({ code, message: "raw server text" }, { status }),
      ),
    );

    const error = (await acceptInvite("tok").catch((e: unknown) => e)) as AcceptInviteError;

    expect(error).toBeInstanceOf(AcceptInviteError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it("explains a network failure", async () => {
    server.use(http.post("*/auth/invites/accept", () => HttpResponse.error()));

    await expect(acceptInvite("tok")).rejects.toThrow(
      "We couldn’t reach the server. Check your connection and try again.",
    );
  });
});
