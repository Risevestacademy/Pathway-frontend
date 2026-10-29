import { describe, expect, it } from "vitest";
import {
  inviteToMember,
  mergeTeamMembers,
  sessionToMember,
  type InviteItem,
} from "./adminInvites.types";
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
      serverManaged: true,
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

describe("sessionToMember", () => {
  const user = { id: "u1", email: "ada@example.com", role: "ADMIN" };

  it("makes the signed-in admin a team member with their server role", () => {
    expect(sessionToMember(user, "Ada Lovelace")).toMatchObject({
      id: "session-u1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      roles: ["admin"],
      careerAccess: "all",
      serverManaged: true,
    });
  });

  it("falls back to a name made from the email", () => {
    expect(sessionToMember({ ...user, email: "grace.hopper@example.com" }, "")?.name).toBe(
      "Grace Hopper",
    );
  });

  it.each(["USER", "SOMETHING_NEW", ""])("leaves out the role %j", (role) => {
    expect(sessionToMember({ ...user, role }, "Ada")).toBeNull();
  });
});

describe("mergeTeamMembers with the signed-in person", () => {
  const me = sessionToMember({ id: "u1", email: "me@example.com", role: "ADMIN" }, "Me Myself")!;

  it("is never empty: the signed-in admin is listed before invited people", () => {
    const merged = mergeTeamMembers([], [invite("ada")], me);

    expect(merged.map((m) => m.email)).toEqual(["me@example.com", "ada@example.com"]);
  });

  it("lists the signed-in admin once when they also accepted an invite", () => {
    const merged = mergeTeamMembers([], [invite("me", { email: "ME@example.com" })], me);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("session-u1");
  });

  it("keeps a local entry for the same email over the session one", () => {
    const merged = mergeTeamMembers([member("me", { email: "me@example.com", name: "Esther Adejola" })], [], me);

    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe("Esther Adejola");
  });
});
