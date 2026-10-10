import { api } from "./axios";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

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
  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = hydrateAuth();

  return hydrationPromise;
}

async function hydrateAuth(): Promise<void> {
  try {
    const { data } = await api.post("/auth/refresh");

    const accessToken = data.data.accessToken;
    useAuthStore.getState().setAccessToken(accessToken);

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
  try {
    await api.post("/auth/password-reset/request", {
      email,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function passwordResetConfirm(
  newPassword: string,
  token: string,
): Promise<void> {
  try {
    await api.post("/auth/password-reset/confirm", {
      newPassword,
      token,
    });
  } catch (error) {
    console.error("Error confirming password reset:", error);
    if (axios.isAxiosError(error)) {
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
