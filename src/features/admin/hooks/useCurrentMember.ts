import { useAuthStore } from "../../../lib/stores/authStore";
import { useAdminStore } from "../adminStore";
import { nameFromEmail } from "../adminInvites.types";
import { hasRole, shortName, type TeamMember } from "../admin.workflow";

export interface CurrentMember {
  /** The team member matching the signed-in email, if there is one. */
  member: TeamMember | undefined;
  /** The signed-in person's full name: their team entry, else made from their email. */
  fullName: string;
  /** How this person appears as an author, e.g. "Amaka O.". */
  displayName: string;
  /** False without a matching team member: no access unless the team list says so. */
  canReview: boolean;
  isAdmin: boolean;
}

export function useCurrentMember(): CurrentMember {
  const email = useAuthStore((s) => s.user?.email);
  const members = useAdminStore((s) => s.members);
  const member = email
    ? members.find((m) => m.email.toLowerCase() === email.toLowerCase())
    : undefined;

  return {
    member,
    fullName: member?.name ?? (email ? nameFromEmail(email) : ""),
    displayName: member ? shortName(member.name) : "You",
    canReview: Boolean(member && hasRole(member, "reviewer", "admin")),
    isAdmin: Boolean(member && hasRole(member, "admin")),
  };
}
