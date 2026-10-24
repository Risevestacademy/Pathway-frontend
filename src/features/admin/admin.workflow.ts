import { countTopics, type EditableCareer } from "./admin.editor";
import type { AdminCareerRow } from "./admin.utils";

/**
 * Reviews, learner reports and team members. All of this is dummy data kept in
 * the admin store until the backend has endpoints for it.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export function shortName(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last.charAt(0)}.` : first;
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** "5 hours", "1 day", "12 minutes". */
export function waitingLabel(iso: string, now = new Date()): string {
  const ms = Math.max(0, now.getTime() - new Date(iso).getTime());
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (ms < HOUR) return plural(Math.max(1, Math.round(ms / 60000)), "minute");
  if (ms < DAY) return plural(Math.floor(ms / HOUR), "hour");
  return plural(Math.floor(ms / DAY), "day");
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "Today", "Yesterday" or a date. */
export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, new Date(now.getTime() - DAY))) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

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
}

export const REVIEW_TYPE_LABEL: Record<ReviewType, string> = {
  "new-career": "New career",
  roadmap: "Roadmap",
  figures: "Figures",
  details: "Details",
};

export const SEED_REVIEWS: ReviewItem[] = [
  {
    id: "review-data-analyst",
    title: "Data Analyst: new career",
    summary: "First publish · 88 topics",
    type: "new-career",
    submittedBy: "Chidi E.",
    submittedAt: ago(2 * DAY),
    status: "pending",
    changes: [],
    bannerTitle: "First publish",
    bannerBody: "Approving makes this career visible to learners straight away.",
  },
  {
    id: "review-frontend-roadmap",
    title: "Frontend Developer roadmap",
    summary: "2 topics added to stage 3, 1 resource replaced",
    type: "roadmap",
    submittedBy: "Amaka O.",
    submittedAt: ago(1 * DAY),
    status: "pending",
    changes: [],
  },
  {
    id: "review-ux-salary",
    title: "UX Designer: salary range",
    summary: "₦230,000–₦400,000 to ₦250,000–₦420,000",
    type: "figures",
    submittedBy: "Chidi E.",
    submittedAt: ago(5 * HOUR),
    status: "pending",
    changes: [
      {
        label: "Typical starting salary",
        before: "₦230,000 - ₦400,000",
        after: "₦250,000 - ₦420,000",
      },
      {
        label: "Source",
        before: "Jobberman salary guide 2025",
        after: "Jobberman salary guide 2026 · checked 12 Oct 2026",
      },
    ],
    bannerTitle: "Check the source before you approve",
    bannerBody:
      "The new source is dated 2026 and loads. Learners will see “checked 12 Oct 2026” next to the figure.",
  },
];

/** What the editor submits for review, based on what changed since it was opened. */
export function buildReview(
  row: AdminCareerRow,
  initial: EditableCareer,
  form: EditableCareer,
  submittedBy: string,
): Omit<ReviewItem, "id" | "status"> {
  const base = { careerId: row.id, submittedBy, submittedAt: new Date().toISOString() };
  const title = form.details.name.trim() || row.title;

  if (row.status === "draft") {
    return {
      ...base,
      title: `${title}: new career`,
      summary: `First publish · ${countTopics(form.stages)} topics`,
      type: "new-career",
      changes: [],
      bannerTitle: "First publish",
      bannerBody: "Approving makes this career visible to learners straight away.",
    };
  }

  const before = initial.details;
  const after = form.details;
  const figuresChanged =
    before.salary !== after.salary || before.salarySource !== after.salarySource;
  if (figuresChanged) {
    return {
      ...base,
      title: `${title}: salary range`,
      summary: `${before.salary || "none"} to ${after.salary}`,
      type: "figures",
      changes: [
        { label: "Typical starting salary", before: before.salary || "—", after: after.salary },
        { label: "Source", before: before.salarySource || "—", after: after.salarySource },
      ],
      bannerTitle: "Check the source before you approve",
      bannerBody: "Learners will see when the source was last checked next to the figure.",
    };
  }

  if (JSON.stringify(initial.stages) !== JSON.stringify(form.stages)) {
    return {
      ...base,
      title: `${title} roadmap`,
      summary: `${countTopics(form.stages)} topics in ${form.stages.length} stages`,
      type: "roadmap",
      changes: [],
    };
  }

  return {
    ...base,
    title: `${title}: details`,
    summary: "Details, skills, resources or sources changed",
    type: "details",
    changes: [],
  };
}

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

export const isOpenReport = (r: ReportItem) => r.status === "new" || r.status === "in-progress";

