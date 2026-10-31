import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { normalizeRedirect } from "../lib/utils/route.util";
import { loginSearchSchema } from "../lib/validation/auth.schema";
import { useAuthStore } from "../lib/stores/authStore";

const ensureAuthHydrated = vi.fn();

vi.mock("../lib/api/auth.api", () => ({
  ensureAuthHydrated: () => ensureAuthHydrated(),
  logout: vi.fn(),
}));
vi.mock("../lib/monitoring/events", () => ({ analytics: { logout: vi.fn() } }));

import { Route } from "./accept-invite";

type BeforeLoad = (ctx: {
  location: { href: string };
  search: { token?: string };
}) => Promise<void>;
const beforeLoad = Route.options.beforeLoad as unknown as BeforeLoad;

beforeEach(() => {
  ensureAuthHydrated.mockReset();
  ensureAuthHydrated.mockResolvedValue(undefined);
  useAuthStore.getState().clearAuth();
});
afterEach(() => useAuthStore.getState().clearAuth());

const link = "/accept-invite?token=abc123";

describe("the accept-invite route", () => {
  it("sends a signed-out person to log in, with this link as the place to return to", async () => {
    await expect(
      beforeLoad({ location: { href: link }, search: { token: "abc123" } }),
    ).rejects.toMatchObject({
      options: { to: "/login", search: { redirect: link } },
    });
  });

  it("lets a signed-in person through", async () => {
    useAuthStore
      .getState()
      .setAuth({ id: "u1", email: "ada@example.com", role: "USER" }, "access-token");

    await expect(
      beforeLoad({ location: { href: link }, search: { token: "abc123" } }),
    ).resolves.toBeUndefined();
  });

  it("doesn’t ask a link with no token to sign in; the page explains it instead", async () => {
    await expect(
      beforeLoad({ location: { href: "/accept-invite" }, search: {} }),
    ).resolves.toBeUndefined();
    expect(ensureAuthHydrated).not.toHaveBeenCalled();
  });

  it("shows a loading state while the session is checked", () => {
    expect(Route.options.pendingComponent).toBeTypeOf("function");
  });
});

describe("returning to the invite after login", () => {
  const makeRouter = (initial: string) => {
    const root = createRootRoute();
    const accept = createRoute({
      getParentRoute: () => root,
      path: "/accept-invite",
      validateSearch: (s: Record<string, unknown>) => ({ token: s.token as string | undefined }),
    });
    const login = createRoute({
      getParentRoute: () => root,
      path: "/login",
      validateSearch: (s: Record<string, unknown>) => {
        const parsed = loginSearchSchema.safeParse?.(s);
        return { redirect: (parsed?.data?.redirect ?? s.redirect) as string | undefined };
      },
    });
    return createRouter({
      routeTree: root.addChildren([accept, login]),
      history: createMemoryHistory({ initialEntries: [initial] }),
    });
  };

  it("keeps the return address intact through the login URL", async () => {
    const router = makeRouter("/");
    await router.load();

    await router.navigate({ to: "/login", search: { redirect: link } });

    expect(router.state.location.pathname).toBe("/login");
    expect((router.state.location.search as { redirect?: string }).redirect).toBe(link);
  });

  it("lands on the invite with its token after login, the way the login page navigates", async () => {
    const router = makeRouter("/login");
    await router.load();

    // The login page does: navigate({ to: normalizeRedirect(redirect), replace: true })
    await router.navigate({ to: normalizeRedirect(link) as never, replace: true });

    expect(router.state.location.pathname).toBe("/accept-invite");
    expect((router.state.location.search as { token?: string }).token).toBe("abc123");
  });
});
