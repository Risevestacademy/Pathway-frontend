import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/authStore";
import LandingNav from "./LandingNav";

// The hash links check reduced motion, and jsdom has no matchMedia.
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, accessToken: null, isHydrating: true });
});

async function renderNav() {
  const router = createRouter({
    routeTree: createRootRoute({ component: LandingNav }),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole("link", { name: "Pathway home" });
}

describe("LandingNav account link", () => {
  it("shows neither Log in nor Open app while the session is being restored", async () => {
    await renderNav();

    expect(screen.getAllByRole("status", { name: /checking your sign-in/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Open app" })).toBeNull();
  });

  it("goes straight to Open app when the restore finds a session", async () => {
    await renderNav();

    act(() => {
      useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
      useAuthStore.getState().finishHydrating();
    });

    expect(screen.getAllByRole("link", { name: "Open app" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  });

  it("shows Log in once the restore finds no session", async () => {
    await renderNav();

    act(() => useAuthStore.getState().finishHydrating());

    expect(screen.getAllByRole("link", { name: "Log in" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("status", { name: /checking your sign-in/i })).toBeNull();
  });
});
