import type { FetchCareersParams } from "../features/careerDetail/career.types";
import type { FetchInvitesParams } from "./api/adminInvites.api";

/**
 * Every React Query key lives here. Hooks and the mutations that refresh them
 * must import from this file instead of typing keys inline, so a typo is a
 * compile error rather than a cache that quietly never refreshes.
 */
export const queryKeys = {
  careers: {
    all: ["careers"] as const,
    list: (params: FetchCareersParams) => ["careers", params] as const,
    detail: (careerId: string) => ["career", careerId] as const,
  },
  fields: ["fields"] as const,
  onboardingOptions: ["onboarding-options"] as const,
  pathway: (careerId: string) => ["pathway", careerId] as const,
  me: {
    /** The signed-in person's saved pathways and their progress. */
    pathways: ["me", "pathways"] as const,
    /** The pathway the signed-in person follows, with its steps and their state. */
    activePathway: ["me", "active-pathway"] as const,
  },
  realRoadmap: (careerId: string | null) => ["real-roadmap", careerId] as const,
  roadmapPreview: (userId: string, careerId: string) =>
    ["roadmap-preview", userId, careerId] as const,
  skillCheck: {
    all: ["skill-check"] as const,
    user: (userId: string) => ["skill-check", userId] as const,
    careers: (userId: string) => ["skill-check", userId, "careers"] as const,
    career: (careerId: string) => ["skill-check", "career", careerId] as const,
    record: (userId: string, careerId: string) =>
      ["skill-check", userId, "record", careerId] as const,
    activeCareer: (userId: string) => ["skill-check", userId, "active-career"] as const,
    ratings: (userId: string) => ["skill-check", userId, "ratings"] as const,
  },
  admin: {
    feedback: ["admin", "feedback"] as const,
    invites: {
      all: ["admin", "invites"] as const,
      list: (params: FetchInvitesParams) => ["admin", "invites", params] as const,
      accepted: ["admin", "invites", "accepted"] as const,
    },
  },
};
