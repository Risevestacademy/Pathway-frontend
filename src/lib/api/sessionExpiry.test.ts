import { describe, expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { handleSessionExpired } from "./sessionExpiry";

async function setup(path: string) {
  const rootRoute = createRootRoute();
  const protectedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_protected",
  });
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: "/explore" }),
    createRoute({ getParentRoute: () => rootRoute, path: "/login" }),
    protectedRoute.addChildren([
      createRoute({ getParentRoute: () => protectedRoute, path: "/progress" }),
    ]),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();

  const queryClient = new QueryClient();
  queryClient.setQueryData(["progress"], { done: 3 });

  return { router, queryClient };
}

describe("handleSessionExpired", () => {
  it("sends the user from a protected page to login with the return path", async () => {
    const { router, queryClient } = await setup("/progress?tab=skills");

    await handleSessionExpired(router, queryClient);

    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.search).toEqual({
      redirect: "/progress?tab=skills",
    });
    expect(queryClient.getQueryData(["progress"])).toBeUndefined();
  });

  it("leaves the user on a public page", async () => {
    const { router, queryClient } = await setup("/explore");

    await handleSessionExpired(router, queryClient);

    expect(router.state.location.pathname).toBe("/explore");
    expect(queryClient.getQueryData(["progress"])).toBeUndefined();
  });
});
