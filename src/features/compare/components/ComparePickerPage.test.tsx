import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAt, apiHandlers, signOut } from "@/test/renderApp";
import { DATA, DESIGN, FRONTEND } from "@/test/fixtures/careersApi.fixture";

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

const card = (name: string) => screen.findByRole("checkbox", { name: new RegExp(name, "i") });

describe("Compare picker", () => {
  it("lists the careers and starts with nothing selected", async () => {
    await renderAt("/careers/compare");

    expect((await card("Frontend Developer")).getAttribute("aria-checked")).toBe("false");
    expect(await card("Data Analyst")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("restores a selection from the URL", async () => {
    await renderAt(`/careers/compare?a=${FRONTEND}`);

    expect((await card("Frontend Developer")).getAttribute("aria-checked")).toBe("true");
    expect((await card("Data Analyst")).getAttribute("aria-checked")).toBe("false");
  });

  it("opens the comparison once two are picked", async () => {
    const router = await renderAt("/careers/compare");

    await userEvent.click(await card("Frontend Developer"));
    await userEvent.click(await card("Data Analyst"));
    await userEvent.click(screen.getByRole("button", { name: /compare careers/i }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/careers/compare/result"));
    expect(router.state.location.search).toMatchObject({ a: FRONTEND, b: DATA });
  });

  it("refuses a third career and says why", async () => {
    await renderAt(`/careers/compare?a=${FRONTEND}&b=${DATA}`);

    const third = await card("Product Designer");
    await userEvent.click(third);

    expect(third.getAttribute("aria-checked")).toBe("false");
    expect(await screen.findByText("You can only compare two careers at a time.")).toBeTruthy();
  });

  it("explains what to do when Compare is pressed with fewer than two", async () => {
    const router = await renderAt(`/careers/compare?a=${FRONTEND}`);

    const button = await screen.findByRole("button", { name: /compare careers/i });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(button);

    expect(await screen.findByText("Pick two careers to compare.")).toBeTruthy();
    expect(router.state.location.pathname).toBe("/careers/compare");
  });

  it("filters by search, shows a no-match state, and clears it", async () => {
    await renderAt("/careers/compare");
    await card("Frontend Developer");

    await userEvent.type(screen.getByRole("searchbox"), "zzz");
    expect(await screen.findByRole("button", { name: /clear filters/i })).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(await card("Frontend Developer")).toBeTruthy();
  });

  it("keeps a selected career even when a search hides its card", async () => {
    await renderAt(`/careers/compare?a=${FRONTEND}`);
    await card("Frontend Developer");

    await userEvent.type(screen.getByRole("searchbox"), "designer");
    await screen.findByRole("checkbox", { name: /product designer/i });

    expect(screen.getByText(/1 of 2 selected|1 selected/i)).toBeTruthy();
  });

  it("shows an error with a retry that recovers", async () => {
    let fail = true;
    server.use(
      http.get("*/careers", () =>
        fail ? new HttpResponse(null, { status: 500 }) : HttpResponse.json([]),
      ),
    );
    await renderAt("/careers/compare");

    const retry = await screen.findByRole("button", { name: /try again|retry/i });
    fail = false;
    await userEvent.click(retry);

    await waitFor(() => expect(screen.queryByRole("button", { name: /try again|retry/i })).toBeNull());
  });

  it("shows an empty state when there are no careers at all", async () => {
    server.use(http.get("*/careers", () => HttpResponse.json([])));
    await renderAt("/careers/compare");

    await waitFor(() => expect(screen.queryByRole("checkbox")).toBeNull());
    expect(screen.queryByRole("button", { name: /clear filters/i })).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("each card has its own Open Pathway link", async () => {
    await renderAt("/careers/compare");
    await card("Design");

    const links = await screen.findAllByRole("link", { name: /open pathway/i });
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.some((l) => l.getAttribute("href")?.includes(DESIGN))).toBe(true);
  });
});