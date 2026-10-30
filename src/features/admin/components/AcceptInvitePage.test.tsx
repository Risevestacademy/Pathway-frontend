import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AcceptInvitePage } from "./AcceptInvitePage";

const mutate = vi.fn();
let acceptState: {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
};

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("../hooks/useAcceptInvite", () => ({
  useAcceptInvite: () => ({ mutate, ...acceptState }),
}));
vi.mock("../../../lib/stores/authStore", () => ({
  useAuthStore: (select: (s: { user: { email: string } }) => unknown) =>
    select({ user: { email: "ada@example.com" } }),
}));

beforeEach(() => {
  mutate.mockReset();
  acceptState = { isPending: false, isError: false, isSuccess: false, error: null };
});
afterEach(cleanup);

describe("AcceptInvitePage", () => {
  it("shows who is signed in and accepts with the token from the link", async () => {
    render(<AcceptInvitePage token="tok-123" />);

    expect(screen.getByText("ada@example.com")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Accept invite" }));

    expect(mutate).toHaveBeenCalledWith("tok-123");
  });

  it("explains a link without a token and offers no way to accept", () => {
    render(<AcceptInvitePage token={undefined} />);

    expect(screen.getByText("This invite link is incomplete")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Accept invite" })).toBeNull();
  });

  it("disables the button while accepting", () => {
    acceptState = { ...acceptState, isPending: true };
    render(<AcceptInvitePage token="tok" />);

    expect((screen.getByRole("button", { name: "Accepting..." }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("shows why it failed and lets them try again", () => {
    acceptState = {
      ...acceptState,
      isError: true,
      error: new Error("This invite was already used, has expired or was revoked. Ask for a new one."),
    };
    render(<AcceptInvitePage token="tok" />);

    expect(screen.getByRole("alert").textContent).toContain("already used");
    expect(screen.getByRole("button", { name: "Accept invite" })).toBeTruthy();
  });

  it("confirms they joined and links to the admin area", () => {
    acceptState = { ...acceptState, isSuccess: true };
    render(<AcceptInvitePage token="tok" />);

    expect(screen.getByText("You’ve joined the team")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to admin" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Accept invite" })).toBeNull();
  });
});
