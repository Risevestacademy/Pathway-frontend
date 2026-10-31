import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  type AnyRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "../../../lib/stores/authStore";
import { SignOutButton } from "./SignOutButton";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearAuth();
});
afterAll(() => server.close());

beforeEach(() => {
  useAuthStore.getState().setAuth({ id: "u1", email: "a@b.c", role: "USER" }, "token");
});

// <dialog> methods aren't implemented in jsdom.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

async function renderButton(): Promise<AnyRouter> {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => <SignOutButton /> }),
    history: createMemoryHistory({ initialEntries: ["/careers/c1"] }),
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole("button", { name: "Sign out" });
  return router;
}

async function confirmSignOut() {
  await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
  const dialog = await screen.findByRole("dialog", { name: /sign out of pathway/i });
  const confirm = Array.from(dialog.querySelectorAll("button")).find(
    (button) => button.textContent === "Sign out",
  );
  await userEvent.click(confirm!);
}

describe("SignOutButton", () => {
  it("revokes the session on the server, clears it locally and goes home", async () => {
    let calls = 0;
    server.use(
      http.post("*/auth/logout", () => {
        calls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = await renderButton();

    await confirmSignOut();

    await waitFor(() => expect(useAuthStore.getState().accessToken).toBeNull());
    expect(calls).toBe(1);
    expect(useAuthStore.getState().user).toBeNull();
    expect(router.state.location.pathname).toBe("/");
  });

  it("keeps the user signed in and says so when the server call fails", async () => {
    server.use(
      http.post("*/auth/logout", () => HttpResponse.json({}, { status: 500 })),
    );
    const router = await renderButton();

    await confirmSignOut();

    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn’t sign you out/i);
    expect(useAuthStore.getState().accessToken).toBe("token");
    expect(router.state.location.pathname).toBe("/careers/c1");
  });
});
