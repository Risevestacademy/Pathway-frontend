import { humanize } from "./adminFeedback.types";
import type { Role, TeamMember } from "./admin.workflow";

/** Roles the backend knows, as returned by GET /admin/teams/invites. */
export type ApiRole = "USER" | "EDITOR" | "REVIEWER" | "PUBLISHER" | "ADMIN";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface InviteItem {
  id: string;
  email: string;
  role: ApiRole | (string & {});
  status: InviteStatus | (string & {});
  invitedById: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export interface InvitePage {
  items: InviteItem[];
  total: number;
  page: number;
  limit: number;
}

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const INVITE_STATUS_TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "info",
  ACCEPTED: "success",
  EXPIRED: "warning",
  REVOKED: "danger",
};

export const INVITE_STATUSES = Object.keys(INVITE_STATUS_LABEL) as InviteStatus[];

export const inviteStatusLabel = (status: string) =>
  INVITE_STATUS_LABEL[status as InviteStatus] ?? humanize(status);

/** "PUBLISHER" -> "Publisher". */
export const apiRoleLabel = (role: string) => humanize(role);

/** The date that matters for the invite's state, e.g. when it was accepted. */
export function inviteStateDate(invite: InviteItem): { label: string; iso: string | null } {
  switch (invite.status) {
    case "ACCEPTED":
      return { label: "Accepted", iso: invite.acceptedAt };
    case "REVOKED":
      return { label: "Revoked", iso: invite.revokedAt };
    case "EXPIRED":
      return { label: "Expired", iso: invite.expiresAt };
    default:
      return { label: "Expires", iso: invite.expiresAt };
  }
}

const ROLE_FROM_API: Record<string, Role[]> = {
  ADMIN: ["admin"],
  EDITOR: ["editor"],
  REVIEWER: ["reviewer"],
  PUBLISHER: ["publisher"],
  USER: [],
};

/** "new.editor@example.com" -> "New Editor". The invite carries no name. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** A team member for someone who accepted an invite. Their roles come from the server. */
export function inviteToMember(invite: InviteItem): TeamMember {
  return {
    id: `invite-${invite.id}`,
    name: nameFromEmail(invite.email) || invite.email,
    email: invite.email,
    roles: ROLE_FROM_API[invite.role] ?? [],
    careerAccess: "all",
    lastActive: invite.acceptedAt ?? invite.createdAt,
    fromInvite: true,
  };
}

/**
 * The Members list: people already on the local team list, plus everyone who
 * accepted an invite. People still waiting on an invite are not members yet;
 * they stay under Invites. A local entry wins over an invite for the same email.
 */
export function mergeTeamMembers(local: TeamMember[], acceptedInvites: InviteItem[]): TeamMember[] {
  const joined = local.filter((m) => !(m.invitedAt && !m.lastActive));
  const known = new Set(joined.map((m) => m.email.toLowerCase()));

  const fromInvites: TeamMember[] = [];
  // Newest first, so a person invited twice appears once, with their latest role.
  const newestFirst = [...acceptedInvites].sort(
    (a, b) => new Date(b.acceptedAt ?? b.createdAt).getTime() - new Date(a.acceptedAt ?? a.createdAt).getTime(),
  );
  for (const invite of newestFirst) {
    const email = invite.email.toLowerCase();
    if (known.has(email)) continue;
    known.add(email);
    fromInvites.push(inviteToMember(invite));
  }

  return [...joined, ...fromInvites];
}
