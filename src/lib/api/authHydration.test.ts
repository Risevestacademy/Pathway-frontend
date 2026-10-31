import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const user = {
  id: "u1",
  email: "user@example.com",
  role: "USER",
  fullName: "Ada Obi",
  emailVerified: true,
  createdAt: "2026-10-01T00:00:00.000Z",
};

// ensureAuthHydrated caches its promise per module, so load fresh copies.
async function loadAuth() {
  const { ensureAuthHydrated } = await import("./auth.api");
  const { selectIsAuthenticated, useAuthStore } = await import("../stores/authStore");
  return { ensureAuthHydrated, selectIsAuthenticated, useAuthStore };
}

beforeEach(() => vi.resetModules());

describe("ensureAuthHydrated", () => {
  it("restores the session on reload when /auth/me returns a plain user", async () => {
    server.use(
      http.post("*/auth/refresh", () => HttpResponse.json({ accessToken: "fresh" })),
      http.get("*/auth/me", () => HttpResponse.json(user)),
    );
    const { ensureAuthHydrated, selectIsAuthenticated, useAuthStore } = await loadAuth();

    await ensureAuthHydrated();

    const state = useAuthStore.getState();
    expect(state.user?.id).toBe("u1");
    expect(state.accessToken).toBe("fresh");
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(state.isHydrating).toBe(false);
  });

  it("still accepts a user wrapped in a data envelope", async () => {
    server.use(
      http.post("*/auth/refresh", () => HttpResponse.json({ accessToken: "fresh" })),
      http.get("*/auth/me", () => HttpResponse.json({ data: user })),
    );
    const { ensureAuthHydrated, selectIsAuthenticated, useAuthStore } = await loadAuth();

    await ensureAuthHydrated();

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it("stays signed out when the refresh cookie is missing or expired", async () => {
    server.use(
      http.post("*/auth/refresh", () =>
        HttpResponse.json({ message: "Refresh token required" }, { status: 401 }),
      ),
    );
    const { ensureAuthHydrated, selectIsAuthenticated, useAuthStore } = await loadAuth();

    await ensureAuthHydrated();

    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.isHydrating).toBe(false);
  });

  it("clears the token instead of half-signing in when /auth/me has no user", async () => {
    server.use(
      http.post("*/auth/refresh", () => HttpResponse.json({ accessToken: "fresh" })),
      http.get("*/auth/me", () => HttpResponse.json({})),
    );
    const { ensureAuthHydrated, useAuthStore } = await loadAuth();

    await ensureAuthHydrated();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
