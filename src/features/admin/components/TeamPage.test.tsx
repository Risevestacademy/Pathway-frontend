import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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
  members = [member("amaka"), member("ada", { fromInvite: true })];
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

  it("takes an invite but adds nobody to the list, and says it was not sent", async () => {
    render(<TeamPage />);

    await userEvent.click(screen.getByRole("button", { name: "Invite someone" }));
    await userEvent.type(screen.getByLabelText("Email"), "new.person@example.com");
    await userEvent.click(within(screen.getByRole("group", { name: "Roles" })).getByText("Editor"));
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(screen.queryByText("new.person@example.com")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("new.person@example.com");
    expect(screen.getByRole("status").textContent).toContain("wasn’t sent");
  });
});
