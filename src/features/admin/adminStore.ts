import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CareerDraft } from "./admin.editor";
import type { AdminCareerRow, AdminStatus } from "./admin.utils";
import {
  SEED_MEMBERS,
  SEED_REPORTS,
  SEED_REVIEWS,
  isOpenReport,
  type ReportItem,
  type ReportStatus,
  type ReportType,
  type ReviewItem,
  type ReviewStatus,
  type TeamMember,
} from "./admin.workflow";

/**
 * Dummy data container for admin edits until the backend has write endpoints.
 * Created careers, status changes, saved editor drafts, reviews, learner
 * reports and team members live in localStorage, not the API. Replace the
 * actions with API calls (and drop this store) when they exist.
 */

export interface NewCareerInput {
  title: string;
  shortDescription: string;
  /** Copy roadmap and sources from this career. */
  copyFrom?: AdminCareerRow;
}

export interface NewReportInput {
  type: ReportType;
  title: string;
  message: string;
  careerId: string;
  careerTitle: string;
  stepTitle: string;
  resourceId: string;
  resourceTitle: string;
}

interface AdminState {
  created: AdminCareerRow[];
  /** Status changes for any career by id, including API ones. */
  statusOverrides: Record<string, AdminStatus>;
  /** Saved editor drafts by career id. */
  drafts: Record<string, CareerDraft>;
  reviews: ReviewItem[];
  reports: ReportItem[];
  members: TeamMember[];

  addCareer: (input: NewCareerInput) => void;
  setStatus: (id: string, status: AdminStatus) => void;
  saveDraft: (id: string, draft: CareerDraft) => void;

  addReview: (review: Omit<ReviewItem, "id" | "status">) => void;
  decideReview: (id: string, status: ReviewStatus, note: string) => void;

  /** Learners reporting the same open problem on a resource are counted together. */
  addReport: (input: NewReportInput) => void;
  updateReport: (id: string, patch: Partial<ReportItem>) => void;
  /** Closes the report and every other open report about the same resource and problem. */
  closeReport: (id: string, status: Extract<ReportStatus, "fixed" | "not-an-issue">) => void;
  replaceResourceLink: (careerId: string, resourceId: string, url: string) => void;

  addMember: (member: Omit<TeamMember, "id">) => void;
  updateMember: (id: string, patch: Partial<TeamMember>) => void;
  removeMember: (id: string) => void;

  reset: () => void;
}

/** Ids of careers created in the browser start with this ("local-<uuid>"). */
export const LOCAL_ID_PREFIX = "local-";

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const initialWorkflow = () => ({
  reviews: SEED_REVIEWS,
  reports: SEED_REPORTS,
  members: SEED_MEMBERS,
});

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      created: [],
      statusOverrides: {},
      drafts: {},
      ...initialWorkflow(),

      addCareer: ({ title, shortDescription, copyFrom }) =>
        set((state) => ({
          created: [
            {
              id: newId("local"),
              title,
              shortDescription,
              status: "draft",
              stepCount: copyFrom?.stepCount ?? 0,
              sources: copyFrom?.sources ?? { health: "missing", label: "Missing outlook" },
              updatedAt: new Date().toISOString(),
              isLocal: true,
            },
            ...state.created,
          ],
        })),
      setStatus: (id, status) =>
        set((state) => ({ statusOverrides: { ...state.statusOverrides, [id]: status } })),
      saveDraft: (id, draft) =>
        set((state) => ({ drafts: { ...state.drafts, [id]: draft } })),

      addReview: (review) =>
        set((state) => ({
          reviews: [
            // A newer submission replaces the earlier pending one for the same career.
            ...state.reviews.filter(
              (r) => !(r.status === "pending" && review.careerId && r.careerId === review.careerId),
            ),
            { ...review, id: newId("review"), status: "pending" },
          ],
        })),
      decideReview: (id, status, note) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, status, decisionNote: note.trim(), decidedAt: new Date().toISOString() }
              : r,
          ),
        })),

      addReport: (input) =>
        set((state) => {
          const duplicate = state.reports.find(
            (r) => isOpenReport(r) && r.resourceId === input.resourceId && r.type === input.type,
          );
          if (duplicate) {
            return {
              reports: state.reports.map((r) =>
                r.id === duplicate.id ? { ...r, count: r.count + 1 } : r,
              ),
            };
          }
          return {
            reports: [
              {
                ...input,
                id: newId("report"),
                reportedAt: new Date().toISOString(),
                status: "new",
                assignedTo: null,
                note: "",
                count: 1,
              },
              ...state.reports,
            ],
          };
        }),
      updateReport: (id, patch) =>
        set((state) => ({
          reports: state.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      closeReport: (id, status) =>
        set((state) => {
          const target = state.reports.find((r) => r.id === id);
          return {
            reports: state.reports.map((r) => {
              const related =
                target &&
                isOpenReport(r) &&
                r.resourceId === target.resourceId &&
                r.type === target.type;
              return r.id === id || related ? { ...r, status } : r;
            }),
          };
        }),
      replaceResourceLink: (careerId, resourceId, url) =>
        set((state) => {
          const draft = state.drafts[careerId];
          if (!draft) return {};
          return {
            drafts: {
              ...state.drafts,
              [careerId]: {
                ...draft,
                resources: draft.resources.map((r) =>
                  r.id === resourceId
                    ? { ...r, url, linkStatus: "not-checked", lastChecked: null }
                    : r,
                ),
              },
            },
          };
        }),

      addMember: (member) =>
        set((state) => ({ members: [...state.members, { ...member, id: newId("member") }] })),
      updateMember: (id, patch) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          // Reports assigned to them go back to the pool.
          reports: state.reports.map((r) => (r.assignedTo === id ? { ...r, assignedTo: null } : r)),
        })),

      reset: () =>
        set({ created: [], statusOverrides: {}, drafts: {}, ...initialWorkflow() }),
    }),
    { name: "pathway-admin-dummy-data" },
  ),
);
