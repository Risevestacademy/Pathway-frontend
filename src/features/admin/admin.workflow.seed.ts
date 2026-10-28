import { DAY, HOUR } from "./admin.workflow.format";
import {
  OWNER_MEMBER_ID,
  REPORT_TITLE,
  type CareerVersion,
  type ReportItem,
  type ReviewItem,
  type TeamMember,
} from "./admin.workflow.types";

/**
 * Reviews, learner reports, team members and version history. All of this is
 * dummy data kept in the admin store until the backend has endpoints for it.
 */

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

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

/**
 * Stand-in for the signed-in admin until an endpoint lists users and their
 * roles. Set VITE_ADMIN_OWNER_EMAIL (and optionally VITE_ADMIN_OWNER_NAME) to
 * put that person on the team as an admin; without it nobody is seeded as one,
 * and so nobody can manage the team or review changes.
 */
export function getOwnerMember(): TeamMember | null {
  const email = import.meta.env.VITE_ADMIN_OWNER_EMAIL?.trim();
  if (!email) return null;
  return {
    id: OWNER_MEMBER_ID,
    name: import.meta.env.VITE_ADMIN_OWNER_NAME?.trim() || "Admin",
    email,
    roles: ["admin"],
    careerAccess: "all",
    lastActive: ago(5 * 60 * 1000),
  };
}

/** The seed team: the owner (when configured) followed by the dummy members. */
export const getSeedMembers = (): TeamMember[] => {
  const owner = getOwnerMember();
  return owner ? [owner, ...SEED_MEMBERS] : SEED_MEMBERS;
};

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

/** Newest first. */
export const SEED_VERSIONS: CareerVersion[] = VERSION_ROWS.map(
  ([summary, editedBy, approvedBy, date], i) => ({
    version: VERSION_ROWS.length - i,
    summary,
    editedBy,
    approvedBy,
    publishedAt: `${date}T09:00:00.000Z`,
  }),
);
