import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { RateSkillsDialog, type RatableSkill } from "./RateSkillsDialog";

const server = setupServer();
let sent: unknown = null;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  sent = null;
  server.use(
    http.put("*/me/skills/assessment", async ({ request }) => {
      sent = await request.json();
      return HttpResponse.json({ updated: 1 });
    }),
  );
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function setup(skill: RatableSkill = { id: "html", name: "HTML", rating: null }) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RateSkillsDialog open skill={skill} onClose={onClose} onSaved={onSaved} />
    </QueryClientProvider>,
  );
  return { onClose, onSaved };
}

describe("RateSkillsDialog", () => {
  it("keeps Save disabled until a rating is chosen", () => {
    setup();
    const save = screen.getByRole<HTMLButtonElement>("button", { name: "Save rating" });
    expect(save.disabled).toBe(true);
  });

  it("offers 1 to 5, the scale the server accepts", () => {
    setup();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.queryByRole("radio", { name: /^0:/u })).toBeNull();
  });

  it("starts on the saved rating and keeps Save off until it changes", async () => {
    setup({ id: "html", name: "HTML", rating: 4 });
    expect(screen.getByRole<HTMLInputElement>("radio", { name: /^4:/u }).checked).toBe(true);
    expect(screen.getByText("Your current rating is 4 of 5.")).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save rating" }).disabled).toBe(true);

    await userEvent.click(screen.getByRole("radio", { name: /^5:/u }));
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save rating" }).disabled).toBe(false);
  });

  it("saves the rating on a Have skill and closes", async () => {
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("radio", { name: /^3:/u }));
    await userEvent.click(screen.getByRole("button", { name: "Save rating" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(sent).toEqual({ skills: [{ skillId: "html", status: "HAVE", rating: 3 }] });
  });

  it("says so and stays open when the save fails", async () => {
    server.use(http.put("*/me/skills/assessment", () => HttpResponse.json({}, { status: 500 })));
    const { onClose } = setup();
    await userEvent.click(screen.getByRole("radio", { name: /^3:/u }));
    await userEvent.click(screen.getByRole("button", { name: "Save rating" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes without saving on Skip", async () => {
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(sent).toBeNull();
  });
});
