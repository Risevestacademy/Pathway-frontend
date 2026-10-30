import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TeamMember } from "../admin.workflow";
import { TeamPage } from "./TeamPage";

let members: TeamMember[] = [];
let isAdmin = true;

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("../hooks/useCurrentMember", () => ({
  useCurrentMember: () => ({ isAdmin, canReview: isAdmin, displayName: "You", member: undefined }),
}));
vi.mock("../hooks/useTeamMembers", () => ({
  useTeamMembers: () => ({
    members,
    isLoadingInvites: false,
    invitesFailed: false,
    refetchInvites: vi.fn(),
  }),
}));
vi.mock("../hooks/useAdminCareers", () => ({
  useAdminCareers: () => ({ rows: [], isPending: false, isError: false, refetch: vi.fn() }),
}));
vi.mock("./InvitesSection", () => ({ InvitesSection: () => <div>Invites list</div> }));

const createMutate = vi.fn();
vi.mock("../hooks/useAdminInvites", () => ({
  useCreateInvite: () => ({ mutate: createMutate, isPending: false, isError: false, error: null }),
}));

const member = (id: string, over: Partial<TeamMember> = {}): TeamMember => ({
  id,
  name: id,
  email: `${id}@pathway.app`,
  roles: ["editor"],
  careerAccess: "all",
  lastActive: "2026-10-01T00:00:00Z",
  ...over,
});

beforeEach(() => {
  createMutate.mockReset();
  members = [member("amaka"), member("ada", { serverManaged: true })];
  isAdmin = true;
});
afterEach(cleanup);

describe("TeamPage", () => {
  it("lists members and the invites section for admins", () => {
    render(<TeamPage />);

    expect(screen.getByText("amaka@pathway.app")).toBeTruthy();
    expect(screen.getByText("ada@pathway.app")).toBeTruthy();
    expect(screen.getByText("Invites list")).toBeTruthy();
  });

  it("offers Manage only for members who were not added by an invite", () => {
    render(<TeamPage />);

    expect(screen.getAllByRole("link", { name: "Manage" })).toHaveLength(1);
  });

  it("hides the invite button and invites list from non-admins", () => {
    isAdmin = false;
    render(<TeamPage />);

    expect(screen.queryByRole("button", { name: "Invite someone" })).toBeNull();
    expect(screen.queryByText("Invites list")).toBeNull();
  });

  async function invite(emailSent: boolean) {
    createMutate.mockImplementation((_input, options) =>
      options.onSuccess({
        id: "1",
        email: "new.person@example.com",
        role: "EDITOR",
        expiresAt: "",
        emailSent,
      }),
    );
    render(<TeamPage />);

    await userEvent.click(screen.getByRole("button", { name: "Invite someone" }));
    await userEvent.type(screen.getByLabelText("Email"), "new.person@example.com");
    await userEvent.click(screen.getByRole("radio", { name: /Editor/ }));
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));
  }

  it("tells the admin when an invite was sent, without adding them as a member", async () => {
    await invite(true);

    expect(screen.getByRole("status").textContent).toBe("Invite sent to new.person@example.com.");
    // They join the Members list only after accepting.
    expect(screen.queryByText("new.person@example.com", { selector: "p.text-ink-muted" })).toBeNull();
  });

  it("warns when the invite was created but the email could not be sent", async () => {
    await invite(false);

    expect(screen.getByRole("status").textContent).toContain("couldn’t be sent");
  });
});
