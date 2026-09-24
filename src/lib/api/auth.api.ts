import { api } from "./axios";
import { useAuthStore } from "../stores/authStore";

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
