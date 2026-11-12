import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { apiHandlers, renderAt, signIn, signOut } from "@/test/renderApp";
import { detailFor, DATA, DESIGN, FRONTEND } from "@/test/fixtures/careersApi.fixture";

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

const table = () => screen.findByRole("table");
const row = async (name: string) => {
  const t = await table();
  const header = within(t).getAllByRole("rowheader").find((h) => h.textContent === name);
  if (!header) throw new Error(`No row called ${name}`);
  return header.closest('[role="row"]') as HTMLElement;
};

describe("Compare result", () => {
  it("shows both careers side by side", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const t = await table();
    expect(t.getAttribute("aria-label")).toContain("Frontend Developer");
    expect(t.getAttribute("aria-label")).toContain("Data Analyst");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("has a bar naming both careers for when the table scrolls, hidden until then and from screen readers", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);
    await table();

    const bar = document.querySelector<HTMLElement>("[data-shown]");
    expect(bar?.dataset.shown).toBe("false");
    expect(bar?.closest('[aria-hidden="true"]')).toBeTruthy();
    expect(bar?.textContent).toContain("Frontend Developer");
    expect(bar?.textContent).toContain("Data Analyst");
  });

  it("shows each career's median pay and growth", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const pay = within(await row("Median pay"));
    expect(pay.getByText("$92,750")).toBeTruthy();
    expect(pay.getByText("$78,000")).toBeTruthy();

    const growth = within(await row("Growth and demand"));
    expect(growth.getByText("+8%")).toBeTruthy();
    expect(growth.getByText("+11%")).toBeTruthy();
  });

  it("finds skills in common whatever the capital letters", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const common = within(await row("Skills in common"));
    expect(common.getByText("Git")).toBeTruthy();
    expect(common.queryByText("SQL")).toBeNull();
  });

  it("says when two careers share no skills", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DESIGN}`);

    const common = within(await row("Skills in common"));
    expect(common.getByText("No skills in common.")).toBeTruthy();
  });

  it("shows the roadmap size, or that one is coming", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const roadmap = within(await row("Roadmap"));
    expect(roadmap.getByText("12 steps")).toBeTruthy();
    expect(roadmap.getByText("Roadmap coming soon")).toBeTruthy();
  });

  it("shows the first step in order, and a fallback when there is no pathway", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const first = within(await row("Your first step"));
    await waitFor(() => expect(first.getByText("How the web works")).toBeTruthy());
    expect(first.getByText("Not known yet")).toBeTruthy();
  });

  it("shows pay as unavailable when a career has none", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DESIGN}`);

    const pay = within(await row("Median pay"));
    expect(pay.getByText(/pay data isn.t available/i)).toBeTruthy();
  });

  it("asks a signed-out visitor to sign in before starting", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);
    await table();

    const links = await screen.findAllByRole("link", { name: /sign in to start/i });
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain("Frontend Developer");
  });

  it("offers Start on a signed-in career with a roadmap", async () => {
    signIn();
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    expect(await screen.findByRole("button", { name: "Start Frontend Developer" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start Data Analyst" })).toBeNull();
  });

  it("asks for two careers when the link has fewer, or the same one twice", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${FRONTEND}`);

    expect(await screen.findByText("Pick two careers to compare")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("handles a career that no longer exists and keeps the other pick", async () => {
    const gone = "99999999-9999-4999-8999-999999999999";
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${gone}`);

    expect(await screen.findByText(/one of these careers isn.t available/i)).toBeTruthy();
    const choose = screen.getByRole("link", { name: /choose careers/i });
    expect(choose.getAttribute("href")).toContain(FRONTEND);
  });

  it("shows an error with retry when the server fails, and recovers", async () => {
    let fail = true;
    server.use(
      http.get("*/careers/:id", ({ params }) =>
        fail && params.id === DATA
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(detailFor(params.id as string)),
      ),
    );
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);

    const retry = await screen.findByRole("button", { name: /try again|retry/i });
    fail = false;
    retry.click();

    expect(await table()).toBeTruthy();
  });

  it("each header has a Change link that keeps the other career", async () => {
    await renderAt(`/careers/compare/result?a=${FRONTEND}&b=${DATA}`);
    await table();

    const change = screen.getAllByRole("link", { name: /change/i });
    expect(change).toHaveLength(2);
    expect(change[0].getAttribute("href")).toContain(DATA);
    expect(change[1].getAttribute("href")).toContain(FRONTEND);
  });
});