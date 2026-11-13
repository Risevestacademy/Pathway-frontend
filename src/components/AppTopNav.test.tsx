import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../lib/stores/authStore";
import AppTopNav from "./AppTopNav";

vi.mock("../features/pathwayRoadmap/components/CareerProgressPill", () => ({
  CareerProgressPill: ({ careerId }: { careerId: string }) => <p>{`progress pill for ${careerId}`}</p>,
}));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});

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
    expect(screen.getByRole("button", { name: "Feedback" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  });

  describe("the progress pill", () => {
    const signIn = () =>
      act(() => {
        useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
        useAuthStore.getState().finishHydrating();
      });

    it.each([
      ["/my-pathway/c1/overview", "c1"],
      ["/my-pathway/c1/resources", "c1"],
      ["/my-pathway/c2/resources/r1", "c2"],
    ])("is for the career on %s", async (path, careerId) => {
      await renderNav(path);
      signIn();

      expect(screen.getByText(`progress pill for ${careerId}`)).toBeTruthy();
    });

    it.each(["/my-pathway", "/my-pathway/skill-check", "/my-pathway/skill-check/c1/result", "/careers/c1"])(
      "isn't shown on %s, which isn't one career's pathway",
      async (path) => {
        await renderNav(path);
        signIn();

        expect(screen.queryByText(/progress pill for/)).toBeNull();
      },
    );

    it("isn't shown to someone who isn't signed in", async () => {
      await renderNav("/my-pathway/c1/overview");
      act(() => useAuthStore.getState().finishHydrating());

      expect(screen.queryByText(/progress pill for/)).toBeNull();
    });
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

  it("puts Send feedback and Sign out in the account menu", async () => {
    await renderNav();
    act(() => {
      useAuthStore.getState().setAuth({ id: "u1", email: "ada@example.com", role: "USER", fullName: "Ada Lovelace" }, "token");
      useAuthStore.getState().finishHydrating();
    });

    expect(screen.queryByRole("button", { name: "Feedback" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Profile" }).getAttribute("href")).toBe("/profile");

    await userEvent.click(screen.getByRole("menuitem", { name: "Send feedback" }));
    expect(screen.getByRole("dialog", { name: "Send feedback" })).toBeTruthy();
    expect((screen.getByLabelText("Email for a reply (optional)") as HTMLInputElement).value).toBe("ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(screen.getByRole("dialog", { name: /sign out of pathway/i })).toBeTruthy();
  });
});