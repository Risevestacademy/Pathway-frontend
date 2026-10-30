import { countTopics } from "./admin.editor.state";
import type { EditableCareer } from "./admin.editor.types";
import type { AdminCareerRow } from "./admin.utils";
import type {
  CareerAccess,
  ReportItem,
  ReviewItem,
  Role,
  TeamMember,
} from "./admin.workflow.types";

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

export const isOpenReport = (r: ReportItem) => r.status === "new" || r.status === "in-progress";

export const hasRole = (m: Pick<TeamMember, "roles">, ...roles: Role[]) =>
  roles.some((r) => m.roles.includes(r));

export function careerAccessLabel(access: CareerAccess): string {
  if (access === "all") return "All careers";
  return `${access.length} career${access.length === 1 ? "" : "s"}`;
}

/** Whether removing or demoting this person would leave the team without an admin. */
export function isLastAdmin(members: TeamMember[], id: string): boolean {
  const admins = members.filter((m) => m.roles.includes("admin"));
  return admins.length === 1 && admins[0].id === id;
}
