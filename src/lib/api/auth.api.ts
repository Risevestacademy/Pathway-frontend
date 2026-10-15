import { api, refreshAccessToken } from "./axios";
import {
  selectIsAuthenticated,
  useAuthStore,
} from "../stores/authStore";
import { isAxiosError } from "axios";

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
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
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
    super("Invalid email or password.");
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

export async function registerUser(
  credentials: SignupCredentials,
): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse | { data: RegisterResponse }>(
      "/auth/register",
      credentials,
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAuthRequestError(error, "We couldn't create your account. Please try again.");
  }
}

export async function loginUser(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse | { data: RegisterResponse }>(
      "/auth/login",
      credentials,
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAuthRequestError(error, "We couldn't log you in. Please try again.");
  }
}

export async function loginWithGoogle(idToken: string): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<
      RegisterResponse | { data: RegisterResponse }
    >("/auth/google", { idToken });

    return "data" in data ? data.data : data;
  } catch (error) {
    throw getAuthRequestError(
      error,
      "We couldn't sign you in with Google. Please try again.",
    );
  }
}

let hydrationPromise: Promise<void> | null = null;

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