export const SEED_REPORTS: ReportItem[] = [
  {
    id: "report-scrimba",
    title: REPORT_TITLE["link-problem"],
    type: "link-problem",
    message: "Page shows a 404 error",
    careerId: null,
    careerTitle: "Frontend Developer",
    stepTitle: "JavaScript basics",
    resourceId: "seed-scrimba",
    resourceTitle: "Scrimba: Learn JavaScript",
    reportedAt: ago(2 * HOUR),
    status: "new",
    assignedTo: "member-amaka",
    note: "",
    count: 2,
    brokenCheckedOn: "2026-09-12T06:00:00.000Z",
  },
  {
    id: "report-mdn",
    title: REPORT_TITLE.outdated,
    type: "outdated",
    message: "This still teaches the old way of doing layouts.",
    careerId: null,
    careerTitle: "Backend Developer",
    stepTitle: "Building an API",
    resourceId: "seed-express",
    resourceTitle: "Express.js: Getting started",
    reportedAt: ago(1 * DAY),
    status: "new",
    assignedTo: null,
    note: "",
    count: 1,
  },
  {
    id: "report-ux",
    title: REPORT_TITLE["wrong-fit"],
    type: "wrong-fit",
    message: "This is about visual design, not user research.",
    careerId: null,
    careerTitle: "UX Designer",
    stepTitle: "User research basics",
    resourceId: "seed-figma",
    resourceTitle: "Figma: Learn design basics",
    reportedAt: ago(2 * DAY),
    status: "in-progress",
    assignedTo: "member-chidi",
    note: "Checking if a better user research course exists.",
    count: 1,
  },
  {
    id: "report-pm",
    title: REPORT_TITLE.other,
    type: "other",
    message: "The video has no captions.",
    careerId: null,
    careerTitle: "Product Manager",
    stepTitle: "Roadmapping",
    resourceId: "seed-roadmapping",
    resourceTitle: "Roadmapping for product managers",
    reportedAt: ago(3 * DAY),
    status: "new",
    assignedTo: null,
    note: "",
    count: 1,
  },
];

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
}

export const SEED_MEMBERS: TeamMember[] = [
  {
    id: "member-amaka",
    name: "Amaka Obi",
    email: "amaka@pathway.app",
    roles: ["editor", "reviewer"],
    careerAccess: "all",
    lastActive: ago(1 * HOUR),
  },
  {
    id: "member-chidi",
    name: "Chidi Eze",
    email: "chidi@pathway.app",
    roles: ["editor"],
    careerAccess: ["Frontend Developer", "UX Designer"],
    lastActive: ago(3 * HOUR),
  },
  {
    id: "member-ngozi",
    name: "Ngozi Adams",
    email: "ngozi@pathway.app",
    roles: ["admin"],
    careerAccess: "all",
    lastActive: ago(1 * DAY + HOUR),
  },
  {
    id: "member-tunde",
    name: "Tunde Bello",
    email: "tunde@pathway.app",
    roles: ["reviewer"],
    careerAccess: ["Data Analyst"],
    lastActive: null,
    invitedAt: "2026-10-12T09:00:00.000Z",
  },
];

export const hasRole = (m: Pick<TeamMember, "roles">, ...roles: Role[]) =>
  roles.some((r) => m.roles.includes(r));

export function careerAccessLabel(access: CareerAccess): string {
  if (access === "all") return "All careers";
  return `${access.length} career${access.length === 1 ? "" : "s"}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Whether removing or demoting this person would leave the team without an admin. */
export function isLastAdmin(members: TeamMember[], id: string): boolean {
  const admins = members.filter((m) => m.roles.includes("admin"));
  return admins.length === 1 && admins[0].id === id;
}

// ---------------------------------------------------------------- History

export interface CareerVersion {
  version: number;
  summary: string;
  editedBy: string;
  approvedBy: string;
  publishedAt: string;
}

const VERSION_ROWS: [string, string, string, string][] = [
  ["Updated the starting salary range and source", "Amaka O.", "Chidi E.", "2026-10-12"],
  ["Added 3 roadmap topics on web performance", "Chidi E.", "Ngozi A.", "2026-10-09"],
  ["Replaced a broken resource in Stage 3", "Amaka O.", "Chidi E.", "2026-09-30"],
  ["Rewrote the “What you would do” summary", "Ngozi A.", "Amaka O.", "2026-09-18"],
  ["First published", "Amaka O.", "Ngozi A.", "2026-09-02"],
  ["Added a source for the demand figures", "Chidi E.", "Amaka O.", "2026-08-27"],
  ["Reordered Stage 2 topics", "Ngozi A.", "Chidi E.", "2026-08-21"],
  ["Fixed typos in the skills list", "Amaka O.", "Ngozi A.", "2026-08-14"],
  ["Added Git and GitHub to Stage 1", "Chidi E.", "Amaka O.", "2026-08-07"],
  ["Updated the time-to-job estimate", "Ngozi A.", "Chidi E.", "2026-07-31"],
  ["Linked salary figures to a survey source", "Amaka O.", "Ngozi A.", "2026-07-24"],
  ["Removed an outdated course", "Chidi E.", "Amaka O.", "2026-07-17"],
  ["Rewrote the career overview", "Ngozi A.", "Chidi E.", "2026-07-10"],
  ["Drafted the roadmap stages", "Amaka O.", "Ngozi A.", "2026-07-03"],
];

/** Newest first. Dummy data until the backend keeps published versions. */
export const SEED_VERSIONS: CareerVersion[] = VERSION_ROWS.map(
  ([summary, editedBy, approvedBy, date], i) => ({
    version: VERSION_ROWS.length - i,
    summary,
    editedBy,
    approvedBy,
    publishedAt: `${date}T09:00:00.000Z`,
  }),
);
