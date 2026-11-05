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

async function renderNav(path = "/careers/c1") {
  const router = createRouter({
    routeTree: createRootRoute({ component: AppTopNav }),
    history: createMemoryHistory({ initialEntries: [path] }),
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

  describe("the My Pathway item", () => {
    const myPathway = () => screen.getByRole("link", { name: /My Pathway/ });
    const explore = () => screen.getByRole("link", { name: /Explore/ });

    it("opens My Pathway itself, where Roadmap is the default tab", async () => {
      await renderNav();
      act(() => {
        useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
        useAuthStore.getState().finishHydrating();
      });

      expect(myPathway().getAttribute("href")).toBe("/my-pathway");
    });

    it.each(["/my-pathway", "/my-pathway/skill-check", "/my-pathway/skill-check/c1/result"])(
      "is current on %s",
      async (path) => {
        await renderNav(path);
        act(() => {
          useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
          useAuthStore.getState().finishHydrating();
        });

        expect(myPathway().getAttribute("aria-current")).toBe("page");
        expect(explore().getAttribute("aria-current")).toBeNull();
      },
    );

    it("isn't current on a path that only starts the same way", async () => {
      await renderNav("/my-pathways");
      act(() => {
        useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
        useAuthStore.getState().finishHydrating();
      });

      expect(myPathway().getAttribute("aria-current")).toBeNull();
    });
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
