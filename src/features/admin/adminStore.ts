import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CareerDraft } from "./admin.editor";
import type { AdminCareerRow, AdminStatus } from "./admin.utils";
import {
  getSeedMembers,
  SEED_REPORTS,
  SEED_REVIEWS,
  type ReportItem,
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
  /** Forgets a career's local copy, status change and saved draft. */
  removeCareer: (id: string) => void;
  setStatus: (id: string, status: AdminStatus) => void;
  saveDraft: (id: string, draft: CareerDraft) => void;

  addReview: (review: Omit<ReviewItem, "id" | "status">) => void;
  decideReview: (id: string, status: ReviewStatus, note: string) => void;

  replaceResourceLink: (careerId: string, resourceId: string, url: string) => void;

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
  members: getSeedMembers(),
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
      removeCareer: (id) =>
        set((state) => {
          const statusOverrides = { ...state.statusOverrides };
          const drafts = { ...state.drafts };
          delete statusOverrides[id];
          delete drafts[id];
          return {
            created: state.created.filter((c) => c.id !== id),
            statusOverrides,
            drafts,
          };
        }),
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
    {
      name: "pathway-admin-dummy-data",
      version: 5,
      // Earlier versions saved dummy team members in the browser. The team is
      // now just the configured admin, plus whoever accepted an invite.
      migrate: (persisted) =>
        ({ ...(persisted as Partial<AdminState>), members: getSeedMembers() }) as AdminState,
    },
  ),
);
