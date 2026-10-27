import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import type { InviteItem } from "../adminInvites.types";
import { InvitesSection } from "./InvitesSection";

const useAdminInvites = vi.fn();
const mutate = vi.fn();
let revokeState: { isPending: boolean; isError: boolean; error: Error | null };

vi.mock("../hooks/useAdminInvites", () => ({
  useAdminInvites: (...args: unknown[]) => useAdminInvites(...args),
  useRevokeInvite: () => ({ mutate, reset: vi.fn(), ...revokeState }),
}));

const invite = (id: string, over: Partial<InviteItem> = {}): InviteItem => ({
  id,
  email: `${id}@example.com`,
  role: "PUBLISHER",
  status: "PENDING",
  invitedById: "u1",
  invitedByName: "Ada Lovelace",
  createdAt: "2026-10-27T07:31:28.842Z",
  expiresAt: "2026-11-03T07:31:28.842Z",
  acceptedAt: null,
  revokedAt: null,
  ...over,
});

const ok = (items: InviteItem[], total = items.length, page = 1) => ({
  data: { items, total, page, limit: 6 },
  isPending: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
});

beforeEach(() => {
  useAdminInvites.mockReset();
  mutate.mockReset();
  revokeState = { isPending: false, isError: false, error: null };
});
afterEach(cleanup);

describe("InvitesSection", () => {
  it("lists invites with their role, status and who sent them", () => {
    useAdminInvites.mockReturnValue(ok([invite("new.editor")]));
    render(<InvitesSection />);

    expect(screen.getByText("new.editor@example.com")).toBeTruthy();
    expect(screen.getByText("Publisher")).toBeTruthy();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
  });

  it("asks for 6 per page and passes the status filter and page through", async () => {
    useAdminInvites.mockReturnValue(ok([invite("a")], 13));
    render(<InvitesSection />);
    expect(useAdminInvites).toHaveBeenLastCalledWith({ status: undefined, page: 1, limit: 6 });

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(useAdminInvites).toHaveBeenLastCalledWith({ status: undefined, page: 2, limit: 6 });

    await userEvent.click(screen.getByRole("button", { name: "Expired" }));
    expect(useAdminInvites).toHaveBeenLastCalledWith({ status: "EXPIRED", page: 1, limit: 6 });
  });

  it("shows the total, not just the visible page", () => {
    useAdminInvites.mockReturnValue(ok([invite("a"), invite("b")], 42));
    render(<InvitesSection />);

    expect(screen.getByText("Showing 2 of 42 invites")).toBeTruthy();
  });

  it("shows an empty state", () => {
    useAdminInvites.mockReturnValue(ok([]));
    render(<InvitesSection />);

    expect(screen.getByText("No invites here")).toBeTruthy();
  });

  it("shows loading, and a retry when loading fails", async () => {
    useAdminInvites.mockReturnValue({ ...ok([]), data: undefined, isPending: true });
    const { unmount } = render(<InvitesSection />);
    expect(screen.getByText("Loading invites")).toBeTruthy();
    unmount();

    const refetch = vi.fn();
    useAdminInvites.mockReturnValue({
      ...ok([]),
      data: undefined,
      isError: true,
      error: new Error("boom"),
      refetch,
    });
    render(<InvitesSection />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("says only admins can see invites on a 403", () => {
    const error = new AxiosError("forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 403,
    } as never);
    useAdminInvites.mockReturnValue({ ...ok([]), data: undefined, isError: true, error });
    render(<InvitesSection />);

    expect(screen.getByText("Only admins can see invites")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("only offers Revoke on pending invites", () => {
    useAdminInvites.mockReturnValue(
      ok([
        invite("open"),
        invite("done", { status: "ACCEPTED", acceptedAt: "2026-10-28T00:00:00Z" }),
        invite("gone", { status: "REVOKED", revokedAt: "2026-10-28T00:00:00Z" }),
        invite("late", { status: "EXPIRED" }),
      ]),
    );
    render(<InvitesSection />);

    expect(screen.getAllByRole("button", { name: "Revoke" })).toHaveLength(1);
  });

  it("asks before revoking, then revokes the chosen invite", async () => {
    useAdminInvites.mockReturnValue(ok([invite("open")]));
    render(<InvitesSection />);

    await userEvent.click(screen.getByRole("button", { name: "Revoke" }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText("Revoke invite for open@example.com?")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Revoke invite" }));
    expect(mutate).toHaveBeenCalledWith("open", expect.anything());
  });

  it("does not revoke when the dialog is cancelled", async () => {
    useAdminInvites.mockReturnValue(ok([invite("open")]));
    render(<InvitesSection />);

    await userEvent.click(screen.getByRole("button", { name: "Revoke" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByText("Revoke invite for open@example.com?")).toBeNull();
  });

  it("disables the confirm button while revoking and shows a failure", async () => {
    useAdminInvites.mockReturnValue(ok([invite("open")]));
    revokeState = {
      isPending: true,
      isError: true,
      error: new Error("This invite no longer exists."),
    };
    render(<InvitesSection />);

    await userEvent.click(screen.getByRole("button", { name: "Revoke" }));

    expect(screen.getByRole("button", { name: "Revoking..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("alert").textContent).toContain("This invite no longer exists.");
  });
});
