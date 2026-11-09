import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { setupServer } from "msw/node";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiHandlers, renderAt, signOut } from "@/test/renderApp";

vi.setConfig({ testTimeout: 90_000 });

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
beforeEach(() => {
  server.use(...apiHandlers());
  signOut();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

describe("Careers page", () => {
  it("shows the top nav, the explore tabs and the compare button", async () => {
    await renderAt("/careers");

    expect(await screen.findByRole("navigation", { name: "Main" })).toBeTruthy();
    const tabs = screen.getByRole("navigation", { name: "Explore sections" });
    expect(tabs.querySelector('[aria-current="page"]')?.textContent).toBe("Careers");
    const compare = screen.getByRole("link", { name: "Compare careers" });
    expect(compare.getAttribute("href")).toBe("/careers/compare");
  });

  it("filters the list by what is typed in the search", async () => {
    await renderAt("/careers");
    await screen.findByText("Frontend Developer");

    await userEvent.type(screen.getByRole("searchbox"), "analyst");

    await waitFor(() => expect(screen.queryByText("Frontend Developer")).toBeNull());
    expect(screen.getByText("Data Analyst")).toBeTruthy();
  });

  it("says nothing matched and lets the search be cleared", async () => {
    await renderAt("/careers");
    await screen.findByText("Frontend Developer");

    await userEvent.type(screen.getByRole("searchbox"), "zzz");
    await userEvent.click(await screen.findByRole("button", { name: "Clear search" }));

    expect(await screen.findByText("Frontend Developer")).toBeTruthy();
  });

  it("restores the search from the link", async () => {
    await renderAt("/careers?q=designer");

    expect(await screen.findByText("Product Designer")).toBeTruthy();
    expect(screen.queryByText("Frontend Developer")).toBeNull();
  });
});