import { useAuthStore } from "../../../lib/stores/authStore";
import { useAdminStore } from "../adminStore";
import { hasRole, shortName, type TeamMember } from "../admin.workflow";

export interface CurrentMember {
  /** The team member matching the signed-in email, if there is one. */
  member: TeamMember | undefined;
  /** How this person appears as an author, e.g. "Amaka O.". */
  displayName: string;
  /** Without a matching team member (e.g. during development) nothing is restricted. */
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
    displayName: member ? shortName(member.name) : "You",
    canReview: !member || hasRole(member, "reviewer", "admin"),
    isAdmin: !member || hasRole(member, "admin"),
  };
}
