import type { FetchCareersParams } from "../features/careerDetail/career.types";
import type { FetchInvitesParams } from "./api/adminInvites.api";
import type { FetchOpportunitiesParams } from "@/features/opportunities/opportunities.type";

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
  pathwayDetail: (pathwayId: string) => ["pathway-detail", pathwayId] as const,
  /** Each resource with the signed-in person's completion, so it is per person. */
  pathwayResources: (userId: string, pathwayId: string) =>
    ["pathway-resources", userId, pathwayId] as const,
  /** Each task with the signed-in person's completion and checklist counts. */
  pathwayTasks: (userId: string, pathwayId: string) =>
    ["pathway-tasks", userId, pathwayId] as const,
  /** One task's page: its checklist with the person's ticks, so it is per person. */
  pathwayTask: (userId: string, pathwayId: string, taskId: string) =>
    ["pathway-task", userId, pathwayId, taskId] as const,
  /** One resource's detail, as read from a given step (which sets its usage note). */
  pathwayResource: (
    userId: string,
    pathwayId: string,
    resourceId: string,
    stepId: string | null,
  ) => ["pathway-resource", userId, pathwayId, resourceId, stepId] as const,
  stageQuiz: {
    all: ["stage-quiz"] as const,
    questions: (pathwayId: string, stageId: string) =>
      ["stage-quiz", pathwayId, stageId, "questions"] as const,
    result: (pathwayId: string, stageId: string) =>
      ["stage-quiz", pathwayId, stageId, "result"] as const,
    /** What a submit returned (XP, streak), handed to the result page once. */
    submission: (careerId: string, stageId: string) =>
      ["stage-quiz", "submission", careerId, stageId] as const,
  },
  profile: (userId: string) => ["profile", userId] as const,
  progress: {
    all: ["progress"] as const,
    active: (userId: string) => ["progress", userId, "active"] as const,
    saved: (userId: string) => ["progress", userId, "saved"] as const,
  },
  realRoadmap: (careerId: string | null) => ["real-roadmap", careerId] as const,
  skillCheck: {
    all: ["skill-check"] as const,
    user: (userId: string) => ["skill-check", userId] as const,
    careers: (userId: string) => ["skill-check", userId, "careers"] as const,
    career: (careerId: string) => ["skill-check", "career", careerId] as const,
    record: (userId: string, careerId: string) =>
      ["skill-check", userId, "record", careerId] as const,
    activeCareer: (userId: string) =>
      ["skill-check", userId, "active-career"] as const,
    ratings: (userId: string) => ["skill-check", userId, "ratings"] as const,
  },
  admin: {
    feedback: ["admin", "feedback"] as const,
    invites: {
      all: ["admin", "invites"] as const,
      list: (params: FetchInvitesParams) =>
        ["admin", "invites", params] as const,
      accepted: ["admin", "invites", "accepted"] as const,
    },
    careers: {
      all: ["admin", "careers"] as const,
      list: ["admin", "careers", "list"] as const,
      detail: (careerId: string) =>
        ["admin", "careers", "detail", careerId] as const,
    },
  },
  opportunities: {
    list: (params: FetchOpportunitiesParams) =>
      ["opportunities", params] as const,
  },
};
