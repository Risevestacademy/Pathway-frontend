import { isAxiosError } from "axios";
import { api, refreshAccessToken } from "./axios";
import { selectIsAuthenticated, useAuthStore } from "../stores/authStore";

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends RegisterCredentials {
  fullName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  /** Present when the backend sends the person's name. */
  fullName?: string;
  name?: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("This email is already registered.");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password, or your email hasn't been verified yet.");
    this.name = "InvalidCredentialsError";
  }
}

function getAuthRequestError(error: unknown, fallbackMessage: string): Error {
  if (!isAxiosError(error)) {
    return new Error(fallbackMessage);
  }

  switch (error.response?.status) {
    case 400:
      return new Error("Please check your details and try again.");
    case 401:
      return new InvalidCredentialsError();
    case 409:
      return new EmailAlreadyRegisteredError();
    case 429:
      return new Error("Too many attempts. Please wait a moment and try again.");
    case 500:
    case 502:
    case 503:
      return new Error("Something went wrong on our side. Please try again.");
    default:
      return new Error(
        error.response
          ? "We couldn't complete your request. Please try again."
          : "We couldn't reach the server. Check your connection and try again.",
      );
  }
}

function getGoogleAuthError(error: unknown): Error {
  if (!isAxiosError(error)) {
    return new Error("We couldn't sign you in with Google. Please try again.");
  }

  switch (error.response?.status) {
    case 400:
      return new Error("Google sign-in could not be completed. Please try again.");
    case 401:
      return new Error("Google sign-in was not accepted. Please try again.");
    case 429:
      return new Error("Too many attempts. Please wait a moment and try again.");
    case 500:
    case 502:
    case 503:
      return new Error("Something went wrong on our side. Please try again.");
    default:
      return new Error(
        error.response
          ? "We couldn't complete Google sign-in. Please try again."
          : "We couldn't reach the server. Check your connection and try again.",
      );
  }
}

export async function registerUser(
  credentials: SignupCredentials,
): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse | { data: RegisterResponse }>(
      "/auth/register",
      credentials,
      { skipAuthRefresh: true },
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAuthRequestError(error, "We couldn't create your account. Please try again.");
  }
}

export async function loginUser(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse | { data: AuthResponse }>(
      "/auth/login",
      credentials,
      { skipAuthRefresh: true },
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAuthRequestError(error, "We couldn't log you in. Please try again.");
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse | { data: AuthResponse }>(
      "/auth/google",
      { idToken },
      { skipAuthRefresh: true },
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getGoogleAuthError(error);
  }
}

export async function verifyEmail(
  email: string,
  otp: string,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse | { data: AuthResponse }>(
      "/auth/verify-email",
      { email, otp },
      { skipAuthRefresh: true },
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 400) {
      throw new Error("That code is invalid or has expired. Request a new one.", {
        cause: error,
      });
    }
    throw getAuthRequestError(
      error,
      "We couldn't verify your email. Please try again.",
    );
  }
}

export async function resendVerification(email: string): Promise<void> {
  try {
    await api.post(
      "/auth/resend-verification",
      { email },
      { skipAuthRefresh: true },
    );
  } catch (error) {
    throw getAuthRequestError(
      error,
      "We couldn't resend the code. Please try again.",
    );
  }
}

/** Signs the current person out: ends the session on the server (best effort) and clears it here. */
export async function signOut(): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) await logoutWithToken(accessToken);
  useAuthStore.getState().clearAuth();
}

/** Ends a session started with a token that was never stored (e.g. a probe login). */
export async function logoutWithToken(accessToken: string): Promise<void> {
  try {
    await api.post(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        skipAuthRefresh: true,
      },
    );
  } catch {
    // Best effort: the caller only wants the session gone.
  }
}

let hydrationPromise: Promise<void> | null = null;

export class PasswordResetError extends Error {
  readonly messages: string[];

  constructor(messages: string[], cause: unknown) {
    super(messages.join(", "), { cause });
    this.name = "PasswordResetError";
    this.messages = messages;
  }
}

export function ensureAuthHydrated(): Promise<void> {
  if (selectIsAuthenticated(useAuthStore.getState())) {
    return Promise.resolve();
  }

  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = hydrateAuth();

  return hydrationPromise;
}

async function hydrateAuth(): Promise<void> {
  try {
    const accessToken = await refreshAccessToken();

    const userResponse = await api.get("/auth/me");
    useAuthStore.getState().setAuth(userResponse.data.data, accessToken);
  } catch {
    useAuthStore.getState().clearAuth();
    hydrationPromise = null;
  } finally {
    useAuthStore.getState().finishHydrating();
  }
}

export async function passwordResetRequest(email: string): Promise<void> {
  await api.post(
    "/auth/password-reset/request",
    { email },
    { skipAuthRefresh: true },
  );
}

export async function passwordResetConfirm(
  newPassword: string,
  token: string,
): Promise<void> {
  try {
    await api.post(
      "/auth/password-reset/confirm",
      { newPassword, token },
      { skipAuthRefresh: true },
    );
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.data?.error === "VALIDATION_ERROR") {
        const messages = Object.values(
          error.response?.data?.fields ?? {},
        ).filter((message): message is string => typeof message === "string");
        throw new PasswordResetError(
          messages.length > 0 ? messages : ["Failed to reset password"],
          error,
        );
      } else {
        throw new PasswordResetError(
          [error.response?.data?.message || "Failed to reset password"],
          error,
        );
      }
    }
    throw error;
  }
}

/** An error from accepting an invite, with the server's code when it sends one. */
export class AcceptInviteError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AcceptInviteError";
    this.code = code;
  }
}

function getAcceptInviteError(error: unknown): AcceptInviteError {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const body = (isAxiosError(error) ? error.response?.data : undefined) as
    | { code?: unknown }
    | undefined;
  const code = typeof body?.code === "string" ? body.code : undefined;

  switch (status) {
    case 401:
      return new AcceptInviteError("Your session has expired. Sign in again to accept.", code);
    case 403:
      // Only the documented codes get a specific message; anything else is generic.
      if (code === "INVITE_EMAIL_MISMATCH") {
        return new AcceptInviteError(
          "This invite was sent to a different email address. Sign in with the email it was sent to.",
          code,
        );
      }
      if (code === "EMAIL_NOT_VERIFIED") {
        return new AcceptInviteError(
          "Verify your email address first, then open the invite link again.",
          code,
        );
      }
      return new AcceptInviteError("We couldn’t accept this invite. Please try again.", code);
    case 404:
      return new AcceptInviteError(
        "This invite link isn’t valid, or it was revoked. Ask the person who invited you to send a new one.",
        code,
      );
    case 409:
      return new AcceptInviteError(
        code === "INVITE_ALREADY_ACCEPTED"
          ? "This invite has already been accepted."
          : "We couldn’t accept this invite. Please try again.",
        code,
      );
    case 410:
      return new AcceptInviteError(
        "This invite has expired. Ask the person who invited you to send a new one.",
        code,
      );
    default:
      return new AcceptInviteError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t accept this invite. Please try again.",
        code,
      );
  }
}

/**
 * POST /auth/invites/accept. For the signed-in person, whose verified email
 * must be the one the invite was sent to. It sets their role from the invite
 * and returns a fresh session, so the new role applies immediately.
 */
export async function acceptInvite(token: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse | { data: AuthResponse }>(
      "/auth/invites/accept",
      { token },
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAcceptInviteError(error);
  }
}
