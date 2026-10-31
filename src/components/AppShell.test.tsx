import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import AppShell, { type AppShellVariant } from "./AppShell";

afterEach(cleanup);

async function renderShell(path: string, variant?: AppShellVariant) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <AppShell variant={variant}>
          <p>Page content</p>
        </AppShell>
      ),
    }),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByText("Page content");
}

const sidebarImages = () => screen.getAllByAltText("Pathway").map((img) => img.getAttribute("src"));

describe("AppShell sidebar", () => {
  it.each(["/dashboard", "/careers", "/skill-check", "/admin", "/reset-password"])(
    "shows only the P logo on %s",
    async (path) => {
      await renderShell(path);

      expect(sidebarImages()).toEqual(["/favicon.svg"]);
      expect(screen.queryByText(/©/)).toBeNull();
      expect(document.querySelector('img[src*="desk-supplies"]')).toBeNull();
    },
  );

  it.each([
    ["/login", "log in"],
    ["/signup", "create account"],
    ["/verify-email", "verify email"],
  ])("keeps the full sidebar on %s (%s)", async (path) => {
    await renderShell(path, "wide");

    expect(sidebarImages()).toEqual(["/brand-logo-lavender.svg"]);
    expect(screen.getByText(new RegExp(`©${new Date().getFullYear()} Pathway`))).toBeTruthy();
  });

  it("still links the logo home", async () => {
    await renderShell("/dashboard");

    expect(screen.getByRole("link", { name: "Pathway home" }).getAttribute("href")).toBe("/");
  });

  it("draws no shell at all for a page that brings its own", async () => {
    await renderShell("/", "none");

    expect(screen.queryByRole("link", { name: "Pathway home" })).toBeNull();
    expect(screen.queryByText(/©/)).toBeNull();
  });
});
