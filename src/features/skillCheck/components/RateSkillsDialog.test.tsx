import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateSkillsDialog } from "./RateSkillsDialog";

beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);

function setup() {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RateSkillsDialog
        open
        careerId="frontend-developer"
        title="Rate HTML"
        skills={[{ id: "html", name: "HTML" }]}
        onClose={onClose}
        onSaved={onSaved}
      />
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

  it("offers 0 to 5 plus a separate Not sure option", () => {
    setup();
    expect(screen.getAllByRole("radio")).toHaveLength(7);
    expect(screen.getByRole("radio", { name: /^Not sure/u })).toBeTruthy();
  });

  it("saves the chosen rating and closes", async () => {
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("radio", { name: /^3:/u }));
    await userEvent.click(screen.getByRole("button", { name: "Save rating" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("closes without saving on Skip", async () => {
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
