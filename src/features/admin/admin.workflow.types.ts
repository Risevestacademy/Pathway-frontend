// ---------------------------------------------------------------- Reviews

export type ReviewType = "new-career" | "roadmap" | "figures" | "details";
export type ReviewStatus = "pending" | "approved" | "changes-requested";

export interface ReviewChange {
  label: string;
  before: string;
  after: string;
}

export interface ReviewItem {
  id: string;
  title: string;
  summary: string;
  type: ReviewType;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
  /** The career this review is about, when it came from the editor. */
  careerId?: string;
  changes: ReviewChange[];
  bannerTitle?: string;
  bannerBody?: string;
  decisionNote?: string;
  decidedAt?: string;
  /** Set when the career was deleted. The review stays visible but can no longer be opened or decided. */
  careerDeletedAt?: string;
}

export const REVIEW_TYPE_LABEL: Record<ReviewType, string> = {
  "new-career": "New career",
  roadmap: "Roadmap",
  figures: "Figures",
  details: "Details",
};

// ---------------------------------------------------------------- Reports

export type ReportType = "link-problem" | "outdated" | "wrong-fit" | "other";
export type ReportStatus = "new" | "in-progress" | "fixed" | "not-an-issue";

export interface ReportItem {
  id: string;
  title: string;
  type: ReportType;
  message: string;
  careerId: string | null;
  careerTitle: string;
  stepTitle: string;
  resourceId: string | null;
  resourceTitle: string;
  reportedAt: string;
  status: ReportStatus;
  assignedTo: string | null;
  note: string;
  /** How many learners reported the same problem. */
  count: number;
  /** When the weekly link check also flagged this link. */
  brokenCheckedOn?: string;
}

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  "link-problem": "Link problem",
  outdated: "Outdated content",
  "wrong-fit": "Doesn’t match the step",
  other: "Something else",
};

export const REPORT_TITLE: Record<ReportType, string> = {
  "link-problem": "The link does not open",
  outdated: "The content is out of date",
  "wrong-fit": "The resource doesn’t match its step",
  other: "A learner flagged a problem",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  new: "New",
  "in-progress": "In progress",
  fixed: "Fixed",
  "not-an-issue": "Not an issue",
};

// ------------------------------------------------------------------- Team

export type Role = "editor" | "reviewer" | "publisher" | "admin";

export const ROLES: { id: Role; label: string; description: string }[] = [
  {
    id: "editor",
    label: "Editor",
    description: "Write and edit careers, skills, roadmaps and resources. Submit changes for review.",
  },
  {
    id: "reviewer",
    label: "Reviewer",
    description: "Approve or send back changes from other editors.",
  },
  {
    id: "publisher",
    label: "Publisher",
    description: "Publish, unpublish and retire careers.",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Everything above, plus invite people and manage roles.",
  },
];

export const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label])) as Record<Role, string>;

/** Rows of the roles and permissions table. Admins hold every permission. */
export const PERMISSIONS: { label: string; note?: string; roles: Role[] }[] = [
  { label: "View everything in the tool", roles: ["editor", "reviewer", "publisher", "admin"] },
  { label: "Edit careers, skills, roadmaps and resources", roles: ["editor", "admin"] },
  { label: "Submit changes for review", roles: ["editor", "admin"] },
  {
    label: "Approve or send back changes",
    note: "Never your own changes",
    roles: ["reviewer", "admin"],
  },
  { label: "Publish, unpublish and retire careers", roles: ["publisher", "admin"] },
  { label: "Handle learner reports", roles: ["editor", "reviewer", "admin"] },
  { label: "Invite people and change roles", roles: ["admin"] },
];

/** "all" or the titles of the careers this person can edit. */
export type CareerAccess = "all" | string[];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  careerAccess: CareerAccess;
  /** Null until they join. */
  lastActive: string | null;
  invitedAt?: string;
  /** Roles come from the server (an accepted invite, or the configured admin) and are not edited here. */
  serverManaged?: boolean;
}

/** Id of the team entry created from VITE_ADMIN_OWNER_EMAIL. */
export const OWNER_MEMBER_ID = "member-owner";

// ---------------------------------------------------------------- History

export interface CareerVersion {
  version: number;
  summary: string;
  editedBy: string;
  approvedBy: string;
  publishedAt: string;
}
