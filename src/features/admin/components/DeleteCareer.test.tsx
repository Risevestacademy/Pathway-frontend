import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AdminCareerRow, AdminStatus } from "../admin.utils";
import { DeleteCareerDialog } from "./CareerStatusDialogs";
import { CareersTable } from "./CareersTable";

const mutate = vi.fn();
const reset = vi.fn();
let removeState: { isPending: boolean; isError: boolean; error: Error | null };

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("../hooks/useDeleteCareer", () => ({
  useDeleteCareer: () => ({ mutate, reset, ...removeState }),
}));

const row = (id: string, status: AdminStatus, over: Partial<AdminCareerRow> = {}): AdminCareerRow => ({
  id,
  title: `Career ${id}`,
  shortDescription: "",
  status,
  stepCount: 0,
  sources: null,
  updatedAt: null,
  ...over,
});

beforeEach(() => {
  mutate.mockReset();
  reset.mockReset();
  removeState = { isPending: false, isError: false, error: null };
});
afterEach(cleanup);

describe("CareersTable delete action", () => {
  it("offers Delete on draft careers only", () => {
    render(
      <CareersTable
        rows={[row("a", "draft"), row("b", "published"), row("c", "retired")]}
        onPublish={vi.fn()}
        onRetire={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
  });

  it("passes the draft to onDelete", async () => {
    const onDelete = vi.fn();
    const draft = row("a", "draft");
    render(
      <CareersTable rows={[draft]} onPublish={vi.fn()} onRetire={vi.fn()} onDelete={onDelete} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(draft);
  });
});

describe("DeleteCareerDialog", () => {
  it("asks before deleting and does nothing on cancel", async () => {
    const onClose = vi.fn();
    render(<DeleteCareerDialog career={row("a", "draft")} onClose={onClose} />);

    expect(screen.getByText("Delete Career a?")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("deletes the career, reports it and closes on success", async () => {
    const draft = row("a", "draft");
    const onClose = vi.fn();
    const onDeleted = vi.fn();
    mutate.mockImplementation((_row, options) => options.onSuccess());
    render(<DeleteCareerDialog career={draft} onClose={onClose} onDeleted={onDeleted} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete career" }));

    expect(mutate).toHaveBeenCalledWith(draft, expect.anything());
    expect(onDeleted).toHaveBeenCalledWith(draft);
    expect(onClose).toHaveBeenCalled();
  });

  it("disables the button while deleting", () => {
    removeState = { isPending: true, isError: false, error: null };
    render(<DeleteCareerDialog career={row("a", "draft")} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Deleting..." }).hasAttribute("disabled")).toBe(true);
  });

  it("shows why it failed and stays open", () => {
    removeState = {
      isPending: false,
      isError: true,
      error: new Error("Only admins can delete careers."),
    };
    render(<DeleteCareerDialog career={row("a", "draft")} onClose={vi.fn()} />);

    expect(screen.getByRole("alert").textContent).toContain("Only admins can delete careers.");
    expect(screen.getByRole("button", { name: "Delete career" })).toBeTruthy();
  });
});
