import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AcceptInvitePage, AcceptInvitePending } from "./AcceptInvitePage";

const mutate = vi.fn();
const onUseDifferentAccount = vi.fn();
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
  onUseDifferentAccount.mockReset();
  onUseDifferentAccount.mockResolvedValue(undefined);
  acceptState = { isPending: false, isError: false, isSuccess: false, error: null };
});
afterEach(cleanup);

/** `null` renders a link with no token. */
const page = (token: string | null = "tok-123") =>
  render(
    <AcceptInvitePage token={token ?? undefined} onUseDifferentAccount={onUseDifferentAccount} />,
  );

describe("AcceptInvitePage", () => {
  it("shows who is signed in and accepts with the token from the link", async () => {
    page();

    expect(screen.getByText("ada@example.com")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Accept invite" }));

    expect(mutate).toHaveBeenCalledWith("tok-123");
  });

  it("lets them switch to a different account", async () => {
    page();

    await userEvent.click(screen.getByRole("button", { name: "Use a different account" }));

    expect(onUseDifferentAccount).toHaveBeenCalledTimes(1);
  });

  it("says so when signing out fails, and stays on the page", async () => {
    onUseDifferentAccount.mockRejectedValue(new Error("network"));
    page();

    await userEvent.click(screen.getByRole("button", { name: "Use a different account" }));

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t sign you out");
    expect(screen.getByRole("button", { name: "Use a different account" })).toBeTruthy();
  });

  it("offers the switch after a wrong-email error too, next to the message", () => {
    acceptState = {
      ...acceptState,
      isError: true,
      error: new Error("This invite was sent to a different email address."),
    };
    page();

    expect(screen.getByRole("alert").textContent).toContain("different email address");
    expect(screen.getByRole("button", { name: "Use a different account" })).toBeTruthy();
  });

  it("explains a link without a token and offers no way to accept", () => {
    page(null);

    expect(screen.getByText("This invite link is incomplete")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Accept invite" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Use a different account" })).toBeNull();
  });

  it("disables both buttons while accepting", () => {
    acceptState = { ...acceptState, isPending: true };
    page();

    expect((screen.getByRole("button", { name: "Accepting..." }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(
      (screen.getByRole("button", { name: "Use a different account" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("shows why it failed and lets them try again", () => {
    acceptState = {
      ...acceptState,
      isError: true,
      error: new Error("This invite has already been accepted."),
    };
    page();

    expect(screen.getByRole("alert").textContent).toContain("already been accepted");
    expect(screen.getByRole("button", { name: "Accept invite" })).toBeTruthy();
  });

  it("confirms they joined and links to the admin area", () => {
    acceptState = { ...acceptState, isSuccess: true };
    page();

    expect(screen.getByText("You’ve joined the team")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to admin" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Accept invite" })).toBeNull();
  });
});

describe("AcceptInvitePending", () => {
  it("shows a loading state while the session is checked", () => {
    render(<AcceptInvitePending />);

    expect(screen.getByRole("status").textContent).toContain("Loading your invite");
  });
});
