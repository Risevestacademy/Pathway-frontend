import { useAuthStore } from "../../../lib/stores/authStore";
import { useAdminStore } from "../adminStore";
import { nameFromEmail } from "../adminInvites.types";
import { shortName, type TeamMember } from "../admin.workflow";

export interface CurrentMember {
  /** A saved team entry matching the signed-in email, if there is one. */
  member: TeamMember | undefined;
  /** The signed-in person's full name: from their session, else their team entry, else their email. */
  fullName: string;
  /** How this person appears as an author, e.g. "Amaka O.". */
  displayName: string;
  /** Reviewers and admins can approve or send back changes. */
  canReview: boolean;
  isAdmin: boolean;
}

/**
 * What the signed-in person may do comes from the role the server gave them,
 * so anyone without an ADMIN or REVIEWER role has no access to those actions.
 */
export function useCurrentMember(): CurrentMember {
  const email = useAuthStore((s) => s.user?.email);
  const sessionName = useAuthStore((s) => s.user?.fullName ?? s.user?.name)?.trim();
  const role = useAuthStore((s) => s.user?.role)?.toUpperCase();
  const members = useAdminStore((s) => s.members);
  const member = email
    ? members.find((m) => m.email.toLowerCase() === email.toLowerCase())
    : undefined;

  // The name the server gave, else the team entry's, else one made from the email.
  const fullName = sessionName || member?.name || (email ? nameFromEmail(email) : "");

  return {
    member,
    fullName,
    displayName: fullName ? shortName(fullName) : "You",
    canReview: role === "ADMIN" || role === "REVIEWER",
    isAdmin: role === "ADMIN",
  };
}
