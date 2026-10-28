import { describe, expect, it } from "vitest";
import { inviteToMember, mergeTeamMembers, type InviteItem } from "./adminInvites.types";
import type { TeamMember } from "./admin.workflow";

const invite = (id: string, over: Partial<InviteItem> = {}): InviteItem => ({
  id,
  email: `${id}@example.com`,
  role: "EDITOR",
  status: "ACCEPTED",
  invitedById: "u1",
  invitedByName: "Ada Lovelace",
  createdAt: "2026-10-01T00:00:00Z",
  expiresAt: "2026-10-08T00:00:00Z",
  acceptedAt: "2026-10-02T00:00:00Z",
  revokedAt: null,
  ...over,
});

const member = (id: string, over: Partial<TeamMember> = {}): TeamMember => ({
  id,
  name: id,
  email: `${id}@pathway.app`,
  roles: ["editor"],
  careerAccess: "all",
  lastActive: "2026-10-01T00:00:00Z",
  ...over,
});

describe("inviteToMember", () => {
  it("makes a member from an accepted invite, with roles from the server", () => {
    const m = inviteToMember(invite("new.editor", { role: "PUBLISHER" }));

    expect(m).toMatchObject({
      id: "invite-new.editor",
      name: "New Editor",
      email: "new.editor@example.com",
      roles: ["publisher"],
      careerAccess: "all",
      lastActive: "2026-10-02T00:00:00Z",
      fromInvite: true,
    });
  });

  it.each([
    ["ADMIN", ["admin"]],
    ["REVIEWER", ["reviewer"]],
    ["USER", []],
    ["SOMETHING_NEW", []],
  ])("maps the %s role", (role, roles) => {
    expect(inviteToMember(invite("a", { role })).roles).toEqual(roles);
  });
});

describe("mergeTeamMembers", () => {
  it("adds people who accepted an invite after the local members", () => {
    const merged = mergeTeamMembers([member("amaka")], [invite("ada")]);

    expect(merged.map((m) => m.email)).toEqual(["amaka@pathway.app", "ada@example.com"]);
  });

  it("leaves out people who are still waiting on an invite", () => {
    const waiting = member("tunde", { lastActive: null, invitedAt: "2026-10-12T09:00:00Z" });

    const merged = mergeTeamMembers([member("amaka"), waiting], []);

    expect(merged.map((m) => m.id)).toEqual(["amaka"]);
  });

  it("keeps the local entry when the same email also accepted an invite", () => {
    const merged = mergeTeamMembers(
      [member("ada", { email: "ADA@example.com", roles: ["admin"] })],
      [invite("ada")],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].roles).toEqual(["admin"]);
  });

  it("shows someone invited twice once, with their latest role", () => {
    const merged = mergeTeamMembers(
      [],
      [
        invite("first", { email: "ada@example.com", role: "EDITOR", acceptedAt: "2026-10-02T00:00:00Z" }),
        invite("second", { email: "ada@example.com", role: "ADMIN", acceptedAt: "2026-10-05T00:00:00Z" }),
      ],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].roles).toEqual(["admin"]);
  });
});
