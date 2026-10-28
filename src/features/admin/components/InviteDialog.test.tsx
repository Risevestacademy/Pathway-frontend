import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CreatedInvite } from "../adminInvites.types";
import type { TeamMember } from "../admin.workflow";
import { InviteDialog } from "./InviteDialog";

const mutate = vi.fn();
let createState: { isPending: boolean; isError: boolean; error: Error | null };
let members: TeamMember[] = [];

vi.mock("../hooks/useAdminInvites", () => ({
  useCreateInvite: () => ({ mutate, ...createState }),
}));
vi.mock("../hooks/useTeamMembers", () => ({
  useTeamMembers: () => ({ members }),
}));

const created: CreatedInvite = {
  id: "b2c3",
  email: "ada@example.com",
  role: "EDITOR",
  expiresAt: "2026-10-26T09:00:00.000Z",
  emailSent: true,
};

beforeEach(() => {
  mutate.mockReset();
  createState = { isPending: false, isError: false, error: null };
  members = [];
});
afterEach(cleanup);

const open = (props: { onSent?: () => void; onOpenChange?: () => void } = {}) =>
  render(
    <InviteDialog open onOpenChange={props.onOpenChange ?? vi.fn()} onSent={props.onSent} />,
  );

describe("InviteDialog", () => {
  it("sends the email and the chosen role to the API", async () => {
    open();

    await userEvent.type(screen.getByLabelText("Email"), "  Ada@Example.com ");
    await userEvent.click(screen.getByRole("radio", { name: /Publisher/ }));
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(mutate).toHaveBeenCalledWith(
      { email: "ada@example.com", role: "PUBLISHER" },
      expect.anything(),
    );
  });

  it("asks for an email and a role before sending", async () => {
    open();

    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText("Add their email. Required.")).toBeTruthy();
    expect(screen.getByText("Pick a role.")).toBeTruthy();
  });

  it("rejects an invalid email and someone already on the team", async () => {
    members = [
      { id: "m", name: "Ada", email: "ada@example.com", roles: [], careerAccess: "all", lastActive: null },
    ];
    open();
    await userEvent.click(screen.getByRole("radio", { name: /Editor/ }));

    // Once an error shows, it becomes part of the field's label, so find it by role.
    await userEvent.type(screen.getByRole("textbox"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();

    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));
    expect(screen.getByText("This person is already on the team.")).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("reports the created invite and closes once it is sent", async () => {
    const onSent = vi.fn();
    const onOpenChange = vi.fn();
    mutate.mockImplementation((_input, options) => options.onSuccess(created));
    open({ onSent, onOpenChange });

    await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
    await userEvent.click(screen.getByRole("radio", { name: /Editor/ }));
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(onSent).toHaveBeenCalledWith(created);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables sending while the request runs", () => {
    createState = { isPending: true, isError: false, error: null };
    open();

    expect(screen.getByRole("button", { name: "Sending..." }).hasAttribute("disabled")).toBe(true);
  });

  it("keeps the dialog open and shows the failure", () => {
    createState = {
      isPending: false,
      isError: true,
      error: new Error("Only admins can invite people."),
    };
    open();

    expect(screen.getByRole("alert").textContent).toContain("Only admins can invite people.");
    expect(screen.getByRole("button", { name: "Send invite" })).toBeTruthy();
  });
});
