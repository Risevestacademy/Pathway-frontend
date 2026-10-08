import { api, refreshAccessToken } from "./axios";
import { useAuthStore } from "../stores/authStore";

export interface RegisterCredentials {
  email: string;
  password: string;
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

export async function registerUser(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse | { data: RegisterResponse }>(
      "/auth/register",
      credentials,
    );

    return "data" in data ? data.data : data;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 409
    ) {
      throw new EmailAlreadyRegisteredError();
    }

    throw error;
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
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 401
    ) {
      throw new InvalidCredentialsError();
    }

    throw error;
  }
}

let hydrationPromise: Promise<void> | null = null;

export function ensureAuthHydrated(): Promise<void> {
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
