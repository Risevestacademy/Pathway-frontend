import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../lib/stores/authStore";
import AppTopNav from "./AppTopNav";

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

async function renderNav() {
  const router = createRouter({
    routeTree: createRootRoute({ component: AppTopNav }),
    history: createMemoryHistory({ initialEntries: ["/careers/c1"] }),
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole("navigation", { name: "Main" });
}

describe("AppTopNav", () => {
  it("doesn't offer Sign in while the session is still being restored", async () => {
    await renderNav();

    expect(screen.getByRole("status", { name: /checking your sign-in/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("offers Sign in once restoring finds no session", async () => {
    await renderNav();

    act(() => useAuthStore.getState().finishHydrating());

    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
  });

  it("links Dashboard to the dashboard", async () => {
    await renderNav();
    act(() => {
      useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
      useAuthStore.getState().finishHydrating();
    });

    expect(screen.getByRole("link", { name: /Dashboard/ }).getAttribute("href")).toBe("/dashboard");
  });

  it("shows the signed-in state as soon as the session is restored", async () => {
    await renderNav();

    act(() => {
      useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
      useAuthStore.getState().finishHydrating();
    });

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("status", { name: /checking your sign-in/i })).toBeNull();
  });
});
